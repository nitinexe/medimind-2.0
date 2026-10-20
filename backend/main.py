
import base64
from io import BytesIO
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# --------------------------------------------------
# Configuration
# --------------------------------------------------

MODEL_PATH = Path(__file__).parent / "models" / "pose_landmarker_full.task"

VISIBILITY_THRESHOLD = 0.6
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

LANDMARK_NAMES = {
    0: "nose",
    11: "left_shoulder",
    12: "right_shoulder",
    13: "left_elbow",
    14: "right_elbow",
    15: "left_wrist",
    16: "right_wrist",
    23: "left_hip",
    24: "right_hip",
    25: "left_knee",
    26: "right_knee",
    27: "left_ankle",
    28: "right_ankle",
}

# MediaPipe pose landmark connections used for the overlay.
SKELETON_CONNECTIONS = [
    (11, 12),
    (11, 13),
    (13, 15),
    (12, 14),
    (14, 16),
    (11, 23),
    (12, 24),
    (23, 24),
    (23, 25),
    (25, 27),
    (24, 26),
    (26, 28),
]


# --------------------------------------------------
# FastAPI app
# --------------------------------------------------

app = FastAPI(
    title="MediMind AI API",
    description="AI-assisted posture image analysis API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Pose detector
# --------------------------------------------------

if not MODEL_PATH.exists():
    raise RuntimeError(
        f"Pose model not found at: {MODEL_PATH}. "
        "Check that pose_landmarker_full.task exists "
        "inside backend/models/."
    )

base_options = python.BaseOptions(
    model_asset_path=str(MODEL_PATH)
)

pose_options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.IMAGE,
    num_poses=1,
)

pose_detector = vision.PoseLandmarker.create_from_options(
    pose_options
)


# --------------------------------------------------
# Measurement helper
# --------------------------------------------------

def measure_vertical_alignment(
    left_point,
    right_point,
    threshold=VISIBILITY_THRESHOLD,
):
    """
    Compare the vertical image positions of two landmarks.

    Positive signed difference means the left landmark
    appears lower in the image than the right landmark.

    This is an image-based geometric measurement, not a
    clinical diagnosis or a measurement in physical units.
    """

    left_visibility = float(
        getattr(left_point, "visibility", 0.0)
    )
    right_visibility = float(
        getattr(right_point, "visibility", 0.0)
    )

    if (
        left_visibility < threshold
        or right_visibility < threshold
    ):
        return {
            "measurement_available": False,
            "signed_difference": None,
            "difference": None,
            "left_visibility": left_visibility,
            "right_visibility": right_visibility,
            "interpretation": (
                "Insufficient landmark visibility to measure."
            ),
        }

    signed_difference = float(
        left_point.y - right_point.y
    )
    difference = abs(signed_difference)

    if abs(signed_difference) < 0.01:
        interpretation = (
            "The landmarks appear approximately level "
            "in this image."
        )
    elif signed_difference > 0:
        interpretation = (
            "The left landmark appears lower in the image."
        )
    else:
        interpretation = (
            "The left landmark appears higher in the image."
        )

    return {
        "measurement_available": True,
        "signed_difference": round(signed_difference, 5),
        "difference": round(difference, 5),
        "left_visibility": round(left_visibility, 3),
        "right_visibility": round(right_visibility, 3),
        "interpretation": interpretation,
    }


# --------------------------------------------------
# Annotated image helper
# --------------------------------------------------

def annotate_posture_image(
    image_rgb,
    landmarks,
    measurements,
):
    """
    Draw skeleton connections, landmark dots, and
    shoulder/hip alignment measurements on an image.

    Returns a Base64-encoded JPEG string.
    """

    image = cv2.cvtColor(
        image_rgb,
        cv2.COLOR_RGB2BGR,
    )

    height, width = image.shape[:2]

    def point_xy(index):
        landmark = landmarks[index]

        x = int(landmark.x * width)
        y = int(landmark.y * height)

        # Keep coordinates inside the image.
        x = max(0, min(x, width - 1))
        y = max(0, min(y, height - 1))

        return x, y

    # Draw skeleton connections.
    for start, end in SKELETON_CONNECTIONS:
        if (
            landmarks[start].visibility
            >= VISIBILITY_THRESHOLD
            and landmarks[end].visibility
            >= VISIBILITY_THRESHOLD
        ):
            cv2.line(
                image,
                point_xy(start),
                point_xy(end),
                (255, 190, 0),
                2,
                cv2.LINE_AA,
            )

    # Draw dots at detected landmarks.
    for index in LANDMARK_NAMES:
        landmark = landmarks[index]

        if landmark.visibility < VISIBILITY_THRESHOLD:
            continue

        x, y = point_xy(index)

        cv2.circle(
            image,
            (x, y),
            7,
            (255, 255, 255),
            -1,
            cv2.LINE_AA,
        )

        cv2.circle(
            image,
            (x, y),
            4,
            (30, 80, 255),
            -1,
            cv2.LINE_AA,
        )

    # Draw measurement lines and labels.
    alignment_items = [
        (
            "SHOULDERS",
            11,
            12,
            measurements["shoulder_vertical_alignment"],
        ),
        (
            "HIPS",
            23,
            24,
            measurements["hip_vertical_alignment"],
        ),
    ]

    for (
        label,
        left_index,
        right_index,
        measurement,
    ) in alignment_items:

        if not measurement["measurement_available"]:
            continue

        left_x, left_y = point_xy(left_index)
        right_x, right_y = point_xy(right_index)

        cv2.line(
            image,
            (left_x, left_y),
            (right_x, right_y),
            (0, 220, 100),
            3,
            cv2.LINE_AA,
        )

        difference = measurement["difference"]
        percent = difference * 100

        text = (
            f"{label}: {percent:.2f}% image height"
        )

        text_y = 35 if label == "SHOULDERS" else 70

        # Dark outline for readable text.
        cv2.putText(
            image,
            text,
            (16, text_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.58,
            (0, 0, 0),
            4,
            cv2.LINE_AA,
        )

        cv2.putText(
            image,
            text,
            (16, text_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.58,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )

    success, encoded = cv2.imencode(
        ".jpg",
        image,
        [int(cv2.IMWRITE_JPEG_QUALITY), 90],
    )

    if not success:
        raise RuntimeError(
            "Could not encode the annotated image."
        )

    return base64.b64encode(
        encoded.tobytes()
    ).decode("utf-8")


# --------------------------------------------------
# Basic endpoints
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to MediMind AI API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "MediMind AI",
        "pose_model_loaded": MODEL_PATH.exists(),
    }


# --------------------------------------------------
# Posture image analysis endpoint
# --------------------------------------------------

@app.post("/api/v1/posture/image")
async def analyze_posture_image(
    file: UploadFile = File(...),
):
    # Validate file type.
    allowed_content_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported image type. "
                "Upload a JPEG, PNG, or WEBP image."
            ),
        )

    # Read the upload and enforce the size limit.
    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image exceeds the 10 MB size limit.",
        )

    # Decode the image.
    try:
        with Image.open(BytesIO(image_bytes)) as source:
            source.verify()

        with Image.open(BytesIO(image_bytes)) as source:
            image = source.convert("RGB")

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        )

    width, height = image.size

    if width < 2 or height < 2:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image dimensions are invalid.",
        )

    rgb_image = np.asarray(image)

    # Run MediaPipe pose detection.
    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb_image,
    )

    try:
        result = pose_detector.detect(mp_image)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Pose detection failed: {str(exc)}",
        ) from exc

    # Return a useful response if no pose is detected.
    if not result.pose_landmarks:
        return {
            "success": True,
            "detected": False,
            "image_dimensions": {
                "width": width,
                "height": height,
            },
            "measurements": None,
            "landmarks": {},
            "quality_check": {
                "sufficient_visibility": False,
                "warnings": [
                    "No human pose was detected. "
                    "Try a clearer, well-lit image showing "
                    "the full body."
                ],
            },
            "annotated_image": None,
            "annotation_format": None,
            "clinical_status": "not_clinically_validated",
            "disclaimer": (
                "This tool provides experimental, "
                "image-based observations and is not a "
                "medical diagnosis."
            ),
        }

    landmarks = result.pose_landmarks[0]

    # Calculate shoulder and hip alignment.
    shoulder_alignment = measure_vertical_alignment(
        landmarks[11],
        landmarks[12],
    )

    hip_alignment = measure_vertical_alignment(
        landmarks[23],
        landmarks[24],
    )

    # Extract selected landmark coordinates.
    selected_landmarks = {}

    for index, name in LANDMARK_NAMES.items():
        landmark = landmarks[index]

        selected_landmarks[name] = {
            "x": round(float(landmark.x), 5),
            "y": round(float(landmark.y), 5),
            "z": round(float(landmark.z), 5),
            "visibility": round(
                float(landmark.visibility),
                3,
            ),
        }

    # Check visibility of important body landmarks.
    important_indices = [
        11, 12, 23, 24, 25, 26, 27, 28
    ]

    low_visibility = [
        LANDMARK_NAMES[index]
        for index in important_indices
        if landmarks[index].visibility
        < VISIBILITY_THRESHOLD
    ]

    warnings = []

    if low_visibility:
        warnings.append(
            "Some body landmarks have low visibility: "
            + ", ".join(low_visibility)
            + ". Measurements may be unreliable."
        )

    if not shoulder_alignment["measurement_available"]:
        warnings.append(
            "Shoulder alignment could not be measured "
            "reliably."
        )

    if not hip_alignment["measurement_available"]:
        warnings.append(
            "Hip alignment could not be measured reliably."
        )

    quality_check = {
        "sufficient_visibility": len(low_visibility) == 0,
        "low_visibility_landmarks": low_visibility,
        "warnings": warnings,
    }

    measurements = {
        "shoulder_vertical_alignment": shoulder_alignment,
        "hip_vertical_alignment": hip_alignment,
    }

    # IMPORTANT: Generate the annotated image BEFORE
    # using annotated_image_base64 in the response.
    try:
        annotated_image_base64 = annotate_posture_image(
            rgb_image,
            landmarks,
            measurements,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not create the annotated image: "
                + str(exc)
            ),
        ) from exc

    # Return the analysis and annotated image.
    return {
        "success": True,
        "detected": True,
        "image_dimensions": {
            "width": width,
            "height": height,
        },
        "measurements": measurements,
        "landmarks": selected_landmarks,
        "quality_check": quality_check,
        "annotated_image": (
            "data:image/jpeg;base64,"
            + annotated_image_base64
        ),
        "annotation_format": "jpeg_base64",
        "clinical_status": "not_clinically_validated",
        "disclaimer": (
            "This experimental tool reports geometric "
            "observations from a 2D image. Camera angle, "
            "body rotation, perspective, clothing, and "
            "landmark detection errors can affect results. "
            "It is not a diagnosis or a substitute for "
            "assessment by a qualified healthcare professional."
        ),
    }
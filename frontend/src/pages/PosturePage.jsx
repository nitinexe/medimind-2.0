
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  Upload,
  Trash2,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const API_URL = "http://127.0.0.1:8000/api/v1/posture/image";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const IGNORED_MEASUREMENT_KEYS = new Set([
  "measurement_available",
  "interpretation",
  "landmarks",
  "selected_landmarks",
  "pose_landmarks",
  "warnings",
  "quality_warnings",
]);

function humanizeLabel(value) {
  return String(value)
    .replace(/[_.]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function displayValue(value) {
  if (value === null || value === undefined) {
    return "Not available";
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? Number(value.toFixed(3)).toString()
      : "Not available";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string") {
    return value.trim() || "Not available";
  }

  return JSON.stringify(value);
}

/*
 * Extract measurable values recursively.
 * Supports both flat objects and nested measurement objects.
 */
function getScalarMeasurements(value, prefix = "") {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => {
      const itemPrefix = `${prefix}.${index}`;

      if (item && typeof item === "object") {
        return getScalarMeasurements(item, itemPrefix);
      }

      if (
        typeof item === "number" ||
        typeof item === "boolean" ||
        (typeof item === "string" && item.trim())
      ) {
        return [[itemPrefix, item]];
      }

      return [];
    });
  }

  return Object.entries(value).flatMap(([key, child]) => {
    if (IGNORED_MEASUREMENT_KEYS.has(key.toLowerCase())) {
      return [];
    }

    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (child && typeof child === "object") {
      return getScalarMeasurements(child, fullKey);
    }

    if (
      typeof child === "number" ||
      typeof child === "boolean" ||
      (typeof child === "string" && child.trim().length > 0)
    ) {
      return [[fullKey, child]];
    }

    return [];
  });
}

function findNestedField(value, fieldName) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  if (!Array.isArray(value) && fieldName in value) {
    return value[fieldName];
  }

  for (const child of Object.values(value)) {
    if (child && typeof child === "object") {
      const found = findNestedField(child, fieldName);

      if (found !== undefined) {
        return found;
      }
    }
  }

  return undefined;
}

function getFinalRemark(measurements) {
  if (!measurements || typeof measurements !== "object") {
    return {
      title: "Measurements are unavailable",
      message:
        "The analysis did not return a usable measurement object. Please try a clear, well-lit image with your body fully visible.",
    };
  }

  const availability = findNestedField(
    measurements,
    "measurement_available"
  );

  const interpretation = findNestedField(
    measurements,
    "interpretation"
  );

  if (availability === false) {
    return {
      title: "Alignment could not be measured reliably",
      message:
        "The required body landmarks could not be measured reliably in this image. Try another clear photograph with your body visible and the camera facing you.",
    };
  }

  return {
    title: "Your posture image summary",
    message:
      typeof interpretation === "string" && interpretation.trim()
        ? `${interpretation.trim()} This describes detected positions in the photograph and does not establish whether your posture is medically normal or abnormal.`
        : "The system analyzed the available body landmarks and image-based measurements. These observations alone cannot determine whether your posture is medically correct or whether you have an injury.",
  };
}

function getWarnings(result) {
  const rawWarnings =
    result?.quality_warnings ??
    result?.warnings ??
    result?.quality?.warnings ??
    [];

  if (Array.isArray(rawWarnings)) {
    return rawWarnings;
  }

  return rawWarnings ? [rawWarnings] : [];
}

function PosturePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const onboardingMode =
    new URLSearchParams(location.search).get("onboarding") === "1";

  const [user, setUser] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [savedAnalysis, setSavedAnalysis] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          navigate("/login", { replace: true });
          return;
        }

        const currentUser = data.user;

        const [profileResult, analysisResult] = await Promise.all([
          supabase
            .from("health_profiles")
            .select("user_id")
            .eq("user_id", currentUser.id)
            .maybeSingle(),

          supabase
            .from("posture_analyses")
            .select("id")
            .eq("user_id", currentUser.id)
            .limit(1),
        ]);

        if (!active) return;

        if (profileResult.error) throw profileResult.error;
        if (analysisResult.error) throw analysisResult.error;

        const hasProfile = Boolean(profileResult.data);
        const hasAnalysis =
          (analysisResult.data?.length ?? 0) > 0;

        if (!hasProfile) {
          navigate("/onboarding", { replace: true });
          return;
        }

        if (onboardingMode && hasAnalysis) {
          navigate("/dashboard", { replace: true });
          return;
        }

        if (!onboardingMode && !hasAnalysis) {
          navigate("/onboarding", { replace: true });
          return;
        }

        setUser(currentUser);
        setCheckingAccess(false);
      } catch (error) {
        if (!active) return;

        setErrorMessage(
          error.message ||
            "We couldn't verify your account setup. Please try again."
        );
        setCheckingAccess(false);
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [navigate, onboardingMode]);

  useEffect(() => {
    if (!preview) return undefined;

    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function handleFileChange(event) {
    const selected = event.target.files?.[0];

    if (!selected) return;

    setErrorMessage("");
    setAnalysisResult(null);
    setSavedAnalysis(null);

    if (!ALLOWED_IMAGE_TYPES.includes(selected.type)) {
      setFile(null);
      setPreview("");
      setErrorMessage("Please choose a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (selected.size > MAX_IMAGE_SIZE) {
      setFile(null);
      setPreview("");
      setErrorMessage("Your image must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleAnalyze(event) {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please choose an image first.");
      return;
    }

    if (!user) {
      setErrorMessage("Your session has expired. Please sign in again.");
      navigate("/login", { replace: true });
      return;
    }

    setAnalyzing(true);
    setErrorMessage("");
    setAnalysisResult(null);
    setSavedAnalysis(null);

    try {
      // Send the image to the existing FastAPI endpoint.
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const apiResult = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof apiResult.detail === "string"
            ? apiResult.detail
            : null;

        throw new Error(
          detail ||
            `The posture API returned status ${response.status}.`
        );
      }

      // Support the known measurements field and common wrappers.
      const returnedMeasurements =
        apiResult.measurements ??
        apiResult.data?.measurements ??
        apiResult.result?.measurements ??
        null;

      if (
        !returnedMeasurements ||
        typeof returnedMeasurements !== "object"
      ) {
        console.error("Actual posture API response:", apiResult);

        throw new Error(
          "The API did not return a measurements object. Check the browser console for the actual response."
        );
      }

      const warnings = getWarnings(apiResult);

      const rawStatus =
        apiResult.clinical_status ??
        apiResult.status ??
        null;

      const storedStatus =
        typeof rawStatus === "string"
          ? rawStatus
          : rawStatus == null
            ? null
            : JSON.stringify(rawStatus);

      // Keep the response available for display.
      setAnalysisResult({
        ...apiResult,
        measurements: returnedMeasurements,
      });

      // Save the record for the authenticated user.
      const { data: saved, error: saveError } = await supabase
        .from("posture_analyses")
        .insert({
          user_id: user.id,
          image_name: file.name,
          measurements: returnedMeasurements,
          warnings,
          clinical_status: storedStatus,
        })
        .select(
          "id, image_name, measurements, warnings, clinical_status, created_at"
        )
        .single();

      if (saveError) {
        throw new Error(
          `Image analysis completed, but saving the result failed: ${saveError.message}`
        );
      }

      setSavedAnalysis(saved);
    } catch (error) {
      console.error("Posture analysis error:", error);

      setErrorMessage(
        error.message ||
          "Analysis could not be completed. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function handleAnotherImage() {
    setFile(null);
    setPreview("");
    setAnalysisResult(null);
    setSavedAnalysis(null);
    setErrorMessage("");
  }

  if (checkingAccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#071b1a]">
        <LoaderCircle
          size={30}
          className="animate-spin text-teal-300"
        />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#071b1a] px-5 text-white">
        <div className="max-w-lg rounded-2xl border border-white/10 bg-[#0d2423] p-6">
          <p className="text-sm leading-7 text-red-200">
            {errorMessage || "Unable to verify your account."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-[#071b1a]"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const measurements = analysisResult?.measurements;
  const finalRemark = getFinalRemark(measurements);
  const warnings = getWarnings(analysisResult);

  const scalarMeasurements =
    getScalarMeasurements(measurements);

  return (
    <div className="min-h-screen bg-[#f5f8f7] text-slate-900">
      <header className="bg-[#071b1a] text-white">
        <div className="mx-auto flex min-h-[76px] max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-300 text-[#071b1a]">
              <HeartPulse size={23} />
            </span>
            <span className="text-lg font-bold">MediMind AI</span>
          </Link>

          <Link
            to={onboardingMode ? "/onboarding" : "/dashboard"}
            className="text-sm text-slate-300 transition hover:text-teal-200"
          >
            {onboardingMode ? "Setup" : "Dashboard"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-9 sm:px-8 sm:py-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
            {onboardingMode
              ? "Your first analysis · Step 2 of 2"
              : "Posture analysis"}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {onboardingMode
              ? "Let's complete your first analysis."
              : "Understand your posture image."}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Upload a clear photograph to detect body landmarks and review
            image-based alignment measurements. This experimental tool
            cannot diagnose injuries or confirm that a posture is
            medically normal.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Upload panel */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-semibold">Choose an image</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              JPG, PNG, or WEBP. Maximum size: 10 MB.
            </p>

            <form onSubmit={handleAnalyze} className="mt-6">
              <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-teal-400 hover:bg-teal-50/40">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />

                {preview ? (
                  <img
                    src={preview}
                    alt="Selected posture image"
                    className="max-h-72 max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <>
                    <span className="grid size-14 place-items-center rounded-2xl bg-teal-100 text-teal-800">
                      <ImagePlus size={25} />
                    </span>

                    <span className="mt-4 text-sm font-semibold text-slate-800">
                      Select a posture image
                    </span>

                    <span className="mt-2 text-xs leading-5 text-slate-500">
                      Choose a clear, well-lit photo with your body visible.
                    </span>
                  </>
                )}
              </label>

              {file && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <Upload size={18} className="shrink-0 text-teal-800" />

                  <div className="min-w-0 flex-1">
                    <p className="break-all text-xs font-semibold text-slate-800">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  {!analyzing && (
                    <button
                      type="button"
                      aria-label="Remove selected image"
                      onClick={handleAnotherImage}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!file || analyzing || Boolean(savedAnalysis)}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {analyzing ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Analyzing and saving...
                  </>
                ) : (
                  <>
                    <Activity size={18} />
                    Analyze posture
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-xs leading-6 text-slate-500">
              Experimental image observations only. This tool cannot
              confirm or rule out fractures, dislocations, or other injuries.
            </p>
          </section>

          {/* Results panel */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-800">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">Your results</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Measurements and plain-language remarks
                </p>
              </div>
            </div>

            {!savedAnalysis ? (
              <div className="flex min-h-64 flex-col items-center justify-center py-8 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                  <ImagePlus size={24} />
                </span>

                <p className="mt-4 text-sm font-semibold text-slate-800">
                  Your results will appear here
                </p>

                <p className="mt-2 max-w-xs text-xs leading-6 text-slate-500">
                  Select an image and run the analysis. Results appear
                  after the API succeeds and Supabase saves the record.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {analysisResult?.annotated_image ? (
                  <img
                    src={analysisResult.annotated_image}
                    alt="Annotated posture image showing detected landmarks"
                    className="max-h-80 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
                  />
                ) : (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    The analysis was saved successfully, but no annotated
                    image was returned by the API.
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-teal-800"
                  />
                  <div>
                    <p className="text-sm font-semibold text-teal-900">
                      Analysis saved successfully
                    </p>
                    <p className="mt-1 text-xs leading-6 text-teal-800">
                      Your measurement record is associated with your
                      signed-in account.
                    </p>
                  </div>
                </div>

                {/* Measurements */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Measurements returned by the model
                  </h3>

                  {scalarMeasurements.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {scalarMeasurements.map(([key, value]) => (
                        <div
                          key={key}
                          className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-[10px] leading-5 text-slate-500">
                            {humanizeLabel(key)}
                          </p>

                          <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                            {displayValue(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-900">
                        No individual measurement values were found.
                      </p>
                      <p className="mt-2 text-xs leading-6 text-amber-800">
                        The response structure is shown below so we can
                        identify the exact field names returned by your
                        backend.
                      </p>
                      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-xs leading-5 text-slate-700">
                        {JSON.stringify(measurements, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Plain-language final remark */}
                <section className="rounded-2xl border border-teal-200 bg-teal-50/70 p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-800">
                      <Activity size={21} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                        Final remark
                      </p>

                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {finalRemark.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        {finalRemark.message}
                      </p>

                      {typeof measurements?.difference === "number" && (
                        <div className="mt-4 rounded-xl border border-teal-200/80 bg-white p-4">
                          <p className="text-xs font-medium text-slate-500">
                            Reported image difference
                          </p>

                          <p className="mt-1 text-2xl font-semibold text-slate-950">
                            {Number(measurements.difference.toFixed(3))}
                          </p>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            This value follows the backend's image-coordinate
                            convention. It is not a clinical severity score,
                            a physical measurement in centimetres, or a diagnosis.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Bone injury disclaimer */}
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={21}
                      className="mt-0.5 shrink-0 text-amber-800"
                    />

                    <div>
                      <h3 className="font-semibold text-amber-950">
                        About bone injuries and dislocations
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-amber-900">
                        This photograph-based posture tool cannot determine
                        whether you have a fracture, bone injury, or dislocated
                        joint, and cannot rule these conditions out. If you
                        suspect an injury, seek assessment from a qualified
                        healthcare professional.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Image-quality warnings */}
                {warnings.length > 0 && (
                  <section className="rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Image quality notes
                    </h3>

                    <ul className="mt-3 space-y-2">
                      {warnings.map((warning, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-xs leading-6 text-slate-600"
                        >
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-600" />
                          <span>
                            {typeof warning === "string"
                              ? warning
                              : JSON.stringify(warning)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {analysisResult?.disclaimer && (
                  <p className="text-xs leading-6 text-slate-500">
                    {analysisResult.disclaimer}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/dashboard", { replace: true })}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  Continue to dashboard
                  <ArrowRight size={18} />
                </button>

                {!onboardingMode && (
                  <button
                    type="button"
                    onClick={handleAnotherImage}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Upload size={16} />
                    Analyze another image
                  </button>
                )}

                <p className="text-xs leading-6 text-slate-500">
                  This version saves the image filename, measurements,
                  warnings, and timestamp. It does not store the uploaded
                  image file in Supabase Storage.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default PosturePage;
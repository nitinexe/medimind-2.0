
const recommendations = [];

function addRecommendation(list, level, title, message, action) {
  list.push({ level, title, message, action });
}

export function assessHealth(readings = []) {
  const tips = [];

  if (!readings.length) {
    return {
      status: "insufficient_data",
      title: "More information needed",
      summary:
        "Record your health measurements to receive personalized guidance.",
      tips: [
        {
          level: "info",
          title: "Start with a measurement",
          message:
            "Record your blood pressure, pulse, or another available vital measurement.",
          action: "Add a health measurement",
        },
      ],
    };
  }

  // Use the latest available reading for each individual metric.
  const latest = {};

  for (const reading of readings) {
    for (const key of [
      "systolic_mmhg",
      "diastolic_mmhg",
      "pulse_bpm",
      "blood_glucose_mg_dl",
      "oxygen_saturation_percent",
      "temperature_c",
    ]) {
      if (latest[key] == null && reading[key] != null) {
        latest[key] = reading[key];
      }
    }
  }

  let needsAttention = false;
  let urgent = false;

  // Blood pressure: adult screening guidance only.
  const systolic = latest.systolic_mmhg;
  const diastolic = latest.diastolic_mmhg;

  if (systolic != null && diastolic != null) {
    if (systolic >= 180 || diastolic >= 120) {
      urgent = true;
      addRecommendation(
        tips,
        "urgent",
        "Very high blood pressure reading",
        "Sit quietly and repeat the measurement after at least one minute. If it remains this high, seek immediate medical advice. If you have chest pain, shortness of breath, weakness, numbness, vision changes, or difficulty speaking, contact emergency services.",
        "Repeat the measurement and seek appropriate medical care"
      );
    } else if (systolic >= 140 || diastolic >= 90) {
      needsAttention = true;
      addRecommendation(
        tips,
        "attention",
        "High blood pressure reading",
        "This reading is in a high range for adults. Rest quietly, check your measurement technique, and record another reading. Arrange a healthcare professional review, especially if readings remain high.",
        "Recheck and track blood pressure"
      );
    } else if (systolic >= 130 || diastolic >= 80) {
      needsAttention = true;
      addRecommendation(
        tips,
        "monitor",
        "Blood pressure worth monitoring",
        "This reading is above the optimal adult range. Track readings under consistent resting conditions and discuss repeated elevations with a healthcare professional.",
        "Continue monitoring blood pressure"
      );
    } else {
      addRecommendation(
        tips,
        "positive",
        "Blood pressure reading",
        "This single reading is below the adult high blood pressure thresholds used in this screening. One reading alone cannot establish overall health.",
        "Continue routine monitoring"
      );
    }
  }

  // Pulse: interpret cautiously because activity, medication, and symptoms matter.
  const pulse = latest.pulse_bpm;

  if (pulse != null) {
    if (pulse < 40 || pulse > 130) {
      needsAttention = true;
      addRecommendation(
        tips,
        "attention",
        "Pulse outside the usual resting range",
        "If this was measured at rest, repeat it after sitting quietly. Seek prompt medical advice if it remains unusual. If you have chest pain, fainting, severe breathlessness, or severe dizziness, seek emergency care.",
        "Recheck pulse at rest"
      );
    } else if (pulse < 60 || pulse > 100) {
      addRecommendation(
        tips,
        "monitor",
        "Pulse worth checking",
        "This pulse may be outside the usual adult resting range. Exercise, stress, fever, medicines, and fitness can affect pulse. Recheck at rest and seek advice if it persists or you have symptoms.",
        "Record a resting pulse"
      );
    }
  }

  // Oxygen saturation: readings can vary with device accuracy and individual conditions.
  const oxygen = latest.oxygen_saturation_percent;

  if (oxygen != null) {
    if (oxygen <= 90) {
      urgent = true;
      addRecommendation(
        tips,
        "urgent",
        "Low oxygen saturation reading",
        "Repeat the reading promptly with a properly placed sensor, but do not delay care if you feel unwell. Seek emergency medical care for a persistent reading at this level, severe breathlessness, blue lips, confusion, or other severe symptoms.",
        "Recheck promptly and seek urgent medical care"
      );
    } else if (oxygen < 95) {
      needsAttention = true;
      addRecommendation(
        tips,
        "attention",
        "Oxygen saturation below the usual range",
        "Recheck with a warm, still finger and a reliable device. If the reading persists, contact a healthcare professional promptly. Your usual baseline and any existing lung or heart condition can affect interpretation.",
        "Repeat the oxygen measurement"
      );
    }
  }

  // Temperature: adult screening guidance, not a diagnosis.
  const temperature = latest.temperature_c;

  if (temperature != null) {
    if (temperature >= 39.4) {
      needsAttention = true;
      addRecommendation(
        tips,
        "attention",
        "High temperature",
        "This is a high temperature for most adults. Seek prompt medical advice, particularly if it persists or you feel significantly unwell.",
        "Recheck temperature and seek medical advice"
      );
    } else if (temperature >= 38) {
      needsAttention = true;
      addRecommendation(
        tips,
        "monitor",
        "Raised temperature",
        "This temperature may indicate a fever. Rest, drink fluids if appropriate for you, monitor symptoms, and seek medical advice if it persists or worsens.",
        "Monitor temperature and symptoms"
      );
    }
  }

  // Glucose interpretation depends on fasting status and timing.
  const glucose = latest.blood_glucose_mg_dl;
  const glucoseReading = readings.find(
    (reading) => reading.blood_glucose_mg_dl != null
  );

  if (glucose != null) {
    if (glucose < 70) {
      needsAttention = true;
      addRecommendation(
        tips,
        "attention",
        "Low blood glucose reading",
        "If you have symptoms such as shaking, sweating, confusion, or weakness, follow your clinician's low-glucose plan. If you are awake and able to swallow, standard guidance for many people is to take 15 g of fast-acting carbohydrate and recheck after 15 minutes. Severe confusion, seizures, or unconsciousness require emergency help; do not give food or drink to someone unable to swallow.",
        "Follow your prescribed low-glucose plan"
      );
    } else if (glucoseReading?.context === "fasting" && glucose >= 126) {
      needsAttention = true;
      addRecommendation(
        tips,
        "attention",
        "High fasting glucose reading",
        "A fasting reading in this range needs follow-up testing with a healthcare professional. A single home reading cannot diagnose diabetes.",
        "Arrange clinical follow-up"
      );
    } else if (
      glucoseReading?.context === "fasting" &&
      glucose >= 100
    ) {
      addRecommendation(
        tips,
        "monitor",
        "Fasting glucose worth monitoring",
        "This fasting reading is above the usual normal fasting range. Repeat testing and professional interpretation can help clarify what it means.",
        "Track fasting readings consistently"
      );
    } else {
      addRecommendation(
        tips,
        "info",
        "Glucose reading recorded",
        "Glucose interpretation depends on when you last ate, your medical history, and any glucose-lowering medicines. Use the correct measurement context and discuss repeated unusual results with a healthcare professional.",
        "Record meal timing with glucose readings"
      );
    }
  }

  if (tips.length === 0) {
    addRecommendation(
      tips,
      "info",
      "Keep building your health history",
      "No specific alert was generated from the measurements available. This does not confirm that you are healthy. Continue recording relevant measurements and consult a healthcare professional about symptoms or concerns.",
      "Continue tracking measurements"
    );
  }

  return {
    status: urgent
      ? "urgent"
      : needsAttention
        ? "monitor"
        : "no_alert",
    title: urgent
      ? "Urgent attention may be needed"
      : needsAttention
        ? "Some readings need attention"
        : "No specific alert from available readings",
    summary: urgent
      ? "At least one reading may require urgent medical assessment."
      : needsAttention
        ? "Review the guidance below and follow up on persistent unusual readings."
        : "No specific alert was triggered, but these readings cannot confirm overall health.",
    tips,
  };
}

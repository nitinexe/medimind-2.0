
const METRICS = [
  {
    key: "systolic_mmhg",
    label: "Systolic blood pressure",
    unit: "mmHg",
    tolerance: 5,
  },
  {
    key: "diastolic_mmhg",
    label: "Diastolic blood pressure",
    unit: "mmHg",
    tolerance: 3,
  },
  {
    key: "pulse_bpm",
    label: "Heart rate",
    unit: "bpm",
    tolerance: 3,
  },
  {
    key: "blood_glucose_mg_dl",
    label: "Blood glucose",
    unit: "mg/dL",
    tolerance: 5,
    matchContext: true,
  },
  {
    key: "weight_kg",
    label: "Weight",
    unit: "kg",
    tolerance: 0.2,
  },
  {
    key: "oxygen_saturation_percent",
    label: "Oxygen saturation",
    unit: "%",
    tolerance: 1,
  },
  {
    key: "temperature_c",
    label: "Temperature",
    unit: "°C",
    tolerance: 0.2,
  },
];

export function calculateHealthTrends(readings = []) {
  const sortedReadings = [...readings].sort(
    (a, b) =>
      new Date(b.measured_at).getTime() -
      new Date(a.measured_at).getTime()
  );

  return METRICS.map((metric) => {
    const validReadings = sortedReadings.filter((reading) => {
      const value = reading[metric.key];

      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        Number.isFinite(Number(value))
      );
    });

    if (validReadings.length === 0) {
      return {
        ...metric,
        current: null,
        previous: null,
        change: null,
        direction: "no_data",
        currentDate: null,
        previousDate: null,
        readingsCount: 0,
      };
    }

    const latestReading = validReadings[0];

    // For glucose, compare readings only when their contexts match.
    const previousReading = validReadings
      .slice(1)
      .find((reading) => {
        if (!metric.matchContext) return true;

        return (
          (reading.context ?? "unspecified") ===
          (latestReading.context ?? "unspecified")
        );
      });

    const current = Number(latestReading[metric.key]);

    if (!previousReading) {
      return {
        ...metric,
        current,
        previous: null,
        change: null,
        direction: "insufficient_data",
        currentDate: latestReading.measured_at,
        previousDate: null,
        readingsCount: validReadings.length,
      };
    }

    const previous = Number(previousReading[metric.key]);
    const change = current - previous;

    let direction = "stable";

    if (change > metric.tolerance) {
      direction = "increasing";
    } else if (change < -metric.tolerance) {
      direction = "decreasing";
    }

    return {
      ...metric,
      current,
      previous,
      change,
      direction,
      currentDate: latestReading.measured_at,
      previousDate: previousReading.measured_at,
      readingsCount: validReadings.length,
    };
  });
}

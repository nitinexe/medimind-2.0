
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, HeartPulse, LoaderCircle, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

const initialForm = {
  systolic: "",
  diastolic: "",
  pulse: "",
  glucose: "",
  weight: "",
  oxygen: "",
  temperature: "",
  measuredAt: "",
  context: "resting",
  notes: "",
};

const measurementFields = [
  { key: "systolic", label: "Systolic blood pressure", unit: "mmHg" },
  { key: "diastolic", label: "Diastolic blood pressure", unit: "mmHg" },
  { key: "pulse", label: "Heart rate", unit: "bpm" },
  { key: "glucose", label: "Blood glucose", unit: "mg/dL" },
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "oxygen", label: "Oxygen saturation", unit: "%" },
  { key: "temperature", label: "Body temperature", unit: "°C" },
];

export default function VitalReadingsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    const navigate = useNavigate();
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      Boolean(form.systolic) !== Boolean(form.diastolic)
    ) {
      setError(
        "Enter both systolic and diastolic blood pressure, or leave both blank."
      );
      return;
    }

    const numericFields = [
      ["systolic", "Systolic blood pressure"],
      ["diastolic", "Diastolic blood pressure"],
      ["pulse", "Heart rate"],
      ["glucose", "Blood glucose"],
      ["weight", "Weight"],
      ["oxygen", "Oxygen saturation"],
      ["temperature", "Body temperature"],
    ];

    for (const [key, label] of numericFields) {
      if (form[key] !== "" && !Number.isFinite(Number(form[key]))) {
        setError(`${label} must be a valid number.`);
        return;
      }
      if (form[key] !== "" && Number(form[key]) <= 0) {
        setError(`${label} must be greater than zero.`);
        return;
      }
    }

    if (
      form.systolic &&
      Number(form.systolic) <= Number(form.diastolic)
    ) {
      setError(
        "Systolic pressure must be higher than diastolic pressure."
      );
      return;
    }

    if (form.oxygen && Number(form.oxygen) > 100) {
      setError("Oxygen saturation cannot exceed 100%.");
      return;
    }

    const hasMeasurement = numericFields.some(
      ([key]) => form[key] !== ""
    );

    if (!hasMeasurement) {
      setError("Enter at least one health measurement.");
      return;
    }

    if (form.notes.length > 500) {
      setError("Notes must be 500 characters or fewer.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        navigate("/login");
        return;
      }

      const reading = {
        user_id: user.id,
        systolic_mmhg: form.systolic ? Number(form.systolic) : null,
        diastolic_mmhg: form.diastolic ? Number(form.diastolic) : null,
        pulse_bpm: form.pulse ? Number(form.pulse) : null,
        blood_glucose_mg_dl: form.glucose ? Number(form.glucose) : null,
        weight_kg: form.weight ? Number(form.weight) : null,
        oxygen_saturation_percent: form.oxygen ? Number(form.oxygen) : null,
        temperature_c: form.temperature ? Number(form.temperature) : null,
        measured_at: form.measuredAt
          ? new Date(form.measuredAt).toISOString()
          : new Date().toISOString(),
        context: form.context,
        notes: form.notes.trim() || null,
      };

      const { error: insertError } = await supabase
        .from("vital_readings")
        .insert(reading);

      if (insertError) throw insertError;

      setSuccess("Measurement saved successfully.");
      setForm(initialForm);
      navigate("/dashboard");
    } catch (err) {
      console.error("Saving health measurement failed:", err);
      setError(
        err.message ||
          "Unable to save the measurement. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#071b1a] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard"
          className="mb-7 inline-flex items-center gap-2 text-sm text-teal-200 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl bg-teal-400/10 p-3 text-teal-300">
            <HeartPulse size={28} />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
              MediMind AI
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Record health measurements
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Enter readings from your measuring devices. Accurate dates
              and measurement context help you track changes over time.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8"
        >
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Activity size={19} className="text-teal-300" />
              Your measurements
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {measurementFields.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-sm text-slate-200">
                    {field.label}
                  </span>
                  <div className="flex items-center rounded-xl border border-white/10 bg-[#0b2523] focus-within:border-teal-400">
                    <input
                      type="number"
                      name={field.key}
                      value={form[field.key]}
                      onChange={updateField}
                      min="0"
                      step="any"
                      inputMode="decimal"
                      placeholder="Not required"
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-slate-500"
                    />
                    <span className="pr-4 text-sm text-slate-400">
                      {field.unit}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="text-lg font-semibold">Measurement details</h2>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-200">
                Date and time measured
              </span>
              <input
                type="datetime-local"
                name="measuredAt"
                value={form.measuredAt}
                onChange={updateField}
                className="w-full rounded-xl border border-white/10 bg-[#0b2523] px-4 py-3 text-white outline-none focus:border-teal-400"
              />
              <span className="mt-1 block text-xs text-slate-400">
                Leave blank to use the current time.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-200">
                Measurement context
              </span>
              <select
                name="context"
                value={form.context}
                onChange={updateField}
                className="w-full rounded-xl border border-white/10 bg-[#0b2523] px-4 py-3 text-white outline-none focus:border-teal-400"
              >
                <option value="resting">At rest</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="fasting">Fasting</option>
                <option value="after_meal">After a meal</option>
                <option value="after_exercise">After exercise</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-200">
                Notes (optional)
              </span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={updateField}
                maxLength={500}
                rows={3}
                placeholder="Optional notes about the reading or device..."
                className="w-full rounded-xl border border-white/10 bg-[#0b2523] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-teal-400"
              />
              <span className="mt-1 block text-right text-xs text-slate-400">
                {form.notes.length}/500
              </span>
            </label>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-xl border border-teal-400/30 bg-teal-400/10 p-3 text-sm text-teal-200"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 font-semibold text-[#071b1a] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save measurement"}
          </button>
        </form>

        <p className="mt-5 text-xs leading-5 text-slate-400">
          This form records measurements; it does not diagnose medical
          conditions. Use a suitable measuring device and consult a
          healthcare professional about concerning readings.
        </p>
      </div>
    </main>
  );
}

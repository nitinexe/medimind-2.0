
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assessHealth } from "../lib/healthRecommendations";
import { calculateHealthTrends } from "../lib/healthTrends";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  ScanLine,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { supabase } from "../lib/supabase";


const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Posture analysis", icon: Activity, to: "/posture" },
  { label: "Health measurements", icon: HeartPulse, to: "/vitals" },
  { label: "X-ray analysis", icon: ScanLine, to: "/roadmap/xray" },
  { label: "Analysis history", icon: Clock3, to: "/roadmap/history" },
  { label: "Profile & settings", icon: Settings, to: "/profile" },
];


function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [analyses, setAnalyses] = useState([]);
  const [vitalReadings, setVitalReadings] = useState([]);
  const [healthTrends, setHealthTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [healthAssessment, setHealthAssessment] = useState(null);
  const [chartRange, setChartRange] = useState("7");

  
const chartReadings = vitalReadings
  .filter((reading) => {
    if (chartRange === "all") return true;

    const date = new Date(reading.measured_at);
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - Number(chartRange));

    return date >= cutoff && date <= new Date();
  })
  .slice()
  .sort(
    (a, b) =>
      new Date(a.measured_at).getTime() -
      new Date(b.measured_at).getTime()
  );

const chartData = chartReadings.map((reading) => ({
  date: new Date(reading.measured_at).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  }),
  timestamp: new Date(reading.measured_at).getTime(),
  systolic:
    reading.systolic_mmhg == null
      ? null
      : Number(reading.systolic_mmhg),
  diastolic:
    reading.diastolic_mmhg == null
      ? null
      : Number(reading.diastolic_mmhg),
  pulse:
    reading.pulse_bpm == null ? null : Number(reading.pulse_bpm),
  glucose:
    reading.blood_glucose_mg_dl == null
      ? null
      : Number(reading.blood_glucose_mg_dl),
}));


  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          navigate("/login", { replace: true });
          return;
        }

        const currentUser = authData.user;

        const [profileResult, countResult, analysisResult, vitalResult] =
          await Promise.all([
            supabase
              .from("health_profiles")
              .select(
                "full_name, age_range, primary_goal, activity_level, posture_focus, created_at"
              )
              .eq("user_id", currentUser.id)
              .maybeSingle(),

            supabase
              .from("posture_analyses")
              .select("id", { count: "exact", head: true })
              .eq("user_id", currentUser.id),

            supabase
              .from("posture_analyses")
              .select(
                "id, image_name, measurements, warnings, clinical_status, created_at"
              )
              .eq("user_id", currentUser.id)
              .order("created_at", { ascending: false })
              .limit(5),

              supabase
               .from("vital_readings")
               .select(
                 "id, measured_at, systolic_mmhg, diastolic_mmhg, pulse_bpm, blood_glucose_mg_dl, weight_kg, oxygen_saturation_percent, temperature_c, context"
               )
               .eq("user_id", currentUser.id)
               .order("measured_at", { ascending: false })
               .limit(100),
             ]);

        if (!active) return;

        if (profileResult.error) throw profileResult.error;
        if (countResult.error) throw countResult.error;
        if (analysisResult.error) throw analysisResult.error;
        if (vitalResult.error) throw vitalResult.error;

        const profileData = profileResult.data;
        const totalAnalyses = countResult.count ?? 0;

        // Do not display the dashboard until setup is complete.
        if (!profileData || totalAnalyses < 1) {
          navigate("/onboarding", { replace: true });
          return;
        }

        setUser(currentUser);
        setProfile(profileData);
        setAnalysisCount(totalAnalyses);
        setAnalyses(analysisResult.data ?? []);
        setVitalReadings(vitalResult.data ?? []);
        setHealthTrends(
        calculateHealthTrends(vitalResult.data ?? [])
        );
        setHealthAssessment(
        assessHealth(vitalResult.data ?? [])
        );
        setLoading(false);
      } catch (error) {
        if (!active) return;

        setErrorMessage(
          error.message ||
            "Unable to load your account data. Please try again."
        );
        setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogout() {
    setLoggingOut(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      navigate("/login", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Unable to log out.");
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#071b1a]">
        <LoaderCircle size={30} className="animate-spin text-teal-300" />
      </main>
    );
  }

  if (!profile || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f8f7] px-5">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p role="alert" className="text-sm leading-6 text-red-700">
            {errorMessage || "Your dashboard could not be loaded."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const displayName =
    profile.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "there";

  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const latest = analyses[0];
  const latestMeasurements = latest?.measurements ?? {};

  const latestDifference =
    latestMeasurements.difference ??
    latestMeasurements.signed_difference ??
    null;

  const formattedDifference =
    typeof latestDifference === "number"
      ? Number(latestDifference.toFixed(3)).toString()
      : latestDifference == null
        ? "Not available"
        : String(latestDifference);

  const goalLabel = (profile.primary_goal || "not specified")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  function formatDate(value) {
    return value
      ? new Date(value).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not available";
  }

  return (
    <div className="min-h-screen bg-[#f5f8f7] text-slate-900 md:flex">
      {/* Sidebar */}
      <aside className="flex w-full flex-col border-b border-white/10 bg-[#071b1a] text-white md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64 md:border-b-0">
        <Link
          to="/dashboard"
          className="flex min-h-[76px] items-center gap-3 border-b border-white/10 px-5 sm:px-6"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-teal-300 text-[#071b1a]">
            <HeartPulse size={24} />
          </span>

          <span>
            <strong className="block text-lg font-bold tracking-tight">
              MediMind AI
            </strong>
            <span className="text-[9px] font-bold tracking-[0.18em] text-slate-400">
              YOUR WORKSPACE
            </span>
          </span>
        </Link>

        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col md:gap-2 md:p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = item.to === "/dashboard";

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-teal-300/10 text-teal-200"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="whitespace-nowrap">{item.label}</span>
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-teal-300" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-3 sm:p-4">
          <Link
            to="/profile"
            className="mb-2 flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-white/10 hover:bg-white/[0.06]"
          >
            {user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ? (
              <img
                src={
                  user.user_metadata.avatar_url ||
                  user.user_metadata.picture
                }
                alt=""
                className="size-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-300/15 text-sm font-bold text-teal-200">
                {initials}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              <p className="mt-1 truncate text-xs text-slate-400">
                View profile
              </p>
            </div>
            <UserRound size={17} className="text-slate-500" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-60"
          >
            {loggingOut ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <LogOut size={17} />
            )}
            Log out
          </button>
        </div>
      </aside>

      {/* Main dashboard */}
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 sm:py-9 md:ml-64 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs text-slate-500">
              Personal workspace / Overview
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your dashboard
            </h1>
          </div>

          <Link to="/profile" aria-label="Open profile">
            <span className="grid size-11 place-items-center rounded-full border border-teal-100 bg-teal-50 text-sm font-bold text-teal-800">
              {initials}
            </span>
          </Link>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {errorMessage}
          </div>
        )}

        <section className="relative mt-8 overflow-hidden rounded-3xl bg-[#082a27] p-6 text-white sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-teal-300/10 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold tracking-wider text-teal-200">
              <CheckCircle2 size={14} />
              YOUR PERSONAL WORKSPACE
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome, {displayName}.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Your dashboard is based on your saved account information and
              posture-analysis records. You can run another analysis anytime.
            </p>

            <Link
              to="/posture"
              className="group mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-300 px-5 text-sm font-bold text-[#071b1a] transition hover:-translate-y-0.5 hover:bg-teal-200"
            >
              Start a new analysis
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        {/* Real account analytics */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Your analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Calculated from records saved under your account.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              icon={Activity}
              label="Saved posture analyses"
              value={String(analysisCount)}
              detail="Total records for your account"
            />

            <StatCard
              icon={CalendarDays}
              label="Latest analysis"
              value={formatDate(latest?.created_at)}
              detail="Based on your most recent saved record"
            />

            <StatCard
              icon={BrainCircuit}
              label="Your primary goal"
              value={goalLabel}
              detail="From your onboarding form"
            />
          </div>
        </section>

        

{/* Personalized Health Recommendations */}
<section className="mt-8">
  <div className="mb-4">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
      MediMind Intelligence
    </p>

    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-grey">
      Your health insights
    </h2>

    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Guidance based on your recorded health measurements.
    </p>
  </div>

  {!healthAssessment ? (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Loading your health insights...
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {/* Overall health status */}
      <div
        className={`rounded-2xl border p-5 ${
          healthAssessment.status === "urgent"
            ? "border-red-500 bg-red-950 text-white"
            : healthAssessment.status === "monitor"
              ? "border-red-400 bg-red-100 text-red-950 dark:border-red-500 dark:bg-red-950 dark:text-red-50"
              : healthAssessment.status === "insufficient_data"
                ? "border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                : "border-teal-300 bg-teal-50 text-teal-950 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`shrink-0 rounded-xl p-3 ${
              healthAssessment.status === "urgent"
                ? "bg-red-800"
                : healthAssessment.status === "monitor"
                  ? "bg-red-200 dark:bg-red-900"
                  : healthAssessment.status === "insufficient_data"
                    ? "bg-slate-200 dark:bg-slate-700"
                    : "bg-teal-100 dark:bg-teal-900"
            }`}
          >
            {healthAssessment.status === "urgent" ||
            healthAssessment.status === "monitor" ? (
              <ShieldCheck className="h-6 w-6 text-red-700 dark:text-red-100" />
            ) : (
              <HeartPulse className="h-6 w-6 text-teal-700 dark:text-teal-300" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-bold">
              {healthAssessment.title}
            </h3>

            <p className="mt-2 text-sm leading-6 opacity-95">
              {healthAssessment.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Individual recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        {healthAssessment.tips.map((tip, index) => {
          const urgent = tip.level === "urgent";
          const attention =
            tip.level === "attention" || tip.level === "monitor";

          const cardTheme = urgent
            ? "border-red-500 bg-red-950 text-white shadow-lg shadow-red-950/20"
            : attention
              ? "border-red-400 bg-red-100 text-red-950 dark:border-red-500 dark:bg-red-950 dark:text-red-50"
              : tip.level === "positive"
                ? "border-teal-300 bg-teal-50 text-teal-950 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-50"
                : "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white";

          const iconTheme = urgent
            ? "bg-red-800 text-red-100"
            : attention
              ? "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
              : tip.level === "positive"
                ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

          return (
            <article
              key={`${tip.title}-${index}`}
              className={`rounded-2xl border p-5 transition-colors ${cardTheme}`}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-xl p-2.5 ${iconTheme}`}>
                  {urgent || attention ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <HeartPulse className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold leading-6">
                      {tip.title}
                    </h3>

                    {urgent && (
                      <span className="rounded-full border border-red-300 bg-red-700 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                        Urgent
                      </span>
                    )}

                    {!urgent && attention && (
                      <span className="rounded-full border border-red-400 bg-red-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-950 dark:border-red-400 dark:bg-red-900 dark:text-white">
                        Attention
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 opacity-95">
                    {tip.message}
                  </p>

                  {tip.action && (
                    <div className="mt-4 border-t border-current/20 pt-3">
                      <p className="text-sm font-semibold leading-6">
                        Recommended next step
                      </p>

                      <p className="mt-1 text-sm leading-6">
                        {tip.action}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Medical disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
          <strong className="text-slate-800 dark:text-slate-200">
            Important:
          </strong>{" "}
          These insights provide preliminary screening guidance, not a
          medical diagnosis. No alert does not mean you are healthy.
          Seek appropriate medical care for concerning symptoms.
        </p>
      </div>
    </div>
  )}
</section>



{/* Health History Charts */}
<section className="mt-8">
  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
        Health Analytics
      </p>

      <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
        Health history
      </h2>

      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Explore changes in your recorded measurements over time.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {[
        { label: "7 days", value: "7" },
        { label: "30 days", value: "30" },
        { label: "All loaded", value: "all" },
      ].map((range) => (
        <button
          key={range.value}
          type="button"
          onClick={() => setChartRange(range.value)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            chartRange === range.value
              ? "bg-teal-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  </div>

  {chartData.length === 0 ? (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
      <Activity className="mx-auto h-10 w-10 text-teal-600" />

      <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
        No readings in this period
      </h3>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Record a health measurement or choose another date range to view your history.
      </p>

      <Link
        to="/vitals"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
      >
        Add measurement
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  ) : (
    <div className="grid gap-5 xl:grid-cols-2">
      {/* Blood pressure chart */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Blood pressure
        </h3>

        <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">
          Systolic and diastolic readings (mmHg)
        </p>

        {chartData.some(
          (item) => item.systolic != null || item.diastolic != null
        ) ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis width={42} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.timestamp
                      ? new Date(payload[0].payload.timestamp).toLocaleString()
                      : ""
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic"
                  stroke="#dc2626"
                  connectNulls={false}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic"
                  stroke="#0d9488"
                  connectNulls={false}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-500">
            No blood pressure readings in this period.
          </p>
        )}
      </div>

      {/* Heart rate chart */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Heart rate
        </h3>

        <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">
          Recorded pulse (bpm)
        </p>

        {chartData.some((item) => item.pulse != null) ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis width={42} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.timestamp
                      ? new Date(payload[0].payload.timestamp).toLocaleString()
                      : ""
                  }
                />
                <Line
                  type="monotone"
                  dataKey="pulse"
                  name="Heart rate"
                  stroke="#7c3aed"
                  connectNulls={false}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-500">
            No heart rate readings in this period.
          </p>
        )}
      </div>

      {/* Blood glucose chart */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Blood glucose
        </h3>

        <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">
          Recorded glucose (mg/dL). Measurement context matters when interpreting these values.
        </p>

        {chartData.some((item) => item.glucose != null) ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis width={48} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.timestamp
                      ? new Date(payload[0].payload.timestamp).toLocaleString()
                      : ""
                  }
                />
                <Line
                  type="monotone"
                  dataKey="glucose"
                  name="Blood glucose"
                  stroke="#ea580c"
                  connectNulls={false}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-500">
            No glucose readings in this period.
          </p>
        )}
      </div>
    </div>
  )}

  <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
    Charts display recorded values, not diagnoses. The "All loaded" option
    currently means all readings fetched by the dashboard, not necessarily
    the patient's complete history.
  </p>
</section>



{/* Health Trends */}
<section className="mt-8">
  <div className="mb-4">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
      Health Analytics
    </p>

    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-green">
      Your health trends
    </h2>

    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
      Compare your latest measurements with previous comparable readings.
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {healthTrends.map((trend) => {
      const directionStyles = {
        increasing: {
          label: "Increasing",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
          icon: "↑",
        },
        decreasing: {
          label: "Decreasing",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
          icon: "↓",
        },
        stable: {
          label: "Relatively stable",
          className:
            "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200",
          icon: "↔",
        },
        insufficient_data: {
          label: "Need another reading",
          className:
            "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
          icon: "•",
        },
        no_data: {
          label: "No readings",
          className:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          icon: "—",
        },
      };

      const direction =
        directionStyles[trend.direction] ??
        directionStyles.no_data;

      const formatValue = (value) =>
        value == null
          ? "—"
          : Number(value).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            });

      return (
        <article
          key={trend.key}
          className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {trend.label}
            </h3>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${direction.className}`}
            >
              {direction.icon} {direction.label}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatValue(trend.current)}
              {trend.current != null && (
                <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {trend.unit}
                </span>
              )}
            </p>

            {trend.previous != null ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Previous: {formatValue(trend.previous)} {trend.unit}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {trend.current == null
                  ? "Record a measurement to begin tracking."
                  : "Record another comparable measurement to see a trend."}
              </p>
            )}

            {trend.change != null && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Change: {trend.change > 0 ? "+" : ""}
                {formatValue(trend.change)} {trend.unit}
              </p>
            )}
          </div>

          {trend.currentDate && (
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Latest reading:{" "}
              {new Date(trend.currentDate).toLocaleString()}
            </p>
          )}

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {trend.readingsCount} recorded{" "}
            {trend.readingsCount === 1 ? "reading" : "readings"}
          </p>
        </article>
      );
    })}
  </div>

  <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
    Trends describe changes in recorded values, not whether a change is
    medically safe or dangerous. Measurement timing, activity, symptoms,
    and individual health conditions affect interpretation.
  </p>
</section>


        
{/* Latest health measurements */}
<section className="mt-8">
  <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
        Your health
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">
        Latest health measurements
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Your most recently recorded readings.
      </p>
    </div>

    <Link
      to="/vitals"
      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-900"
    >
      <HeartPulse size={17} />
      Record measurements
    </Link>
  </div>

  {vitalReadings.length === 0 ? (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
      <HeartPulse size={25} className="text-teal-700" />
      <h3 className="mt-3 font-semibold text-slate-900">
        Start tracking your health
      </h3>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
        Record your blood pressure, heart rate, glucose, or another
        measurement to start building your personal health history.
      </p>
      <Link
        to="/vitals"
        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:text-teal-950"
      >
        Add your first reading <ArrowRight size={16} />
      </Link>
    </div>
  ) : (
    <>
      <p className="mt-4 text-xs text-slate-500">
        Latest recorded entry:{" "}
        {new Date(vitalReadings[0].measured_at).toLocaleString()}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          {
            label: "Blood pressure",
            value: (r) =>
              r.systolic_mmhg != null && r.diastolic_mmhg != null
                ? `${r.systolic_mmhg}/${r.diastolic_mmhg}`
                : null,
            unit: "mmHg",
          },
          {
            label: "Heart rate",
            value: (r) => r.pulse_bpm,
            unit: "bpm",
          },
          {
            label: "Blood glucose",
            value: (r) => r.blood_glucose_mg_dl,
            unit: "mg/dL",
          },
          {
            label: "Weight",
            value: (r) => r.weight_kg,
            unit: "kg",
          },
          {
            label: "Oxygen saturation",
            value: (r) => r.oxygen_saturation_percent,
            unit: "%",
          },
          {
            label: "Temperature",
            value: (r) => r.temperature_c,
            unit: "°C",
          },
        ].map((metric) => {
          const reading = vitalReadings.find(
            (r) => metric.value(r) != null
          );

          const value = reading ? metric.value(reading) : null;

          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-600">
                {metric.label}
              </p>

              <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                {value == null ? "—" : `${value} ${metric.unit}`}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {reading
                  ? `Recorded ${new Date(
                      reading.measured_at
                    ).toLocaleString()}`
                  : "No reading recorded yet"}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-900">
            Recent measurement history
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Showing up to 10 of your latest recorded entries.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {vitalReadings.map((reading) => {
            const values = [];

            if (
              reading.systolic_mmhg != null &&
              reading.diastolic_mmhg != null
            ) {
              values.push(
                `BP ${reading.systolic_mmhg}/${reading.diastolic_mmhg} mmHg`
              );
            }

            if (reading.pulse_bpm != null) {
              values.push(`Heart rate ${reading.pulse_bpm} bpm`);
            }

            if (reading.blood_glucose_mg_dl != null) {
              values.push(`Glucose ${reading.blood_glucose_mg_dl} mg/dL`);
            }

            if (reading.weight_kg != null) {
              values.push(`Weight ${reading.weight_kg} kg`);
            }

            if (reading.oxygen_saturation_percent != null) {
              values.push(`SpO₂ ${reading.oxygen_saturation_percent}%`);
            }

            if (reading.temperature_c != null) {
              values.push(`Temperature ${reading.temperature_c} °C`);
            }

            return (
              <div key={reading.id} className="px-5 py-4">
                <p className="text-sm font-medium leading-6 text-slate-900">
                  {values.join(" · ")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(reading.measured_at).toLocaleString()}
                  {" · "}
                  {reading.context.replaceAll("_", " ")}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  )}
</section>


        {/* Latest measurement */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
                Most recent result
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Image-based alignment measurement
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                The value below comes from the latest saved analysis, if
                that measurement was available.
              </p>
            </div>

            <div className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-800">
              <Activity size={22} />
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <p className="text-xs text-slate-500">
              Difference reported by the model
            </p>
            <p className="mt-2 break-words text-2xl font-semibold text-slate-950">
              {formattedDifference}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              This is an experimental image-based value, not a clinical
              severity score. Do not interpret it as a diagnosis.
            </p>
          </div>
        </section>

        {/* Recent history */}
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
                Your saved activity
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Recent analyses
              </h2>
            </div>

            <Link
              to="/posture"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 transition hover:text-teal-950"
            >
              Analyze another image
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {analyses.map((analysis) => {
              const measurements = analysis.measurements ?? {};
              const difference =
                measurements.difference ??
                measurements.signed_difference;

              const warningCount = Array.isArray(analysis.warnings)
                ? analysis.warnings.length
                : 0;

              return (
                <article
                  key={analysis.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      <Activity size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-all text-sm font-semibold text-slate-900">
                        {analysis.image_name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(analysis.created_at)}
                      </p>
                      {warningCount > 0 && (
                        <p className="mt-1 text-xs text-amber-700">
                          {warningCount} saved quality warning
                          {warningCount === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs text-slate-500">
                      Saved measurement
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {difference == null ? "Not available" : String(difference)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-teal-700" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Your data and privacy
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your database requests are restricted by Supabase ownership
                policies. This version stores measurement metadata and
                filenames, not uploaded image files. Image storage needs its
                own private bucket and access policies before use.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 text-xs leading-6 text-slate-500">
          MediMind AI is an experimental technology platform. Its outputs
          are not medical diagnoses or substitutes for professional care.
        </p>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-800">
          <Icon size={20} />
        </div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>

      <p className="mt-5 break-words text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

export default DashboardPage;
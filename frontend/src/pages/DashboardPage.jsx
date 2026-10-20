
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

import { supabase } from "../lib/supabase";

const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Posture analysis", icon: Activity, to: "/posture" },
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
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

        const [profileResult, countResult, analysisResult] =
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
          ]);

        if (!active) return;

        if (profileResult.error) throw profileResult.error;
        if (countResult.error) throw countResult.error;
        if (analysisResult.error) throw analysisResult.error;

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
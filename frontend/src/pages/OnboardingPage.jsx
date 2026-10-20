
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function OnboardingPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [ageRange, setAgeRange] = useState("prefer_not_to_say");
  const [primaryGoal, setPrimaryGoal] = useState("posture_awareness");
  const [activityLevel, setActivityLevel] = useState("prefer_not_to_say");
  const [postureFocus, setPostureFocus] = useState("general_awareness");
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOnboarding() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          navigate("/login", { replace: true });
          return;
        }

        const currentUser = authData.user;

        const [profileResult, analysisResult] = await Promise.all([
          supabase
            .from("health_profiles")
            .select("*")
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

        const profile = profileResult.data;
        const hasAnalysis = (analysisResult.data?.length ?? 0) > 0;

        if (profile && hasAnalysis) {
          navigate("/dashboard", { replace: true });
          return;
        }

        setUser(currentUser);
        setFullName(
          profile?.full_name ||
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            ""
        );

        if (profile) {
          setAgeRange(profile.age_range || "prefer_not_to_say");
          setPrimaryGoal(profile.primary_goal || "posture_awareness");
          setActivityLevel(
            profile.activity_level || "prefer_not_to_say"
          );
          setPostureFocus(
            profile.posture_focus || "general_awareness"
          );
          setAcceptedDisclaimer(Boolean(profile.disclaimer_accepted));
        }

        setLoading(false);
      } catch (error) {
        if (!active) return;
        setErrorMessage(
          error.message ||
            "We couldn't load your setup. Please try again."
        );
        setLoading(false);
      }
    }

    loadOnboarding();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const cleanName = fullName.trim();

    if (!user) {
      setErrorMessage("Your session has expired. Please sign in again.");
      return;
    }

    if (cleanName.length < 2) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!acceptedDisclaimer) {
      setErrorMessage("Please confirm that you understand the limitations.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from("health_profiles").upsert(
        {
          user_id: user.id,
          full_name: cleanName,
          age_range: ageRange,
          primary_goal: primaryGoal,
          activity_level: activityLevel,
          posture_focus: postureFocus,
          disclaimer_accepted: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      navigate("/posture?onboarding=1", { replace: true });
    } catch (error) {
      setErrorMessage(
        error.message ||
          "We couldn't save your information. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#071b1a]">
        <LoaderCircle size={30} className="animate-spin text-teal-300" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071b1a] px-5 py-10 text-white">
      <div className="pointer-events-none absolute -left-40 -top-32 size-[400px] rounded-full bg-teal-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 size-[420px] rounded-full bg-cyan-400/10 blur-[100px]" />

      <section className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0d2423] p-6 shadow-2xl shadow-black/20 sm:p-9">
        <Link
          to="/"
          className="text-sm text-slate-400 transition hover:text-teal-200"
        >
          ← Back to home
        </Link>

        <div className="mt-7">
          <div className="grid size-12 place-items-center rounded-2xl bg-teal-300 text-[#071b1a]">
            <HeartPulse size={25} />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
            Your first step · 1 of 2
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Let's set up your workspace.
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Tell us a little about your goals so we can organize your
            experience. You can choose not to share optional information.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-[#071b1a] px-4 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-300/10"
            />
          </div>

          <div>
            <label
              htmlFor="ageRange"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Age range <span className="text-slate-500">(optional)</span>
            </label>
            <select
              id="ageRange"
              value={ageRange}
              onChange={(event) => setAgeRange(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-[#071b1a] px-4 text-sm text-white outline-none focus:border-teal-300"
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="18_24">18–24</option>
              <option value="25_34">25–34</option>
              <option value="35_44">35–44</option>
              <option value="45_plus">45+</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="primaryGoal"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              What is your main goal?
            </label>
            <select
              id="primaryGoal"
              required
              value={primaryGoal}
              onChange={(event) => setPrimaryGoal(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-[#071b1a] px-4 text-sm text-white outline-none focus:border-teal-300"
            >
              <option value="posture_awareness">
                Understand posture observations
              </option>
              <option value="general_wellness">
                Explore general wellness information
              </option>
              <option value="learn_health_technology">
                Learn about healthcare AI technology
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="activityLevel"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              General activity level{" "}
              <span className="text-slate-500">(optional)</span>
            </label>
            <select
              id="activityLevel"
              value={activityLevel}
              onChange={(event) => setActivityLevel(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-[#071b1a] px-4 text-sm text-white outline-none focus:border-teal-300"
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="low">Mostly seated / low activity</option>
              <option value="moderate">Moderately active</option>
              <option value="high">Very active</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="postureFocus"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              What would you like to explore?
            </label>
            <select
              id="postureFocus"
              value={postureFocus}
              onChange={(event) => setPostureFocus(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-[#071b1a] px-4 text-sm text-white outline-none focus:border-teal-300"
            >
              <option value="general_awareness">General posture awareness</option>
              <option value="shoulder_alignment">Shoulder alignment observations</option>
              <option value="hip_alignment">Hip alignment observations</option>
              <option value="movement_tracking">Movement tracking in the future</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <input
              type="checkbox"
              checked={acceptedDisclaimer}
              onChange={(event) => setAcceptedDisclaimer(event.target.checked)}
              className="mt-1 size-4 accent-teal-300"
              required
            />
            <span className="text-xs leading-6 text-slate-300">
              I understand that MediMind AI provides experimental,
              image-based observations and is not a medical diagnosis tool.
              I will not use its results to replace professional healthcare.
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 text-sm font-bold text-[#071b1a] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <>
                Save and continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 flex items-start gap-2 text-xs leading-6 text-slate-500">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal-200" />
          Your responses are saved to your account. Only share the optional
          information you are comfortable providing.
        </p>
      </section>
    </main>
  );
}

export default OnboardingPage;
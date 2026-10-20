
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  HeartPulse,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignup = location.pathname === "/signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        setErrorMessage(error.message);
        setCheckingSession(false);
        return;
      }

      if (data.session) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setCheckingSession(false);
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setVerificationMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (isSignup && cleanName.length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;

        setPassword("");
        setConfirmPassword("");

        if (data.session) {
          navigate("/dashboard", { replace: true });
        } else {
          setVerificationMessage(
            "Check your email and verify your address. After verification, you'll continue to your personal setup."
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        if (!data.session) {
          throw new Error("No active session was returned. Please try again.");
        }

        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      setErrorMessage(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error) {
      setErrorMessage(error.message || "Google sign-in could not be started.");
      setLoading(false);
    }
  }

  if (checkingSession) {
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

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-teal-200"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <section className="rounded-3xl border border-white/10 bg-[#0d2423] p-6 shadow-2xl shadow-black/20 sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-300 text-[#071b1a]">
              <HeartPulse size={29} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
              MediMind AI
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {isSignup
                ? "Let's get you started."
                : "Log in to continue."}
            </p>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
            >
              {errorMessage}
            </p>
          )}

          {verificationMessage && (
            <p
              role="status"
              className="mb-5 rounded-xl border border-teal-300/20 bg-teal-300/10 px-4 py-3 text-sm leading-6 text-teal-100"
            >
              {verificationMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <svg viewBox="0 0 48 48" className="size-[19px]" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.8-6.8C35.9 2.5 30.5 0 24 0 14.6 0 6.5 5.4 2.6 13.3l8 6.2C12.5 13.6 17.8 9.5 24 9.5Z" transform="translate(0 5)" />
                <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.6 2.7-2.1 5-4.3 6.5l7 5.4c4.1-3.8 7-9.4 7-15.9Z" />
                <path fill="#FBBC05" d="M10.6 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-8-6.2A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l8-6.2Z" transform="translate(1 0)" />
                <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.7l-7-5.4c-2 1.3-4.6 2.1-9 2.1-6.2 0-11.5-4.1-13.4-9.7l-8 6.2C6.5 43.6 14.6 48 24 48Z" transform="translate(0 -4)" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
              Or use email
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-200">
                  Full name
                </label>
                <div className="relative">
                  <UserRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your name"
                    className="min-h-12 w-full rounded-xl border border-white/10 bg-[#071b1a] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300 focus:ring-4 focus:ring-teal-300/10"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                Email address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-[#071b1a] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300 focus:ring-4 focus:ring-teal-300/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <LockKeyhole size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-[#071b1a] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300 focus:ring-4 focus:ring-teal-300/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center text-slate-500 hover:text-teal-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-200">
                  Confirm password
                </label>
                <div className="relative">
                  <LockKeyhole size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    className="min-h-12 w-full rounded-xl border border-white/10 bg-[#071b1a] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-teal-300 focus:ring-4 focus:ring-teal-300/10"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirmPassword((shown) => !shown)}
                    className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center text-slate-500 hover:text-teal-200"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 text-sm font-bold text-[#071b1a] transition hover:-translate-y-0.5 hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <>
                  {isSignup ? "Create account" : "Log in"}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            {isSignup ? "Already have an account?" : "New to MediMind AI?"}{" "}
            <Link
              to={isSignup ? "/login" : "/signup"}
              className="font-semibold text-teal-200 transition hover:text-teal-100"
            >
              {isSignup ? "Log in" : "Create account"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default AuthPage;
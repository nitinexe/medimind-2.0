
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Fingerprint,
  HeartPulse,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function ProfileAvatar({ user, size = "size-20" }) {
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  return (
    <span
      className={`${size} relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-teal-100 text-2xl font-bold text-teal-900 shadow-sm`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${name}'s avatar`}
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      {initials}
    </span>
  );
}

function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(data.user);
      setFullName(
        data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          ""
      );
      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSaveName(event) {
    event.preventDefault();
    setFeedback(null);

    const cleanedName = fullName.trim();

    if (cleanedName.length < 2) {
      setFeedback({
        type: "error",
        message: "Please enter a name containing at least 2 characters.",
      });
      return;
    }

    setSavingName(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          full_name: cleanedName,
        },
      });

      if (error) throw error;

      setUser(data.user);
      setFullName(data.user.user_metadata?.full_name || cleanedName);

      setFeedback({
        type: "success",
        message: "Your profile name has been updated.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Couldn't update your name.",
      });
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setFeedback(null);

    if (newPassword.length < 8) {
      setFeedback({
        type: "error",
        message: "Your new password must contain at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        type: "error",
        message: "Your new passwords do not match.",
      });
      return;
    }

    setSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");

      setFeedback({
        type: "success",
        message: "Your password has been changed successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Couldn't change your password.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    setFeedback(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      navigate("/login", { replace: true });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Couldn't log out.",
      });
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

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const provider =
    user?.app_metadata?.provider ||
    user?.identities?.[0]?.provider ||
    "email";

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  const verified = Boolean(user?.email_confirmed_at);

  return (
    <div className="min-h-screen bg-[#f5f8f7] text-slate-900">
      <header className="bg-[#071b1a] text-white">
        <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-300 text-[#071b1a]">
              <HeartPulse size={23} />
            </span>
            <span className="text-lg font-bold">MediMind AI</span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
            Account settings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Your profile
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Manage your personal details and account security.
          </p>
        </div>

        {feedback && (
          <div
            role={feedback.type === "error" ? "alert" : "status"}
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-teal-200 bg-teal-50 text-teal-900"
            }`}
          >
            {feedback.type === "error" ? (
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Account identity */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-[#0b3d36] via-teal-800 to-[#10322f]" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <ProfileAvatar user={user} />

                <div className="min-w-0 pb-1">
                  <h2 className="break-words text-xl font-semibold text-slate-950">
                    {displayName}
                  </h2>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {user?.email}
                  </p>
                </div>
              </div>

              <span
                className={`mb-1 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  verified
                    ? "bg-teal-50 text-teal-800"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    verified ? "bg-teal-600" : "bg-amber-500"
                  }`}
                />
                {verified ? "Email verified" : "Email not verified"}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Personal information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-800">
                <UserRound size={21} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">
                  Personal information
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Update your display name.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveName} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="profileName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>
                <input
                  id="profileName"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">
                  <Mail size={17} className="shrink-0 text-slate-400" />
                  <span className="break-all">{user?.email}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Email changes require a separate verification flow.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingName}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
              >
                {savingName ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                Save profile
              </button>
            </form>
          </section>

          {/* Account details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-800">
                <Fingerprint size={21} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">
                  Account information
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Details associated with your account.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <InfoRow
                icon={Mail}
                label="Email status"
                value={verified ? "Verified" : "Verification pending"}
              />

              <InfoRow
                icon={ShieldCheck}
                label="Sign-in provider"
                value={provider === "google" ? "Google" : "Email and password"}
              />

              <InfoRow
                icon={Clock3}
                label="Member since"
                value={joinedDate}
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  User ID
                </p>
                <p className="mt-2 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-600">
                  {user?.id}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Password settings */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-800">
              <LockKeyhole size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">
                Password and security
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Change or set a password for your account.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm new password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat the new password"
                className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:opacity-60 md:w-auto"
              >
                {savingPassword ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <LockKeyhole size={17} />
                )}
                Change password
              </button>
            </div>
          </form>
        </section>

        {/* Sign out */}
        <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-red-100 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-semibold text-slate-900">Sign out</h2>
            <p className="mt-1 text-sm text-slate-500">
              End your current MediMind AI session on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {loggingOut ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <LogOut size={17} />
            )}
            Sign out
          </button>
        </section>

        <p className="mt-7 text-center text-xs leading-6 text-slate-500">
          MediMind AI is an experimental technology platform and is not a
          substitute for professional medical advice.
        </p>
      </main>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;
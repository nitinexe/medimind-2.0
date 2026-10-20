
import {
  ArrowUpRight,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-teal-700 text-white">
                <HeartPulse size={24} />
              </span>

              <span>
                <span className="block text-lg font-extrabold tracking-tight text-slate-900">
                  MediMind AI
                </span>
                <span className="mt-0.5 block text-[9px] font-bold tracking-[0.16em] text-slate-500">
                  AI HEALTH PLATFORM
                </span>
              </span>
            </a>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
              An evolving healthcare technology project exploring computer
              vision, AI-assisted analysis, and personalized digital
              experiences.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Explore
            </h3>
            <div className="mt-5 flex flex-col items-start gap-3">
              <a
                href="/#features"
                className="text-sm text-slate-600 transition hover:text-teal-700"
              >
                Features
              </a>
              <a
                href="/#how-it-works"
                className="text-sm text-slate-600 transition hover:text-teal-700"
              >
                How it works
              </a>
              <a
                href="/#about"
                className="text-sm text-slate-600 transition hover:text-teal-700"
              >
                About MediMind
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Your workspace
            </h3>
            <div className="mt-5 flex flex-col items-start gap-3">
              <a
                href="/login"
                className="text-sm text-slate-600 transition hover:text-teal-700"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-teal-700"
              >
                Create an account
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-slate-500">
            © {year} MediMind AI. Built as an evolving technology project.
          </p>

          <p className="flex items-start gap-2 text-xs leading-6 text-slate-500 sm:max-w-md">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-teal-700"
            />
            Experimental outputs are for informational and development
            purposes, not for diagnosis or emergency medical decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
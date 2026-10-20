
import { useState } from "react";
import { ArrowUpRight, HeartPulse, Menu, X } from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <a
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-3"
          aria-label="MediMind AI home"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-teal-700 text-white">
            <HeartPulse size={24} />
          </span>

          <span className="flex flex-col gap-0.5">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              MediMind
            </span>
            <span className="text-[9px] font-bold tracking-[0.18em] text-slate-500">
              AI HEALTH PLATFORM
            </span>
          </span>
        </a>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav
          aria-label="Main navigation"
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col gap-2 border-b border-slate-200 bg-white px-5 py-5 shadow-lg md:static md:flex md:flex-row md:items-center md:justify-end md:gap-8 md:border-0 md:bg-transparent md:px-0 md:py-0 md:shadow-none`}
        >
          <a
            href="/#features"
            onClick={closeMenu}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:text-teal-700"
          >
            Features
          </a>

          <a
            href="/#how-it-works"
            onClick={closeMenu}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:text-teal-700"
          >
            How it works
          </a>

          <a
            href="/#about"
            onClick={closeMenu}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:text-teal-700"
          >
            About
          </a>

          <div className="mt-2 flex flex-col gap-3 border-t border-slate-100 pt-4 md:mt-0 md:flex-row md:items-center md:gap-5 md:border-0 md:pt-0">
            <a
              href="/login"
              onClick={closeMenu}
              className="px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:text-teal-700"
            >
              Log in
            </a>

            <a
              href="/signup"
              onClick={closeMenu}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Get started
              <ArrowUpRight size={17} />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
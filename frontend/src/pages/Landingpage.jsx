
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Eye,
  Fingerprint,
  HeartPulse,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";


const features = [
  {
    number: "01",
    slug: "posture",
    icon: Activity,
    title: "Posture intelligence",
    description:
      "Explore detected pose landmarks, body alignment measurements, and annotated images through our computer-vision prototype.",
    status: "WORKING PROTOTYPE",
    colors: "bg-teal-50 text-teal-800",
    badge: "bg-teal-50 text-teal-800 ring-teal-200",
  },
  {
    number: "02",
    slug: "xray",
    icon: ScanLine,
    title: "X-ray analysis",
    description:
      "A future AI-assisted imaging workspace built around suitable datasets, dedicated models, and rigorous evaluation.",
    status: "PLANNED",
    colors: "bg-blue-50 text-blue-800",
    badge: "bg-blue-50 text-blue-800 ring-blue-200",
  },
  {
    number: "03",
    slug: "ai-coach",
    icon: BrainCircuit,
    title: "Personal AI coach",
    description:
      "An envisioned learning experience with personalized insights, progress tracking, and recommendations.",
    status: "PLANNED",
    colors: "bg-violet-50 text-violet-800",
    badge: "bg-violet-50 text-violet-800 ring-violet-200",
  },
  {
    number: "04",
    slug: "history",
    icon: Eye,
    title: "Personal analysis history",
    description:
      "A planned private workspace for revisiting previous analyses and tracking your activity over time.",
    status: "PLANNED",
    colors: "bg-amber-50 text-amber-800",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
  },
];

const steps = [
  {
    number: "01",
    icon: Fingerprint,
    title: "Build your personal workspace",
    description:
      "Create an account and access a dedicated space for your profile and future analysis history.",
  },
  {
    number: "02",
    icon: Upload,
    title: "Submit an image",
    description:
      "Choose a supported image for the relevant analysis tool. Clear images help computer vision locate landmarks.",
  },
  {
    number: "03",
    icon: Activity,
    title: "Explore the output",
    description:
      "Review available image annotations, measurements, and quality warnings with the limitations clearly explained.",
  },
];

const faqs = [
  {
    question: "Can MediMind AI diagnose a medical condition?",
    answer:
      "No. The current posture prototype provides experimental, image-based geometric observations. It is not a validated diagnostic system and must not replace assessment by a qualified healthcare professional.",
  },
  {
    question: "Can I analyse X-rays right now?",
    answer:
      "X-ray analysis is a planned feature. It will require a suitable labelled dataset, careful testing, and appropriate clinical validation before any medical use can be considered.",
  },
  {
    question: "Will my images and results belong to my account?",
    answer:
      "Account-specific profiles and analysis histories are part of the planned architecture. We still need to configure and test authentication, database access policies, and private image storage. Do not upload sensitive medical images to a public deployment before those protections are in place.",
  },
  {
    question: "What should I do if I have a medical concern?",
    answer:
      "Consult a qualified healthcare professional. Do not use an experimental AI output to make treatment decisions or delay urgent care.",
  },
];

function SectionEyebrow({ children, light = false }) {
  return (
    <div
      className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] ${
        light ? "text-teal-200" : "text-teal-800"
      }`}
    >
      <span
        className={`h-px w-7 ${
          light ? "bg-teal-300" : "bg-teal-700"
        }`}
      />
      {children}
    </div>
  );
}

function PostureIllustration() {
  return (
    <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0b2927] sm:min-h-[405px]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(25,146,127,0.19),transparent_68%)]" />

      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(131,214,197,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(131,214,197,0.15)_1px,transparent_1px)] [background-size:30px_30px]" />

      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-medium text-teal-100 backdrop-blur-md sm:left-5 sm:top-5">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-300 opacity-50" />
          <span className="relative inline-flex size-2 rounded-full bg-teal-300" />
        </span>
        COMPUTER VISION PREVIEW
      </div>

      <div className="absolute right-4 top-4 z-10 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[9px] font-semibold tracking-wider text-white/60 backdrop-blur-md sm:right-5 sm:top-5">
        DEMO VIEW
      </div>

      <div className="relative z-10 w-full max-w-[350px] px-5 py-10">
        <svg
          viewBox="0 0 280 330"
          className="mx-auto h-auto w-full max-w-[255px] overflow-visible drop-shadow-[0_0_20px_rgba(73,220,187,0.12)]"
          role="img"
          aria-label="Illustrative skeleton overlay showing body pose landmarks"
        >
          <defs>
            <linearGradient id="personFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1f2e8" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#3e9b88" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          <ellipse cx="140" cy="302" rx="70" ry="7" fill="#3ebba4" opacity=".15" />

          <g className="animate-float">
            <circle
              cx="140"
              cy="46"
              r="25"
              fill="url(#personFill)"
              stroke="#a2efdc"
              strokeWidth="1.4"
            />
            <path
              d="M113 80 Q140 68 167 80 L183 151 L165 158 L160 112 L163 179 L185 250 L166 252 L140 195 L114 252 L95 250 L117 179 L120 112 L115 158 L97 151 Z"
              fill="url(#personFill)"
              stroke="#a2efdc"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            <g
              fill="none"
              stroke="#68e3c5"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M115 84 L140 101 L165 84" />
              <path d="M140 101 L140 143 L140 178" />
              <path d="M115 84 L82 128 L96 151" />
              <path d="M165 84 L198 128 L184 151" />
              <path d="M140 178 L117 246" />
              <path d="M140 178 L163 246" />
              <path d="M115 84 L165 84" strokeDasharray="4 5" />
            </g>

            <g fill="#e9fff8" stroke="#54d8b9" strokeWidth="2">
              <circle cx="115" cy="84" r="5" />
              <circle cx="165" cy="84" r="5" />
              <circle cx="140" cy="101" r="5" />
              <circle cx="140" cy="143" r="5" />
              <circle cx="140" cy="178" r="5" />
              <circle cx="82" cy="128" r="5" />
              <circle cx="198" cy="128" r="5" />
              <circle cx="96" cy="151" r="5" />
              <circle cx="184" cy="151" r="5" />
              <circle cx="117" cy="246" r="5" />
              <circle cx="163" cy="246" r="5" />
            </g>
          </g>

          <g
            stroke="#52cdb1"
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity=".7"
          >
            <path d="M37 84 H101" />
            <path d="M179 84 H243" />
            <path d="M35 178 H126" />
            <path d="M154 178 H245" />
            <path d="M45 246 H108" />
            <path d="M172 246 H235" />
          </g>

          <g fill="#bdeee2" fontSize="9" fontFamily="sans-serif">
            <text x="20" y="77">SHOULDER</text>
            <text x="20" y="171">TORSO</text>
            <text x="20" y="239">HIP / LEG</text>
          </g>
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#09211f]/90 px-3 py-3 backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:px-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-400/10 text-teal-200">
            <ScanLine size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Pose landmarks</p>
            <p className="mt-1 text-[10px] text-teal-100/60">
              Illustrative visualization
            </p>
          </div>
        </div>
        <Sparkles className="shrink-0 text-teal-200" size={19} />
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-16 animate-scan-line bg-gradient-to-b from-transparent via-teal-300/10 to-transparent" />
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative isolate overflow-hidden bg-[#071b1a] text-white">
          <div className="pointer-events-none absolute -left-52 -top-40 -z-10 size-[620px] animate-pulse-soft rounded-full bg-teal-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute -right-48 top-20 -z-10 size-[520px] rounded-full bg-cyan-400/10 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(rgba(165,243,222,0.5)_0.7px,transparent_0.7px)] [background-size:24px_24px]" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.03fr_0.97fr] lg:gap-14 lg:pb-24 lg:pt-24">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/[0.07] px-4 py-2 text-xs font-medium text-teal-100">
                <Sparkles size={15} />
                <span>Intelligent health technology, in progress</span>
                <ArrowUpRight size={14} className="text-teal-300" />
              </div>

              <h1 className="mt-7 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-5xl md:text-6xl xl:text-[4.35rem]">
                Look deeper.
                <br />
                Understand{" "}
                <span className="bg-gradient-to-r from-teal-200 via-emerald-300 to-cyan-200 bg-clip-text text-transparent">
                  movement.
                </span>
                <br />
                Explore what’s next.
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                MediMind AI is an evolving healthcare technology platform
                exploring computer vision, posture-image analysis, and the
                next generation of personalized AI-assisted tools.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/signup"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-teal-300 px-6 text-sm font-bold text-[#06201d] shadow-lg shadow-teal-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-200"
                >
                  Enter MediMind
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>
                <a
                  href="#features"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:border-teal-200/40 hover:bg-white/[0.08]"
                >
                  Explore the platform
                  <ArrowDown size={16} />
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Check size={15} className="text-teal-300" />
                  Computer vision prototype
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check size={15} className="text-teal-300" />
                  Designed to grow
                </span>
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:180ms]">
              <div className="relative mx-auto max-w-xl">
                <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-teal-300/[0.06] blur-2xl" />
                <div className="relative rounded-[1.75rem] border border-white/10 bg-[#0d2423]/90 p-3 shadow-2xl shadow-black/30 sm:p-5">
                  <div className="flex items-center justify-between gap-3 px-1 pb-4 sm:px-2">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl border border-teal-200/10 bg-teal-300/10 text-teal-200">
                        <HeartPulse size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          MediMind workspace
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          Computer vision lab
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-amber-300/20 bg-amber-200/[0.07] px-3 py-1.5 text-[9px] font-bold tracking-wider text-amber-200">
                      PROTOTYPE
                    </span>
                  </div>

                  <PostureIllustration />

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
                      <div className="flex items-center gap-2 text-teal-200">
                        <Activity size={16} />
                        <span className="text-[10px] font-semibold">
                          Posture
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-white">
                        Image-based observations
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
                      <div className="flex items-center gap-2 text-cyan-200">
                        <BrainCircuit size={16} />
                        <span className="text-[10px] font-semibold">
                          Next stages
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-white">
                        Models and personalization
                      </p>
                    </div>
                  </div>

                  <p className="px-1 pb-1 pt-4 text-[10px] leading-5 text-slate-400">
                    Concept interface, not a clinical report. Outputs are
                    experimental and are not diagnostic findings.
                  </p>
                </div>

                <div className="absolute -left-5 top-24 hidden animate-float rounded-2xl border border-white/10 bg-[#102d2a] p-3 shadow-xl sm:block lg:-left-9">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-teal-300/10 text-teal-200">
                      <ScanLine size={19} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Landmark detection
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Visual analysis
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-3 bottom-28 hidden animate-float rounded-2xl border border-white/10 bg-[#102d2a] p-3 shadow-xl [animation-delay:1.2s] sm:block lg:-right-7">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={19} className="text-teal-200" />
                    <p className="text-xs font-semibold text-white">
                      Built with transparency
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-0 border-t border-white/10 py-5 sm:grid-cols-3">
              {[
                ["Computer vision", "Pose landmarks and geometry"],
                ["Personal workspace", "A planned account-based experience"],
                ["Responsible AI", "Limits explained, not hidden"],
              ].map(([title, description], index) => (
                <div
                  key={title}
                  className={`flex items-start gap-3 py-3 sm:px-5 ${
                    index !== 0 ? "sm:border-l sm:border-white/10" : ""
                  }`}
                >
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-teal-300" />
                  <div>
                    <p className="text-xs font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="scroll-mt-24 bg-[#f7faf9] px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <SectionEyebrow>One evolving platform</SectionEyebrow>
                <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                  Built around the questions{" "}
                  <span className="text-teal-800">that matter.</span>
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-slate-600">
                Starting with working computer vision, then expanding toward
                personal accounts, analysis history, and responsibly developed
                AI capabilities.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.number}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className={`group animate-fade-up rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/[0.05] ${
                      feature.featured
                        ? "border-teal-200 bg-white shadow-sm"
                        : "border-slate-200/80 bg-white/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`grid size-12 place-items-center rounded-2xl transition duration-300 group-hover:scale-105 ${feature.iconStyle}`}
                      >
                        <Icon size={23} />
                      </div>
                      <span className="pt-1 text-xs font-bold tracking-wider text-slate-300">
                        {feature.number}
                      </span>
                    </div>

                    <div className="mt-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.08em] ring-1 ring-inset ${feature.statusStyle}`}
                      >
                        {feature.status}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
                      {feature.title}
                    </h3>
                    <p className="mt-3 min-h-[112px] text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>

                    
<Link
  to={`/roadmap/${feature.slug}`}
  className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600 transition hover:text-teal-800"
>
  <span>Explore detailed roadmap</span>
  <ArrowRight
    size={16}
    className="transition-transform duration-200 group-hover:translate-x-1"
  />
</Link>

                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="scroll-mt-24 overflow-hidden px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionEyebrow>From image to insight</SectionEyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                A more considered way to explore image-based analysis.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">
                The experience is being designed around clear steps, personal
                workspaces, and outputs that explain what was measured rather
                than pretending to know more than the evidence supports.
              </p>

              <a
                href="/signup"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0c3530] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Start your journey
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="relative space-y-5">
              <div className="absolute bottom-10 left-6 top-10 hidden w-px bg-gradient-to-b from-teal-300 via-teal-200 to-transparent sm:block" />

              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    style={{ animationDelay: `${index * 150}ms` }}
                    className="group relative animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/[0.04] sm:p-8"
                  >
                    <div className="flex gap-5 sm:gap-6">
                      <div className="relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-800 transition group-hover:bg-teal-700 group-hover:text-white">
                        <Icon size={22} />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] font-bold tracking-[0.15em] text-teal-800">
                            STEP {step.number}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRIVACY AND RESPONSIBILITY */}
        <section
          id="about"
          className="scroll-mt-24 bg-[#f0f6f4] px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionEyebrow>Trust is part of the design</SectionEyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                Helpful AI starts with honest boundaries.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
                Healthcare technology should make it easier to understand
                information—not turn a model's guess into a medical fact.
                That's why we are developing MediMind AI with transparent
                limitations and account-level privacy as core requirements.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1">
                <div className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-800">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="mt-5 font-semibold text-slate-950">
                  Privacy as a requirement
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  User-specific database rules and protected image storage
                  must be in place before sensitive data is exposed.
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1">
                <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-800">
                  <Stethoscope size={22} />
                </div>
                <h3 className="mt-5 font-semibold text-slate-950">
                  Human expertise matters
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Experimental outputs are not a diagnosis or a substitute
                  for professional care.
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 sm:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-800">
                    <BrainCircuit size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      Models should earn trust through evaluation
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Future models will need appropriate datasets, held-out
                      testing, and evaluation against the specific task they
                      are intended to support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <SectionEyebrow>Good to know</SectionEyebrow>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Questions, answered.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Understand what the current prototype does and what is still
                being built.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-teal-800">
                <CircleHelp size={18} />
                Transparency matters
              </div>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-sm font-semibold text-slate-900 marker:hidden">
                    {faq.question}
                    <ChevronDown
                      size={19}
                      className="shrink-0 text-slate-500 transition duration-200 group-open:rotate-180 group-open:text-teal-800"
                    />
                  </summary>
                  <p className="max-w-2xl pr-6 pt-4 text-sm leading-7 text-slate-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-5 pb-20 sm:px-8 sm:pb-24">
          <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#082a27] px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -left-32 -top-48 -z-10 size-[420px] rounded-full bg-teal-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-56 -right-28 -z-10 size-[460px] rounded-full bg-cyan-400/10 blur-[100px]" />
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(rgba(165,243,222,0.5)_0.7px,transparent_0.7px)] [background-size:24px_24px]" />

            <div className="mx-auto max-w-3xl">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-teal-200">
                <HeartPulse size={27} />
              </div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-teal-200">
                The journey starts here
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                A new perspective on healthcare technology.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Explore the MediMind AI project as we develop its analysis
                tools, private workspace, and future personalized features.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href="/signup"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-300 px-6 text-sm font-bold text-[#072521] transition hover:bg-teal-200"
                >
                  Create your account
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
                <a
                  href="#features"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-6 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
                >
                  Discover features
                  <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
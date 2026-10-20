
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Database,
  HeartPulse,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const roadmaps = {
  posture: {
    title: "Posture Intelligence",
    category: "COMPUTER VISION",
    icon: Activity,
    status: "Working prototype",
    statusClass: "bg-teal-50 text-teal-800 ring-teal-200",
    accent: "from-teal-300/20 via-emerald-200/5 to-transparent",
    description:
      "Understand how the current posture pipeline turns an uploaded photograph into detected landmarks, geometric measurements, and an annotated image.",
    overview:
      "The existing prototype uses MediaPipe Pose Landmarker to estimate body landmarks from an image. Our backend derives selected alignment measurements and draws an overlay that helps users inspect the detected pose.",
    workflow: [
      {
        title: "Upload a supported image",
        description:
          "The frontend submits a JPG, PNG, or WEBP image to the FastAPI posture endpoint.",
      },
      {
        title: "Detect body landmarks",
        description:
          "MediaPipe estimates visible body landmarks. Detection confidence and image quality can affect the result.",
      },
      {
        title: "Calculate geometric measurements",
        description:
          "The backend compares selected landmark positions to produce image-based alignment observations.",
      },
      {
        title: "Review the annotated output",
        description:
          "The response includes a marked-up image and measurements, along with quality warnings where available.",
      },
    ],
    milestones: [
      {
        status: "Implemented",
        title: "Image-analysis API",
        description:
          "Accept supported image uploads and return posture-analysis data.",
        complete: true,
      },
      {
        status: "Implemented",
        title: "Landmark overlay and measurements",
        description:
          "Draw skeleton connections, landmark points, and selected alignment indicators on the image.",
        complete: true,
      },
      {
        status: "Next",
        title: "Connect analysis to user accounts",
        description:
          "Associate every saved analysis with the signed-in user's ID and enforce database access policies.",
      },
      {
        status: "Planned",
        title: "Train and evaluate a posture model",
        description:
          "Define meaningful target labels, collect suitable labelled examples, and compare a trained model against a held-out test set.",
      },
      {
        status: "Planned",
        title: "Movement and multi-image analysis",
        description:
          "Explore repeated images or video sequences for movement analysis, subject to appropriate datasets and evaluation.",
      },
    ],
    technologies: [
      "Python",
      "FastAPI",
      "MediaPipe",
      "OpenCV",
      "React",
      "TensorFlow — planned",
    ],
    limitations: [
      "A two-dimensional photograph cannot reliably establish a complete clinical posture assessment.",
      "Camera angle, body rotation, perspective, lighting, clothing, and landmark-detection errors can affect measurements.",
      "Measurements are experimental observations, not medical diagnoses.",
    ],
  },

  xray: {
    title: "X-ray Analysis",
    category: "MEDICAL IMAGING RESEARCH",
    icon: ScanLine,
    status: "Planned",
    statusClass: "bg-blue-50 text-blue-800 ring-blue-200",
    accent: "from-blue-300/20 via-cyan-200/5 to-transparent",
    description:
      "Explore the proposed pipeline for a carefully evaluated medical-image AI model, from dataset selection through testing and deployment.",
    overview:
      "This feature is not yet an operational X-ray diagnostic tool. Before model training, we must choose a specific research question, obtain an appropriately labelled dataset, verify its permitted use, and define a rigorous evaluation process.",
    workflow: [
      {
        title: "Define one specific research task",
        description:
          "Choose the intended target, such as classifying a particular finding in a clearly defined type of X-ray. The task must match the available labels.",
      },
      {
        title: "Prepare a suitable dataset",
        description:
          "Check label quality, image sources, dataset permissions, class balance, and patient-level separation between training and test samples.",
      },
      {
        title: "Train a baseline model",
        description:
          "Compare an appropriate CNN or transfer-learning approach against simple baselines and inspect errors across relevant groups.",
      },
      {
        title: "Evaluate before considering deployment",
        description:
          "Measure sensitivity, specificity, precision, calibration, and other task-appropriate metrics on held-out data. Independent validation and clinical oversight would be required before clinical use.",
      },
    ],
    milestones: [
      {
        status: "Next",
        title: "Define the model objective",
        description:
          "Decide the exact X-ray type, target finding, intended user, and limits of the model.",
      },
      {
        status: "Planned",
        title: "Select and audit a dataset",
        description:
          "Review labels, licences, data provenance, class distribution, and potential biases.",
      },
      {
        status: "Planned",
        title: "Build a reproducible training pipeline",
        description:
          "Create patient-level splits, a baseline CNN, and documented preprocessing.",
      },
      {
        status: "Planned",
        title: "Evaluate model performance",
        description:
          "Test generalization, false negatives, false positives, calibration, and limitations on held-out data.",
      },
      {
        status: "Future milestone",
        title: "Review deployment readiness",
        description:
          "Assess external validation, privacy, human oversight, applicable regulations, and clinical requirements before any intended medical deployment.",
      },
    ],
    technologies: [
      "Python",
      "TensorFlow / Keras — planned",
      "Image preprocessing",
      "Dataset versioning",
      "Model evaluation",
      "FastAPI integration — later",
    ],
    limitations: [
      "A model trained on one dataset may not generalize to other hospitals, devices, or populations.",
      "Labels such as normal/abnormal do not automatically teach a model to identify specific diseases or fractures.",
      "A research prototype must not be presented as a validated diagnosis or used to delay medical care.",
    ],
  },

  "ai-coach": {
    title: "Personal AI Coach",
    category: "PERSONALIZED LEARNING",
    icon: BrainCircuit,
    status: "Planned",
    statusClass: "bg-violet-50 text-violet-800 ring-violet-200",
    accent: "from-violet-300/20 via-fuchsia-200/5 to-transparent",
    description:
      "A planned coaching experience for helping users understand general health information, organize goals, and follow progress over time.",
    overview:
      "The AI coach should provide educational support rather than diagnose or prescribe. We will define its permitted scope, use reliable information sources where possible, and implement safety checks before connecting it to personal account data.",
    workflow: [
      {
        title: "Understand the user's goal",
        description:
          "Collect relevant preferences and goals with the user's permission. Avoid asking for unnecessary sensitive information.",
      },
      {
        title: "Retrieve relevant information",
        description:
          "Build a process for grounding answers in vetted material rather than relying only on unconstrained model output.",
      },
      {
        title: "Create an educational plan",
        description:
          "Offer clear explanations, practical non-diagnostic learning goals, and suggestions appropriate to the product's scope.",
      },
      {
        title: "Review progress and safety",
        description:
          "Allow the user to review or update goals, make privacy controls clear, and direct medical concerns to qualified professionals.",
      },
    ],
    milestones: [
      {
        status: "Next",
        title: "Define the coach's scope",
        description:
          "Specify supported educational tasks, disallowed medical advice, and when the coach should recommend professional help.",
      },
      {
        status: "Planned",
        title: "Choose information sources",
        description:
          "Identify reliable content, citation or source-display behaviour, and a way to keep source material up to date.",
      },
      {
        status: "Planned",
        title: "Build the conversation interface",
        description:
          "Create a reusable chat interface, conversation states, error handling, and user controls.",
      },
      {
        status: "Planned",
        title: "Personalize with permission",
        description:
          "Use only appropriate profile and goal data under clear access controls and retention rules.",
      },
      {
        status: "Future milestone",
        title: "Evaluate safety and usefulness",
        description:
          "Test factual reliability, unsafe requests, privacy behaviour, and whether responses stay within the feature's intended scope.",
      },
    ],
    technologies: [
      "React",
      "FastAPI",
      "LLM integration — to be selected",
      "Grounded retrieval — planned",
      "Supabase — planned",
      "Safety evaluations",
    ],
    limitations: [
      "The coach is not currently available.",
      "It must not diagnose conditions, prescribe treatment, or replace a healthcare professional.",
      "Personalization requires meaningful consent, minimal data collection, and secure account-level controls.",
    ],
  },

  history: {
    title: "Personal Analysis History",
    category: "ACCOUNT & DATA",
    icon: Database,
    status: "Planned",
    statusClass: "bg-amber-50 text-amber-800 ring-amber-200",
    accent: "from-amber-300/20 via-orange-200/5 to-transparent",
    description:
      "Explore how we plan to organize each user's profile, uploaded images, and saved analysis records in a private account-based workspace.",
    overview:
      "The intended architecture uses Supabase Authentication for identity, PostgreSQL for user profiles and analysis metadata, and private storage for image files. Database and storage policies must enforce ownership on the server side.",
    workflow: [
      {
        title: "Sign in securely",
        description:
          "Use the authenticated user's Supabase ID as the basis for ownership. Never trust a user ID supplied by the browser without server-side enforcement.",
      },
      {
        title: "Save an analysis record",
        description:
          "Store the owner ID, analysis type, timestamps, status, and appropriate result metadata. Avoid retaining more sensitive data than necessary.",
      },
      {
        title: "Protect image storage",
        description:
          "Keep uploads in a private bucket and enforce access policies. Generate time-limited access links when appropriate.",
      },
      {
        title: "Retrieve only the user's records",
        description:
          "Use row-level security and ownership checks so one account cannot read or change another account's history.",
      },
    ],
    milestones: [
      {
        status: "Next",
        title: "Implement authentication",
        description:
          "Configure Supabase email authentication, sessions, signup, login, and logout.",
      },
      {
        status: "Planned",
        title: "Create user profiles and analysis tables",
        description:
          "Define relational tables with owner IDs, timestamps, analysis types, and carefully chosen metadata.",
      },
      {
        status: "Planned",
        title: "Enforce database security",
        description:
          "Enable row-level security and write policies for reading, inserting, updating, and deleting only permitted records.",
      },
      {
        status: "Planned",
        title: "Secure image storage",
        description:
          "Use private storage, ownership-aware policies, validation, and appropriate file-retention controls.",
      },
      {
        status: "Planned",
        title: "Build history and profile screens",
        description:
          "Show a user's own records, support opening or deleting records, and test that cross-account access is denied.",
      },
    ],
    technologies: [
      "Supabase Auth",
      "PostgreSQL",
      "Row Level Security",
      "Private Supabase Storage",
      "React",
      "FastAPI",
    ],
    limitations: [
      "Private account history is not implemented yet.",
      "Hiding another user's records in the interface is not sufficient; database and storage policies must enforce access.",
      "Sensitive medical images should not be stored in a public deployment until the complete security configuration has been implemented and tested.",
    ],
  },
};

function RoadmapPage() {
  const { slug } = useParams();
  const roadmap = roadmaps[slug];

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Roadmap not found
          </h1>
          <p className="mt-3 text-slate-600">
            This roadmap may not exist or may have moved.
          </p>
          <Link
            to="/#features"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
          >
            <ArrowLeft size={17} />
            Back to MediMind AI
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = roadmap.icon;

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden bg-[#071b1a] text-white">
          <div
            className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${roadmap.accent}`}
          />
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(rgba(165,243,222,0.5)_0.7px,transparent_0.7px)] [background-size:24px_24px]" />

          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <Link
              to="/#features"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-teal-200"
            >
              <ArrowLeft size={17} />
              All features
            </Link>

            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_0.7fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] font-bold tracking-[0.17em] text-teal-200">
                  <Sparkles size={14} />
                  {roadmap.category}
                </div>

                <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                  {roadmap.title}
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
                  {roadmap.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ring-1 ring-inset ${roadmap.statusClass}`}
                  >
                    <CircleDashed size={15} />
                    {roadmap.status}
                  </span>
                  <a
                    href="#development-roadmap"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-[#072521] transition hover:-translate-y-0.5 hover:bg-teal-200"
                  >
                    View development plan
                    <ArrowRight size={17} />
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-5 rounded-full bg-teal-300/10 blur-3xl" />
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur sm:p-9">
                  <div className="grid size-14 place-items-center rounded-2xl border border-teal-200/10 bg-teal-300/10 text-teal-200">
                    <Icon size={28} />
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
                    What this feature does
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    {roadmap.overview}
                  </p>
                  <div className="mt-6 flex items-start gap-3 border-t border-white/10 pt-5 text-xs leading-6 text-slate-400">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-teal-200"
                    />
                    Roadmap status is descriptive, not a guarantee of
                    availability or medical performance.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
                Under the hood
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                A step-by-step view of the intended workflow for this
                capability.
              </p>

              <div className="mt-8 rounded-2xl border border-teal-100 bg-teal-50/70 p-5">
                <div className="flex items-center gap-3">
                  <HeartPulse size={21} className="text-teal-800" />
                  <h3 className="font-semibold text-slate-900">
                    Responsible development
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We will distinguish working functionality from future plans,
                  test before expanding claims, and communicate limitations
                  clearly.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {roadmap.workflow.map((step, index) => (
                <article
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-slate-200 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/[0.04] sm:gap-5 sm:p-6"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="development-roadmap"
          className="scroll-mt-24 bg-[#f5f9f8] px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
              Development plan
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              The roadmap, milestone by milestone.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              This is the current plan, not a promise of delivery dates.
              Milestones may change as we test, learn, and implement the
              platform.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {roadmap.milestones.map((milestone, index) => (
                <article
                  key={milestone.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/[0.04]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {milestone.complete ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-800">
                        <CheckCircle2 size={14} />
                        {milestone.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                        <Clock3 size={13} />
                        {milestone.status}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-950">
                    {milestone.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {milestone.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-800">
                  <BrainCircuit size={22} />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Technology plan
                </h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                These are the technologies used or considered for this feature.
                Not every technology listed is integrated yet.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {roadmap.technologies.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck size={22} className="text-amber-800" />
                <h2 className="text-xl font-semibold text-slate-950">
                  Limitations and safeguards
                </h2>
              </div>
              <ul className="mt-5 space-y-3">
                {roadmap.limitations.map((limitation) => (
                  <li
                    key={limitation}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-700" />
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-20">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-[#082a27] p-7 text-white sm:p-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
                <Sparkles size={15} />
                Explore MediMind AI
              </div>
              <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">
                Discover the rest of the platform.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Compare the current prototype with the features planned for
                future development.
              </p>
            </div>

            <Link
              to="/#features"
              className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-teal-300 px-5 text-sm font-bold text-[#072521] transition hover:-translate-y-0.5 hover:bg-teal-200"
            >
              All features
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default RoadmapPage;

import { useEffect } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import RoadmapPage from "./pages/RoadmapPage";
import OnboardingPage from "./pages/OnboardingPage";
import PosturePage from "./pages/PosturePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import VitalReadingsPage from "./pages/VitalReadingsPage";

import ProtectedRoute from "./components/ProtectedRoute";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const frame = requestAnimationFrame(() => {
        const target = document.getElementById(
          decodeURIComponent(hash.slice(1))
        );

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
      });

      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#071b1a] px-5 text-center text-white">
      <h1 className="text-4xl font-bold">Page not found</h1>

      <p className="mt-4 text-sm text-slate-300">
        The page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-7 rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-[#071b1a] transition hover:bg-teal-200"
      >
        Back to MediMind AI
      </Link>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posture"
          element={
            <ProtectedRoute>
              <PosturePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="/roadmap/:slug" element={<RoadmapPage />} />

        <Route path="*" element={<NotFoundPage />} />

        <Route path="/vitals" element={<ProtectedRoute><VitalReadingsPage /></ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
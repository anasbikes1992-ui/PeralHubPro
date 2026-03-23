import React, { lazy, Suspense, useEffect, useRef } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastNotification from "@/components/ToastNotification";
import LoadingScreen from "@/components/LoadingScreen";
import ChatWidget from "@/components/ChatWidget";

// Lazy load pages
const HomePage        = lazy(() => import("@/pages/HomePage"));
const PropertyPage    = lazy(() => import("@/pages/PropertyPage"));
const StaysPage       = lazy(() => import("@/pages/StaysPage"));
const VehiclesPage    = lazy(() => import("@/pages/VehiclesPage"));
const EventsPage      = lazy(() => import("@/pages/EventsPage"));
const DashboardPage   = lazy(() => import("@/pages/DashboardPage"));
const AboutPage       = lazy(() => import("@/pages/AboutPage"));
const ContactPage     = lazy(() => import("@/pages/ContactPage"));
const SettingsPage    = lazy(() => import("@/pages/SettingsPage"));
const AuthPage        = lazy(() => import("@/pages/AuthPage"));
const SearchResultsPage = lazy(() => import("@/pages/SearchResultsPage"));
const SocialPage      = lazy(() => import("@/pages/SocialPage"));
const SMEPage         = lazy(() => import("@/pages/SMEPage"));
const TermsPage       = lazy(() => import("@/pages/TermsPage"));
const ForBusinessPage = lazy(() => import("@/pages/ForBusinessPage"));
const AdminDashboard  = lazy(() => import("@/pages/admin/AdminDashboard"));
const ProviderDashboard = lazy(() => import("@/pages/provider/ProviderDashboard"));
const NotFound          = lazy(() => import("@/pages/NotFound"));
const CustomerTermsPage = lazy(() => import("@/pages/CustomerTermsPage"));
const ProviderTermsPage = lazy(() => import("@/pages/ProviderTermsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-gold-glow" style={{ background: "linear-gradient(135deg, hsl(42 52% 54%), hsl(33 46% 41%))" }} />
      <p className="text-sm text-muted-foreground">Loading Pearl Hub…</p>
    </div>
  </div>
);

// ── Auth sync: keep Zustand in sync with real Supabase session ──────────────
const AuthSync = () => {
  const { user, profile, loading } = useAuth();
  const { setCurrentUser, setUserRole, logout } = useStore();

  useEffect(() => {
    if (loading) return;
    if (profile && user) {
      setCurrentUser({
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role as UserRole,
        verified: profile.verified,
        balance: 0,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        nic: profile.nic,
      });
      setUserRole(profile.role as UserRole);
    } else {
      logout();
    }
  }, [user, profile, loading]);

  return null;
};

const AppLayout = () => {
  const { currentUser, addNotification } = useStore();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (currentUser) {
      // 30-minute idle session timeout
      idleTimer.current = setTimeout(() => {
        // Just clear local state — Supabase session handles server-side expiry
        addNotification("Session Notice", "You've been inactive for 30 minutes. Please refresh if needed.");
      }, 30 * 60 * 1000);
    }
  };

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [currentUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthSync />
        <Sonner />
        <Header />
        <main className="flex-1 min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
        <ToastNotification />
        <ChatWidget />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// ── Route guard — checks REAL Supabase session, not just Zustand state ──────
const RequireAuth = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, profile, loading } = useAuth();

  // Show nothing while session is being determined
  if (loading) return <PageLoader />;

  // No session → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Role-based access control using real profile data
  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true,       element: <HomePage /> },
      { path: "property",  element: <PropertyPage /> },
      { path: "stays",     element: <StaysPage /> },
      { path: "vehicles",  element: <VehiclesPage /> },
      { path: "events",    element: <EventsPage /> },
      { path: "dashboard", element: <RequireAuth><DashboardPage /></RequireAuth> },
      { path: "about",     element: <AboutPage /> },
      { path: "contact",   element: <ContactPage /> },
      { path: "settings",  element: <RequireAuth><SettingsPage /></RequireAuth> },
      { path: "login",     element: <AuthPage /> },
      { path: "search",    element: <SearchResultsPage /> },
      { path: "social",    element: <SocialPage /> },
      { path: "sme",       element: <SMEPage /> },
      { path: "terms",          element: <TermsPage /> },
      { path: "terms/customer", element: <CustomerTermsPage /> },
      { path: "terms/provider", element: <ProviderTermsPage /> },
      { path: "privacy",        element: <TermsPage /> },
      { path: "for-business", element: <ForBusinessPage /> },
      {
        path: "admin",
        element: (
          <RequireAuth roles={["admin"]}>
            <AdminDashboard />
          </RequireAuth>
        ),
      },
      {
        path: "provider",
        element: (
          <RequireAuth roles={["owner", "broker", "stay_provider", "vehicle_provider", "event_provider", "sme"]}>
            <ProviderDashboard />
          </RequireAuth>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return null;
}

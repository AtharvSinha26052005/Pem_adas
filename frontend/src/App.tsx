import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Users from "./pages/Users";
import { MoreVertical } from "lucide-react";

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Read URL Hash for routing on mount
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      if (hash && ["dashboard", "projects", "users"].includes(hash)) {
        // Enforce Admin check for Users view
        if (hash === "users" && user?.role_name !== "Admin") {
          setCurrentView("dashboard");
          window.location.hash = "#/dashboard";
        } else {
          setCurrentView(hash);
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    // Initial check
    if (user) {
      handleHashChange();
    }

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [user]);

  // Handle navigation
  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Visually rich loading screen
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="relative flex items-center justify-center">
          {/* Inner pulsating glow */}
          <div className="w-16 h-16 rounded-full bg-purple-500/10 absolute border border-purple-500/20 animate-ping pointer-events-none" />
          {/* Main spinning ring */}
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin relative z-10" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-slate-400 mt-6 animate-pulse">
          Securing Validation Tunnel...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Auth Page
  if (!user) {
    return <Login />;
  }

  // Render correct active view
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={navigateTo} />;
      case "projects":
        return <Projects />;
      case "users":
        if (user.role_name === "Admin") {
          return <Users />;
        }
        return <Dashboard onNavigate={navigateTo} />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Visual background glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Overlay (mobile only) */}
      {isSidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-20 lg:hidden"
        />
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={navigateTo}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <main
        className={`flex-1 min-h-screen relative z-10 overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-0"
        }`}
      >
        <div className="py-6">
          <div className="px-6 md:px-8 mb-4 flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen((open) => !open)}
              className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/70 hover:bg-slate-900 text-slate-300 transition-colors"
              aria-label={isSidebarOpen ? "Collapse navigation" : "Expand navigation"}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu
            </span>
          </div>
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

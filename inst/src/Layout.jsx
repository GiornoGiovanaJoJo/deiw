import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ClipboardList,
  Tags,
  MessageSquare,
  Warehouse,
  Package,
  Terminal,
  FileText,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
  Building2,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").catch((err) => {
    console.log("Service Worker registration failed:", err);
  });
}

const menuItems = {
  allgemein: {
    title: "Allgemein",
    icon: Building2,
    items: [
      { name: "Dashboard", path: "Dashboard", icon: LayoutDashboard },
      { name: "Aufgaben", path: "Aufgaben", icon: ClipboardList },
      { name: "Benutzer", path: "Benutzer", icon: Users },
      { name: "Subunternehmer", path: "Subunternehmer", icon: Building2 },
      { name: "Kunden", path: "Kunden", icon: Users },
      { name: "Projekte", path: "Projekte", icon: FolderKanban },
      { name: "Kategorien", path: "Kategorien", icon: Tags },
      { name: "Anfragen", path: "Anfragen", icon: Mail },
      { name: "Support", path: "Support", icon: MessageSquare },
    ]
  },
  lager: {
    title: "Lagerverwaltung",
    icon: Warehouse,
    items: [
      { name: "Lager-Dashboard", path: "LagerDashboard", icon: LayoutDashboard },
      { name: "Waren", path: "Waren", icon: Package },
      { name: "Terminal", path: "Terminal", icon: Terminal },
      { name: "Kassas", path: "LagerKassa", icon: Package },
      { name: "Protokoll", path: "Protokoll", icon: FileText },
      { name: "Lager-Benutzer", path: "LagerBenutzer", icon: Users },
    ]
  }
};

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [benutzer, setBenutzer] = useState(null);
  const [allBenutzer, setAllBenutzer] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ allgemein: true, lager: true });
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Load all users for quick switch
      const allUsers = await base44.entities.Benutzer.list();
      setAllBenutzer(allUsers);

      // Check session storage first
      const sessionData = localStorage.getItem("benutzer_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Check if session is not older than 24 hours
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          const benutzerList = await base44.entities.Benutzer.filter({ id: session.id });
          if (benutzerList.length > 0) {
            setBenutzer(benutzerList[0]);
            return;
          }
        }
        localStorage.removeItem("benutzer_session");
      }
    } catch (e) {
      console.log("Error loading user from session");
    }
  };

  const switchUser = (newBenutzerId) => {
    const newBenutzer = allBenutzer.find(b => b.id === newBenutzerId);
    if (newBenutzer) {
      localStorage.setItem("benutzer_session", JSON.stringify({
        id: newBenutzer.id,
        timestamp: Date.now()
      }));
      window.location.reload();
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("benutzer_session");
    navigate(createPageUrl("BenutzerLogin"));
    setTimeout(() => {
      base44.auth.logout();
    }, 100);
  };

  const canAccessPage = (pagePath) => {
    if (!benutzer) return false;

    const position = benutzer.position;

    const accessMap = {
      "Admin": ["Dashboard", "Aufgaben", "Benutzer", "Subunternehmer", "Kunden", "Projekte", "Kategorien", "Anfragen", "Support", "LagerDashboard", "Waren", "Terminal", "LagerKassa", "Protokoll", "LagerBenutzer"],
      "Projektleiter": ["Dashboard", "Aufgaben", "Benutzer", "Subunternehmer", "Kunden", "Projekte", "Kategorien", "Waren", "Terminal"],
      "Gruppenleiter": ["Dashboard", "Aufgaben", "Benutzer", "Projekte", "Waren", "Terminal"],
      "Worker": ["Dashboard", "Aufgaben", "Projekte", "Benutzer", "Waren", "Terminal"],
      "Büro": ["Dashboard", "Aufgaben", "Benutzer", "Kunden", "Projekte", "Support", "Kategorien", "Anfragen", "LagerDashboard", "Protokoll", "LagerBenutzer"],
      "Warehouse": ["Dashboard", "Aufgaben", "Benutzer", "Kategorien", "LagerDashboard", "Waren", "Terminal", "Protokoll", "LagerBenutzer"]
    };

    const allowedPages = accessMap[position] || [];
    return allowedPages.includes(pagePath);
  };

  // Pages without layout


  // Check authentication - redirect to login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const sessionData = localStorage.getItem("benutzer_session");
      let isAuthenticated = false;

      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          isAuthenticated = true;
        }
      }

      if (!isAuthenticated) {
        try {
          await base44.auth.me();
          const benutzerList = await base44.entities.Benutzer.list();
          if (benutzerList.length > 0) {
            isAuthenticated = true;
          }
        } catch (e) {
          // Not authenticated
        }
      }

      if (!isAuthenticated && currentPageName !== "BenutzerLogin" && currentPageName !== "Home" && currentPageName !== "Login" && currentPageName !== "Register") {
        navigate(createPageUrl("Login"));
      }
    };

    checkAuth();
  }, [currentPageName, navigate]);

  // Pages without layout (Rendered after hooks to comply with Rules of Hooks)
  if (currentPageName === "Terminal" || currentPageName === "BenutzerLogin" || currentPageName === "Home" || currentPageName === "Login" || currentPageName === "Register") {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex pb-16 sm:pb-0">

      <style>{`
        :root {
          --primary: #1e40af;
          --primary-light: #3b82f6;
          --accent: #0ea5e9;
        }
        @media (max-width: 1024px) {
          body {
            font-size: 16px; /* Prevent zoom on input focus */
          }
        }
      `}</style>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "h-screen lg:h-auto overflow-y-auto"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">EP</span>
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-slate-800 text-lg">System</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-2 overflow-y-auto h-[calc(100vh-10rem)]">
          {Object.entries(menuItems).map(([key, section]) => {
            return (
              <div key={key} className="mb-4">
                <button
                  onClick={() => toggleSection(key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors",
                    !sidebarOpen && "justify-center"
                  )}
                >
                  <section.icon className="w-5 h-5" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">{section.title}</span>
                      {expandedSections[key] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>

                {(expandedSections[key] || !sidebarOpen) && (
                  <div className={cn("mt-1 space-y-1", sidebarOpen && "ml-2")}>
                    {section.items.map((item) => {
                      if (!canAccessPage(item.path)) return null;
                      const isActive = currentPageName === item.path;

                      return (
                        <Link
                          key={item.path}
                          to={createPageUrl(item.path)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                            isActive
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                            !sidebarOpen && "justify-center"
                          )}
                        >
                          <item.icon className={cn("w-5 h-5", isActive && "text-blue-600")} />
                          {sidebarOpen && <span className="text-sm">{item.name}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100 bg-white">
          {sidebarOpen && allBenutzer.length > 0 && (
            <div className="mb-2">
              <select
                value={benutzer?.id || ""}
                onChange={(e) => switchUser(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-amber-50 text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
              >
                <option value="">Benutzer wechseln (TEST)</option>
                {allBenutzer.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.vorname} {b.nachname} - {b.position}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg",
            sidebarOpen ? "" : "justify-center"
          )}>
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {benutzer ? `${benutzer.vorname} ${benutzer.nachname}` : user?.full_name || "Benutzer"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {benutzer?.position || "Admin"}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">EP-System</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-700">{currentPageName}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Additional header actions can go here */}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
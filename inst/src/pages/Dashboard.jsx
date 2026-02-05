import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FolderKanban, 
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProjectStatusSummary from "@/components/DashboardWidgets/ProjectStatusSummary";
import UpcomingDeadlines from "@/components/DashboardWidgets/UpcomingDeadlines";
import BudgetOverview from "@/components/DashboardWidgets/BudgetOverview";
import RecentActivity from "@/components/DashboardWidgets/RecentActivity";
import DashboardCustomizer from "@/components/DashboardWidgets/DashboardCustomizer";

const StatCard = ({ title, value, icon: Icon, trend, color, bgColor }) => (
  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    projekte: 0,
    projekteInArbeit: 0,
    projekteAbgeschlossen: 0,
    benutzer: 0,
    waren: 0,
    aufgaben: 0,
    offeneAufgaben: 0
  });
  const [projekte, setProjekte] = useState([]);
  const [aufgaben, setAufgaben] = useState([]);
  const [dokumente, setDokumente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleWidgets, setVisibleWidgets] = useState({
    projectStatus: true,
    upcomingDeadlines: true,
    budgetOverview: true,
    recentActivity: true,
    recentProjects: true,
    recentTasks: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projekteData, benutzerData, warenData, aufgabenData, dokumenteData] = await Promise.all([
        base44.entities.Projekt.list(),
        base44.entities.Benutzer.list(),
        base44.entities.Ware.list(),
        base44.entities.Aufgabe.list("-created_date", 20),
        base44.entities.Dokument.list("-created_date", 10)
      ]);

      setProjekte(projekteData);
      setAufgaben(aufgabenData);
      setDokumente(dokumenteData);

      // Load customizer settings
      const saved = localStorage.getItem("dashboardWidgets");
      if (saved) {
        setVisibleWidgets(JSON.parse(saved));
      }

      setStats({
        projekte: projekteData.length,
        projekteInArbeit: projekteData.filter(p => p.status === "In Bearbeitung").length,
        projekteAbgeschlossen: projekteData.filter(p => p.status === "Abgeschlossen").length,
        benutzer: benutzerData.length,
        waren: warenData.length,
        aufgaben: aufgabenData.length,
        offeneAufgaben: aufgabenData.filter(a => a.status === "Offen" || a.status === "In Bearbeitung").length
      });
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    "Geplant": "bg-slate-100 text-slate-700",
    "In Bearbeitung": "bg-blue-100 text-blue-700",
    "Abgeschlossen": "bg-emerald-100 text-emerald-700",
    "Pausiert": "bg-amber-100 text-amber-700",
    "Storniert": "bg-red-100 text-red-700"
  };

  const prioritaetColors = {
    "Niedrig": "bg-slate-100 text-slate-600",
    "Mittel": "bg-blue-100 text-blue-600",
    "Hoch": "bg-amber-100 text-amber-600",
    "Kritisch": "bg-red-100 text-red-600"
  };

  const pieData = [
    { name: "Geplant", value: projekte.filter(p => p.status === "Geplant").length, color: "#94a3b8" },
    { name: "In Bearbeitung", value: projekte.filter(p => p.status === "In Bearbeitung").length, color: "#3b82f6" },
    { name: "Abgeschlossen", value: projekte.filter(p => p.status === "Abgeschlossen").length, color: "#10b981" },
    { name: "Pausiert", value: projekte.filter(p => p.status === "Pausiert").length, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Übersicht über Ihr Unternehmen</p>
        </div>
        <DashboardCustomizer onSave={setVisibleWidgets} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Projekte gesamt"
          value={stats.projekte}
          icon={FolderKanban}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="In Bearbeitung"
          value={stats.projekteInArbeit}
          icon={Clock}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Abgeschlossen"
          value={stats.projekteAbgeschlossen}
          icon={CheckCircle2}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Offene Aufgaben"
          value={stats.offeneAufgaben}
          icon={ClipboardList}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Widgets Grid */}
      <div className="space-y-6">
        {/* Row 1: Status & Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleWidgets.projectStatus && <ProjectStatusSummary projekte={projekte} />}
          {visibleWidgets.upcomingDeadlines && (
            <UpcomingDeadlines aufgaben={aufgaben} projekte={projekte} />
          )}
        </div>

        {/* Row 2: Budget & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleWidgets.budgetOverview && <BudgetOverview projekte={projekte} />}
          {visibleWidgets.recentActivity && (
            <RecentActivity aufgaben={aufgaben} projekte={projekte} dokumente={dokumente} />
          )}
        </div>

        {/* Row 3: Recent Projects & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleWidgets.recentProjects && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Aktuelle Projekte</CardTitle>
                <Link 
                  to={createPageUrl("Projekte")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Alle →
                </Link>
              </CardHeader>
              <CardContent>
                {projekte.length > 0 ? (
                  <div className="space-y-3">
                    {projekte.slice(0, 5).map((projekt) => (
                      <Link
                        key={projekt.id}
                        to={createPageUrl(`ProjektDetail?id=${projekt.id}`)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FolderKanban className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{projekt.name}</p>
                            <p className="text-sm text-slate-500">{projekt.projekt_nummer}</p>
                          </div>
                        </div>
                        <Badge className={`${statusColors[projekt.status]} flex-shrink-0`}>
                          {projekt.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    Keine Projekte vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {visibleWidgets.recentTasks && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Aktuelle Aufgaben</CardTitle>
                <Link 
                  to={createPageUrl("Aufgaben")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Alle →
                </Link>
              </CardHeader>
              <CardContent>
                {aufgaben.length > 0 ? (
                  <div className="space-y-3">
                    {aufgaben.slice(0, 5).map((aufgabe) => (
                      <div
                        key={aufgabe.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            aufgabe.status === "Erledigt" ? "bg-emerald-500" :
                            aufgabe.status === "In Bearbeitung" ? "bg-blue-500" : "bg-slate-400"
                          }`} />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{aufgabe.titel}</p>
                            <p className="text-sm text-slate-500 truncate">
                              {aufgabe.zugewiesen_name || "Nicht zugewiesen"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge className={`${prioritaetColors[aufgabe.prioritaet]} text-xs`}>
                            {aufgabe.prioritaet}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    Keine Aufgaben vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
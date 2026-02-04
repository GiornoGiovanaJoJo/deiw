import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const StatCard = ({ title, value, icon: Icon, color, bgColor, subtitle }) => (
  <Card className="border-0 shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function LagerDashboard() {
  const [stats, setStats] = useState({
    totalWaren: 0,
    niedrigBestand: 0,
    ausverkauft: 0,
    gesamtwert: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [kategorieStats, setKategorieStats] = useState([]);
  const [bewegungen, setBewegungen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [warenData, logsData, kategorienData] = await Promise.all([
        base44.entities.Ware.list(),
        base44.entities.WarenLog.list("-created_date", 20),
        base44.entities.Kategorie.filter({ typ: "Ware" })
      ]);

      // Calculate stats
      const niedrig = warenData.filter(w => w.status === "Niedrig").length;
      const ausverkauft = warenData.filter(w => w.status === "Ausverkauft").length;
      const gesamtwert = warenData.reduce((sum, w) => sum + ((w.bestand || 0) * (w.einkaufspreis || 0)), 0);

      setStats({
        totalWaren: warenData.length,
        niedrigBestand: niedrig,
        ausverkauft: ausverkauft,
        gesamtwert: gesamtwert
      });

      setRecentLogs(logsData);

      // Category distribution
      const katStats = kategorienData.map(kat => ({
        name: kat.name,
        count: warenData.filter(w => w.kategorie_id === kat.id).length,
        color: kat.farbe || "#3b82f6"
      })).filter(k => k.count > 0);
      setKategorieStats(katStats);

      // Movement stats for chart
      const today = new Date();
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = format(date, "yyyy-MM-dd");
        
        const dayLogs = logsData.filter(log => {
          const logDate = format(new Date(log.created_date), "yyyy-MM-dd");
          return logDate === dateStr;
        });
        
        const entnahmen = dayLogs.filter(l => l.aktion === "Entnahme").reduce((sum, l) => sum + (l.menge || 0), 0);
        const rueckgaben = dayLogs.filter(l => l.aktion === "Rückgabe" || l.aktion === "Eingang").reduce((sum, l) => sum + (l.menge || 0), 0);
        
        last7Days.push({
          tag: format(date, "EEE", { locale: de }),
          entnahmen,
          rueckgaben
        });
      }
      setBewegungen(last7Days);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const aktionColors = {
    "Entnahme": "text-red-600 bg-red-50",
    "Rückgabe": "text-emerald-600 bg-emerald-50",
    "Eingang": "text-blue-600 bg-blue-50",
    "Korrektur": "text-amber-600 bg-amber-50",
    "Inventur": "text-purple-600 bg-purple-50"
  };

  const aktionIcons = {
    "Entnahme": ArrowUpCircle,
    "Rückgabe": ArrowDownCircle,
    "Eingang": ArrowDownCircle,
    "Korrektur": Clock,
    "Inventur": Clock
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lager-Dashboard</h1>
        <p className="text-slate-500 mt-1">Übersicht über Bestände und Bewegungen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Artikel gesamt"
          value={stats.totalWaren}
          icon={Package}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Niedriger Bestand"
          value={stats.niedrigBestand}
          icon={TrendingDown}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Ausverkauft"
          value={stats.ausverkauft}
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Lagerwert"
          value={`${stats.gesamtwert.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`}
          icon={TrendingUp}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movement Chart */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Lagerbewegungen (7 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bewegungen}>
                  <XAxis dataKey="tag" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="entnahmen" name="Entnahmen" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rueckgaben" name="Eingänge" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-slate-600">Entnahmen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Eingänge/Rückgaben</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Nach Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            {kategorieStats.length > 0 ? (
              <>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={kategorieStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {kategorieStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {kategorieStats.map((kat) => (
                    <div key={kat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: kat.color }} />
                        <span className="text-slate-600">{kat.name}</span>
                      </div>
                      <span className="font-medium text-slate-800">{kat.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Keine Kategorien vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Letzte Aktivitäten</CardTitle>
          <Link to={createPageUrl("Protokoll")} className="text-sm text-blue-600 hover:text-blue-700">
            Alle anzeigen →
          </Link>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Keine Aktivitäten vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.slice(0, 8).map((log) => {
                const Icon = aktionIcons[log.aktion] || Clock;
                return (
                  <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                    <div className={`p-2 rounded-lg ${aktionColors[log.aktion]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{log.ware_name}</p>
                      <p className="text-sm text-slate-500">
                        {log.benutzer_name} • {log.menge} {log.aktion}
                        {log.projekt_nummer && ` • ${log.projekt_nummer}`}
                      </p>
                    </div>
                    <div className="text-sm text-slate-400">
                      {format(new Date(log.created_date), "dd.MM. HH:mm", { locale: de })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
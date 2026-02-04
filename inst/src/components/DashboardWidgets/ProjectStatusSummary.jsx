import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { FolderKanban } from "lucide-react";

export default function ProjectStatusSummary({ projekte }) {
  const getStatusData = () => {
    const statusMap = {
      Geplant: 0,
      "In Bearbeitung": 0,
      Abgeschlossen: 0,
      Pausiert: 0,
      Storniert: 0,
    };

    projekte.forEach((p) => {
      if (statusMap.hasOwnProperty(p.status)) {
        statusMap[p.status]++;
      }
    });

    return Object.entries(statusMap)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => {
        const colors = {
          Geplant: "#94a3b8",
          "In Bearbeitung": "#3b82f6",
          Abgeschlossen: "#10b981",
          Pausiert: "#f59e0b",
          Storniert: "#ef4444",
        };
        return { name, value: count, fill: colors[name] };
      });
  };

  const statusData = getStatusData();

  const getStats = () => {
    return {
      total: projekte.length,
      inProgress: projekte.filter((p) => p.status === "In Bearbeitung").length,
      completed: projekte.filter((p) => p.status === "Abgeschlossen").length,
      atRisk: projekte.filter(
        (p) => p.prioritaet === "Kritisch" && p.status !== "Abgeschlossen"
      ).length,
    };
  };

  const stats = getStats();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-blue-600" />
          Projekt-Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusData.length > 0 ? (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Gesamt</p>
                <p className="text-xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-slate-600">In Bearbeitung</p>
                <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <p className="text-xs text-slate-600">Fertig</p>
                <p className="text-xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              {stats.atRisk > 0 && (
                <div className="p-2 bg-red-50 rounded-lg">
                  <p className="text-xs text-slate-600">Gefährdet</p>
                  <p className="text-xl font-bold text-red-600">{stats.atRisk}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <FolderKanban className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>Keine Projekte vorhanden</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
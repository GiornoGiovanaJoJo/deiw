import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function RecentActivity({ aufgaben, projekte, dokumente }) {
  const getRecentActivities = () => {
    const activities = [];

    // Recent completed tasks
    aufgaben
      .filter((a) => a.status === "Erledigt")
      .slice(0, 3)
      .forEach((a) => {
        activities.push({
          id: a.id,
          type: "task",
          title: `Aufgabe erledigt: ${a.titel}`,
          date: a.updated_date || a.created_date,
          icon: CheckCircle2,
          color: "emerald",
        });
      });

    // Recently modified projects
    projekte
      .slice(0, 2)
      .forEach((p) => {
        activities.push({
          id: p.id,
          type: "project",
          title: `Projekt aktualisiert: ${p.name}`,
          date: p.updated_date || p.created_date,
          icon: Clock,
          color: "blue",
        });
      });

    // Recently added documents
    dokumente
      .slice(0, 2)
      .forEach((d) => {
        activities.push({
          id: d.id,
          type: "document",
          title: `Dokument hinzugefügt: ${d.titel}`,
          date: d.created_date,
          icon: FileText,
          color: "purple",
        });
      });

    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const activities = getRecentActivities();

  const colorConfig = {
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          Neueste Aktivitäten
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.color === "emerald" ? "bg-emerald-50" :
                    activity.color === "blue" ? "bg-blue-50" :
                    "bg-purple-50"
                  }`}>
                    <Icon className={`w-4 h-4 ${colorConfig[activity.color]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(activity.date), "dd.MM.yyyy HH:mm", {
                        locale: de,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>Keine Aktivitäten vorhanden</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
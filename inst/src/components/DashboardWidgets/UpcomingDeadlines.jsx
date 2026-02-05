import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";

export default function UpcomingDeadlines({ aufgaben, projekte }) {
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const deadlines = [];

    aufgaben.forEach((a) => {
      if (a.faellig_am && a.status !== "Erledigt") {
        const daysLeft = differenceInDays(new Date(a.faellig_am), today);
        if (daysLeft >= 0 && daysLeft <= 14) {
          deadlines.push({
            id: a.id,
            type: "aufgabe",
            title: a.titel,
            dueDate: a.faellig_am,
            daysLeft,
            priority: a.prioritaet,
            link: createPageUrl("Aufgaben"),
          });
        }
      }
    });

    projekte.forEach((p) => {
      if (p.enddatum && p.status !== "Abgeschlossen") {
        const daysLeft = differenceInDays(new Date(p.enddatum), today);
        if (daysLeft >= 0 && daysLeft <= 14) {
          deadlines.push({
            id: p.id,
            type: "projekt",
            title: p.name,
            dueDate: p.enddatum,
            daysLeft,
            priority: p.prioritaet,
            link: createPageUrl(`ProjektDetail?id=${p.id}`),
          });
        }
      }
    });

    return deadlines.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);
  };

  const deadlines = getUpcomingDeadlines();

  const priorityColors = {
    Niedrig: "bg-slate-100 text-slate-700",
    Mittel: "bg-blue-100 text-blue-700",
    Hoch: "bg-amber-100 text-amber-700",
    Kritisch: "bg-red-100 text-red-700",
  };

  const getDaysLeftColor = (days) => {
    if (days === 0) return "text-red-600 font-bold";
    if (days <= 2) return "text-red-500 font-semibold";
    if (days <= 7) return "text-amber-600";
    return "text-slate-600";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Anstehende Deadlines
          </CardTitle>
          <span className="text-xs text-slate-500">{deadlines.length} kommend</span>
        </div>
      </CardHeader>
      <CardContent>
        {deadlines.length > 0 ? (
          <div className="space-y-3">
            {deadlines.map((deadline) => (
              <Link
                key={deadline.id}
                to={deadline.link}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {deadline.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                      {format(new Date(deadline.dueDate), "dd.MM.yyyy", {
                        locale: de,
                      })}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {deadline.type === "projekt" ? "Projekt" : "Aufgabe"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${getDaysLeftColor(deadline.daysLeft)}`}>
                      {deadline.daysLeft === 0 ? "Heute" : `${deadline.daysLeft}d`}
                    </p>
                  </div>
                  {deadline.priority && (
                    <Badge className={priorityColors[deadline.priority]}>
                      {deadline.priority}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>Keine anstehenden Deadlines</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
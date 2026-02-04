import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export default function DashboardCustomizer({ onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [widgets, setWidgets] = useState({
    projectStatus: true,
    upcomingDeadlines: true,
    budgetOverview: true,
    recentActivity: true,
    recentProjects: true,
    recentTasks: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("dashboardWidgets");
    if (saved) {
      setWidgets(JSON.parse(saved));
    }
  }, []);

  const widgetConfig = [
    { id: "projectStatus", label: "Projekt-Übersicht", description: "Zeigt Projektstatistiken und Diagramm" },
    { id: "upcomingDeadlines", label: "Anstehende Deadlines", description: "Kommende Aufgaben und Projekte" },
    { id: "budgetOverview", label: "Budget-Übersicht", description: "Budget-Auslastung und Ausgaben" },
    { id: "recentActivity", label: "Neueste Aktivitäten", description: "Kürzliche Änderungen und Aktivitäten" },
    { id: "recentProjects", label: "Aktuelle Projekte", description: "Kürzlich bearbeitete Projekte" },
    { id: "recentTasks", label: "Aktuelle Aufgaben", description: "Neueste Aufgaben" },
  ];

  const handleToggle = (id) => {
    setWidgets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSave = () => {
    localStorage.setItem("dashboardWidgets", JSON.stringify(widgets));
    onSave(widgets);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Settings className="w-4 h-4" />
        Anpassen
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dashboard anpassen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {widgetConfig.map((widget) => (
              <div key={widget.id} className="flex items-start gap-3">
                <Checkbox
                  id={widget.id}
                  checked={widgets[widget.id]}
                  onCheckedChange={() => handleToggle(widget.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={widget.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {widget.label}
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {widget.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
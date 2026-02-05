import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  BarChart3,
  CheckCircle2,
  Euro,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function ProjectReport({ projekt }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [projekt.id]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [etappen, dokumente, warenLogs, kunde] = await Promise.all([
        base44.entities.Etappe.filter({ projekt_id: projekt.id }),
        base44.entities.Dokument.filter({ projekt_id: projekt.id }),
        base44.entities.WarenLog.filter({ projekt_id: projekt.id }),
        projekt.kunde_id
          ? base44.entities.Kunde.filter({ id: projekt.kunde_id })
          : Promise.resolve([]),
      ]);

      const etappenAbgeschlossen = etappen.filter(
        (e) => e.status === "Abgeschlossen"
      ).length;
      const totalEtappen = etappen.length;

      setReportData({
        etappen,
        etappenAbgeschlossen,
        totalEtappen,
        dokumente,
        warenLogs,
        kunde: kunde.length > 0 ? kunde[0] : null,
      });
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Laden der Berichtsdaten");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) return;

    setExporting(true);
    try {
      const response = await base44.functions.invoke("generateProjectReport", {
        projektId: projekt.id,
        projektName: projekt.name,
        projektNummer: projekt.projekt_nummer,
        status: projekt.status,
        prioritaet: projekt.prioritaet,
        budget: projekt.budget,
        startdatum: projekt.startdatum,
        enddatum: projekt.enddatum,
        adresse: projekt.adresse,
        beschreibung: projekt.beschreibung,
        kunde: reportData.kunde,
        etappen: reportData.etappen,
        etappenAbgeschlossen: reportData.etappenAbgeschlossen,
        totalEtappen: reportData.totalEtappen,
        dokumenteCount: reportData.dokumente.length,
      });

      // Download PDF
      const link = document.createElement("a");
      link.href = response.data.file_url;
      link.download = `${projekt.projekt_nummer}_Bericht.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Bericht exportiert");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Generieren des PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!reportData) return null;

  const statusColors = {
    Geplant: "bg-slate-100 text-slate-700",
    "In Bearbeitung": "bg-blue-100 text-blue-700",
    Abgeschlossen: "bg-emerald-100 text-emerald-700",
    Pausiert: "bg-amber-100 text-amber-700",
    Storniert: "bg-red-100 text-red-700",
  };

  const prioritaetColors = {
    Niedrig: "bg-slate-100 text-slate-600",
    Mittel: "bg-blue-100 text-blue-600",
    Hoch: "bg-amber-100 text-amber-600",
    Kritisch: "bg-red-100 text-red-600",
  };

  const completionPercentage = reportData.totalEtappen
    ? Math.round((reportData.etappenAbgeschlossen / reportData.totalEtappen) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Projektbericht</h2>
        </div>
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? "Wird generiert..." : "Als PDF exportieren"}
        </Button>
      </div>

      {/* Überblick */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <Badge className={statusColors[projekt.status]}>
                  {projekt.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Priorität</p>
                <Badge className={prioritaetColors[projekt.prioritaet]}>
                  {projekt.prioritaet}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Etappen</p>
                <p className="text-lg font-semibold text-slate-800">
                  {reportData.etappenAbgeschlossen}/{reportData.totalEtappen}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {projekt.budget && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Euro className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {projekt.budget.toLocaleString("de-DE")} €
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Etappen Progress */}
      {reportData.totalEtappen > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Etappen-Fortschritt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Abgeschlossen</p>
                <p className="text-sm font-semibold text-slate-800">
                  {completionPercentage}%
                </p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              {Object.entries(
                reportData.etappen.reduce(
                  (acc, e) => {
                    acc[e.status] = (acc[e.status] || 0) + 1;
                    return acc;
                  },
                  {}
                )
              ).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{count}</p>
                  <p className="text-xs text-slate-500">{status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projektdetails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Projektinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Projektnummer</p>
              <p className="text-sm font-medium text-slate-800">
                {projekt.projekt_nummer}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Projektname</p>
              <p className="text-sm font-medium text-slate-800">
                {projekt.name}
              </p>
            </div>
            {projekt.adresse && (
              <div>
                <p className="text-xs text-slate-500">Adresse</p>
                <p className="text-sm text-slate-700">{projekt.adresse}</p>
              </div>
            )}
            {projekt.beschreibung && (
              <div>
                <p className="text-xs text-slate-500">Beschreibung</p>
                <p className="text-sm text-slate-700">
                  {projekt.beschreibung}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Zeitplan & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projekt.startdatum && (
              <div>
                <p className="text-xs text-slate-500">Startdatum</p>
                <p className="text-sm font-medium text-slate-800">
                  {format(new Date(projekt.startdatum), "dd.MM.yyyy", {
                    locale: de,
                  })}
                </p>
              </div>
            )}
            {projekt.enddatum && (
              <div>
                <p className="text-xs text-slate-500">Enddatum</p>
                <p className="text-sm font-medium text-slate-800">
                  {format(new Date(projekt.enddatum), "dd.MM.yyyy", {
                    locale: de,
                  })}
                </p>
              </div>
            )}
            {reportData.kunde && (
              <div>
                <p className="text-xs text-slate-500">Kunde</p>
                <p className="text-sm font-medium text-slate-800">
                  {reportData.kunde.firma}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zusammenfassung */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Etappen</p>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.totalEtappen}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {reportData.etappenAbgeschlossen} abgeschlossen
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Dokumente</p>
              <p className="text-2xl font-bold text-purple-600">
                {reportData.dokumente.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {reportData.dokumente.filter((d) => d.status === "Aktiv")
                  .length}{" "}
                aktiv
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Material</p>
              <p className="text-2xl font-bold text-green-600">
                {reportData.warenLogs.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Einträge</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
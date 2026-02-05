import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  FileText,
  Calendar,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function Protokoll() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAktion, setFilterAktion] = useState("all");
  const [filterDatum, setFilterDatum] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await base44.entities.WarenLog.list("-created_date", 500);
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.ware_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.benutzer_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.projekt_nummer?.toLowerCase().includes(search.toLowerCase());
    const matchesAktion = filterAktion === "all" || log.aktion === filterAktion;
    const matchesDatum = !filterDatum || format(new Date(log.created_date), "yyyy-MM-dd") === filterDatum;
    return matchesSearch && matchesAktion && matchesDatum;
  });

  const aktionColors = {
    "Entnahme": "bg-red-100 text-red-700",
    "Rückgabe": "bg-emerald-100 text-emerald-700",
    "Eingang": "bg-blue-100 text-blue-700",
    "Korrektur": "bg-amber-100 text-amber-700",
    "Inventur": "bg-purple-100 text-purple-700",
    "Verkauf": "bg-green-100 text-green-700"
  };

  const aktionIcons = {
    "Entnahme": ArrowUpCircle,
    "Rückgabe": ArrowDownCircle,
    "Eingang": ArrowDownCircle,
    "Korrektur": Clock,
    "Inventur": Clock,
    "Verkauf": ArrowUpCircle
  };

  const exportToCSV = () => {
    const headers = ["Datum", "Artikel", "Aktion", "Menge", "Benutzer", "Projekt"];
    const rows = filteredLogs.map(log => [
      format(new Date(log.created_date), "dd.MM.yyyy HH:mm"),
      log.ware_name,
      log.aktion,
      log.menge,
      log.benutzer_name,
      log.projekt_nummer || "-"
    ]);

    const csv = [headers, ...rows].map(row => row.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `protokoll_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Protokoll</h1>
          <p className="text-slate-500 mt-1">Vollständige Historie aller Lagerbewegungen</p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          CSV Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Artikel, Benutzer oder Projekt suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAktion} onValueChange={setFilterAktion}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Aktion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Aktionen</SelectItem>
                <SelectItem value="Entnahme">Entnahme</SelectItem>
                <SelectItem value="Rückgabe">Rückgabe</SelectItem>
                <SelectItem value="Eingang">Eingang</SelectItem>
                <SelectItem value="Korrektur">Korrektur</SelectItem>
                <SelectItem value="Inventur">Inventur</SelectItem>
                <SelectItem value="Verkauf">Verkauf</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={filterDatum}
                onChange={(e) => setFilterDatum(e.target.value)}
                className="pl-10 w-full md:w-44"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Gesamt Einträge</p>
            <p className="text-2xl font-bold text-slate-800">{filteredLogs.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Entnahmen</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredLogs.filter(l => l.aktion === "Entnahme").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Rückgaben</p>
            <p className="text-2xl font-bold text-emerald-600">
              {filteredLogs.filter(l => l.aktion === "Rückgabe").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Eingänge</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredLogs.filter(l => l.aktion === "Eingang").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Verkäufe</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredLogs.filter(l => l.aktion === "Verkauf").length}
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum & Zeit</TableHead>
                <TableHead>Artikel</TableHead>
                <TableHead>Aktion</TableHead>
                <TableHead>Menge</TableHead>
                <TableHead className="hidden lg:table-cell">Benutzer</TableHead>
                <TableHead className="hidden lg:table-cell">Notizen</TableHead>
                <TableHead className="hidden md:table-cell">Projekt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Keine Einträge gefunden</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const Icon = aktionIcons[log.aktion] || Clock;
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-800">
                            {format(new Date(log.created_date), "dd.MM.yyyy", { locale: de })}
                          </p>
                          <p className="text-sm text-slate-500">
                            {format(new Date(log.created_date), "HH:mm", { locale: de })} Uhr
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-800">{log.ware_name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={aktionColors[log.aktion]}>
                          <Icon className="w-3 h-3 mr-1" />
                          {log.aktion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{log.menge}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-600">
                        {log.benutzer_name || "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-600">
                        <div className="text-sm">
                          <p className="text-slate-700">{log.notiz || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {log.projekt_nummer ? (
                          <Badge variant="outline">{log.projekt_nummer}</Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
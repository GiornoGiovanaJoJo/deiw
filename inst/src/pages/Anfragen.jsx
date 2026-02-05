import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CreateProjectMinimal from "@/components/CreateProjectMinimal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, FileText, Mail, Phone, MapPin, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function Anfragen() {
  const [anfragen, setAnfragen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAnfrage, setSelectedAnfrage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [notizen, setNotizen] = useState("");
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await base44.entities.Anfrage.list("-created_date");
      
      // Load project numbers for anfragen with projekt_id
      const anfrageWithProjects = await Promise.all(
        data.map(async (anfrage) => {
          if (anfrage.projekt_id) {
            try {
              const projekt = await base44.entities.Projekt.filter({ id: anfrage.projekt_id });
              return { ...anfrage, projekt_nummer: projekt[0]?.projekt_nummer };
            } catch (e) {
              return anfrage;
            }
          }
          return anfrage;
        })
      );
      
      setAnfragen(anfrageWithProjects);
    } catch (error) {
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAnfrage = (anfrage) => {
    setSelectedAnfrage(anfrage);
    setStatus(anfrage.status || "Neu");
    setNotizen(anfrage.notizen || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      await base44.entities.Anfrage.update(selectedAnfrage.id, {
        status,
        notizen
      });
      toast.success("Anfrage aktualisiert");
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleCreateProject = () => {
    if (!selectedAnfrage) return;
    setCreateProjectDialogOpen(true);
  };

  const filteredAnfragen = anfragen.filter(a => {
    const matchesSearch =
      a.kunde_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.kunde_email?.toLowerCase().includes(search.toLowerCase()) ||
      a.kategorie?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    "Neu": "bg-blue-100 text-blue-700",
    "In Bearbeitung": "bg-amber-100 text-amber-700",
    "Angeboten": "bg-purple-100 text-purple-700",
    "Abgeschlossen": "bg-green-100 text-green-700",
    "Abgelehnt": "bg-red-100 text-red-700"
  };

  const kategorieColors = {
    "Elektrik": "bg-yellow-50 text-yellow-700",
    "Sanitär": "bg-blue-50 text-blue-700",
    "Zimmerei": "bg-amber-50 text-amber-700"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Anfragen Management</h1>
        <p className="text-slate-500 mt-1">Verwaltung von Kundenanfragen</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Name, E-Mail oder Kategorie suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="Neu">Neu</SelectItem>
                <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                <SelectItem value="Angeboten">Angeboten</SelectItem>
                <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
                <SelectItem value="Abgelehnt">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead className="hidden md:table-cell">Kategorie</TableHead>
                <TableHead className="hidden lg:table-cell">Unterkategorie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Datum</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredAnfragen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Keine Anfragen gefunden</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnfragen.map((anfrage) => (
                  <TableRow key={anfrage.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleOpenAnfrage(anfrage)}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800">{anfrage.kunde_name}</p>
                        <p className="text-sm text-slate-500">{anfrage.kunde_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className={kategorieColors[anfrage.kategorie]}>
                        {anfrage.kategorie}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-slate-700">
                      {anfrage.unterkategorie}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[anfrage.status]}>
                        {anfrage.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-slate-500 text-sm">
                      {format(new Date(anfrage.created_date), "dd.MM.yyyy HH:mm", { locale: de })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anfrage Details</DialogTitle>
          </DialogHeader>
          {selectedAnfrage && (
            <div className="space-y-4 py-4">
              {/* Anfrage Info */}
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">Anfrage-Informationen</h3>
                  <Badge className={statusColors[selectedAnfrage.status]}>
                    {selectedAnfrage.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-500">Kategorie</p>
                      <p className="font-medium text-slate-700">{selectedAnfrage.kategorie}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-500">Unterkategorie</p>
                      <p className="font-medium text-slate-700">{selectedAnfrage.unterkategorie}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-500">Email</p>
                      <p className="font-medium text-slate-700">{selectedAnfrage.kunde_email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-500">Telefon</p>
                      <p className="font-medium text-slate-700">{selectedAnfrage.kunde_telefon}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-500">Adresse</p>
                      <p className="font-medium text-slate-700">{selectedAnfrage.kunde_adresse}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-slate-500">Eingereicht am</p>
                      <p className="font-medium text-slate-700">
                        {format(new Date(selectedAnfrage.created_date), "dd.MM.yyyy HH:mm", { locale: de })}
                      </p>
                    </div>
                  </div>
                  {selectedAnfrage.projekt_id && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <FileText className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-slate-500">Projekt erstellt</p>
                        <p className="font-medium text-green-700">{selectedAnfrage.projekt_nummer || selectedAnfrage.projekt_id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Antworten */}
              {selectedAnfrage.antworten && Object.keys(selectedAnfrage.antworten).length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Antworten des Kunden</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedAnfrage.antworten).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-blue-100 last:border-0">
                        <span className="text-slate-600 capitalize">{key.replace(/_/g, " ")}:</span>
                        <span className="font-medium text-slate-800">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status & Notizen */}
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Neu">Neu</SelectItem>
                      <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                      <SelectItem value="Angeboten">Angeboten</SelectItem>
                      <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
                      <SelectItem value="Abgelehnt">Abgelehnt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notizen</Label>
                  <Textarea
                    value={notizen}
                    onChange={(e) => setNotizen(e.target.value)}
                    rows={4}
                    placeholder="Interne Notizen..."
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateProject} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Als Projekt erstellen
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Speichern
            </Button>
          </DialogFooter>
          </DialogContent>
          </Dialog>

          {/* Create Project Dialog */}
          <CreateProjectMinimal 
          open={createProjectDialogOpen} 
          onOpenChange={setCreateProjectDialogOpen}
          anfrage={selectedAnfrage}
          />
          </div>
          );
          }
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, CheckCircle2, Clock, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function Aufgaben() {
  const [aufgaben, setAufgaben] = useState([]);
  const [benutzer, setBenutzer] = useState([]);
  const [projekte, setProjekte] = useState([]);
  const [currentBenutzer, setCurrentBenutzer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBenutzer, setFilterBenutzer] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAufgabe, setEditingAufgabe] = useState(null);
  const [form, setForm] = useState({
    titel: "",
    beschreibung: "",
    zugewiesen_an: "",
    projekt_id: "",
    prioritaet: "Mittel",
    status: "Offen",
    faellig_am: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessionData = localStorage.getItem("benutzer_session");
      let currentUser = null;
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const benutzerList = await base44.entities.Benutzer.filter({ id: session.id });
        if (benutzerList.length > 0) {
          currentUser = benutzerList[0];
        }
      }
      setCurrentBenutzer(currentUser);

      const [aufgabenData, benutzerData, projekteData] = await Promise.all([
        base44.entities.Aufgabe.list("-created_date"),
        base44.entities.Benutzer.list(),
        base44.entities.Projekt.list()
      ]);
      setAufgaben(aufgabenData);
      setBenutzer(benutzerData);
      setProjekte(projekteData);
    } catch (error) {
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.titel) {
      toast.error("Bitte Titel eingeben");
      return;
    }

    try {
      const data = { ...form };
      
      // Если Worker - автоматически назначаем на себя
      if (currentBenutzer && currentBenutzer.position === "Worker") {
        data.zugewiesen_an = currentBenutzer.id;
      }
      
      // Если выбрано "Для всех" - сохраняем как пустое значение
      if (data.zugewiesen_an === "__ALL__") {
        data.zugewiesen_an = "";
        data.zugewiesen_name = "Allgemein";
      } else {
        // Add names for quick display
        const selectedBenutzer = benutzer.find(b => b.id === data.zugewiesen_an);
        if (selectedBenutzer) {
          data.zugewiesen_name = `${selectedBenutzer.vorname} ${selectedBenutzer.nachname}`;
        }
      }
      
      const selectedProjekt = projekte.find(p => p.id === form.projekt_id);
      if (selectedProjekt) {
        data.projekt_nummer = selectedProjekt.projekt_nummer;
      }

      if (editingAufgabe) {
        await base44.entities.Aufgabe.update(editingAufgabe.id, data);
        toast.success("Aufgabe aktualisiert");
      } else {
        await base44.entities.Aufgabe.create(data);
        toast.success("Aufgabe erstellt");
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleStatusChange = async (aufgabe, newStatus) => {
    try {
      await base44.entities.Aufgabe.update(aufgabe.id, { status: newStatus });
      toast.success("Status aktualisiert");
      loadData();
    } catch (error) {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleEdit = (item) => {
    setEditingAufgabe(item);
    setForm({
      titel: item.titel || "",
      beschreibung: item.beschreibung || "",
      zugewiesen_an: item.zugewiesen_an || "",
      projekt_id: item.projekt_id || "",
      prioritaet: item.prioritaet || "Mittel",
      status: item.status || "Offen",
      faellig_am: item.faellig_am || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Möchten Sie diese Aufgabe wirklich löschen?")) {
      try {
        await base44.entities.Aufgabe.delete(id);
        toast.success("Aufgabe gelöscht");
        loadData();
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const resetForm = () => {
    setEditingAufgabe(null);
    setForm({
      titel: "",
      beschreibung: "",
      zugewiesen_an: "",
      projekt_id: "",
      prioritaet: "Mittel",
      status: "Offen",
      faellig_am: ""
    });
  };

  // Получить подчиненных пользователя
  const getSubordinates = (benutzerId) => {
    if (!benutzerId) return [];
    const user = benutzer.find(b => b.id === benutzerId);
    if (!user) return [];
    
    const position = user.position;
    let subordinates = [];
    
    if (position === "Admin" || position === "Büro") {
      // Видят всех
      return benutzer.map(b => b.id);
    } else if (position === "Projektleiter") {
      // Видят Gruppenleiter и Worker, которые под ними
      subordinates = benutzer
        .filter(b => (b.position === "Gruppenleiter" || b.position === "Worker") && b.vorgesetzter_id === benutzerId)
        .map(b => b.id);
    } else if (position === "Gruppenleiter") {
      // Видят Worker, которые под ними
      subordinates = benutzer
        .filter(b => b.position === "Worker" && b.vorgesetzter_id === benutzerId)
        .map(b => b.id);
    }
    
    // Добавляем себя
    subordinates.push(benutzerId);
    
    // Добавляем подчиненных подчиненных
    const allSubordinates = [...subordinates];
    subordinates.forEach(subId => {
      const sub = benutzer.find(b => b.id === subId);
      if (sub) {
        const subSubs = benutzer.filter(b => b.vorgesetzter_id === subId).map(b => b.id);
        allSubordinates.push(...subSubs);
      }
    });
    
    return [...new Set(allSubordinates)];
  };

  // Получить доступных для назначения подчиненных
  const getAssignableUsers = () => {
    if (!currentBenutzer) return benutzer;
    
    const position = currentBenutzer.position;
    
    if (position === "Admin" || position === "Büro") {
      return benutzer;
    } else if (position === "Projektleiter") {
      // Может назначать Gruppenleiter и Worker под собой
      return benutzer.filter(b => 
        (b.position === "Gruppenleiter" || b.position === "Worker") && 
        (b.vorgesetzter_id === currentBenutzer.id || b.id === currentBenutzer.id)
      );
    } else if (position === "Gruppenleiter") {
      // Может назначать Worker под собой
      return benutzer.filter(b => 
        b.position === "Worker" && 
        (b.vorgesetzter_id === currentBenutzer.id || b.id === currentBenutzer.id)
      );
    } else if (position === "Worker") {
      // Может создавать только себе
      return [currentBenutzer];
    }
    
    return [currentBenutzer];
  };

  const filteredAufgaben = aufgaben.filter(a => {
    const matchesSearch = a.titel?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    
    // Фильтр по иерархии
    let matchesHierarchy = true;
    if (currentBenutzer) {
      const visibleUsers = getSubordinates(currentBenutzer.id);
      // Задания "Для всех" (без назначения) видны всем
      matchesHierarchy = !a.zugewiesen_an || visibleUsers.includes(a.zugewiesen_an);
    }
    
    // Фильтр по выбранному пользователю
    const matchesBenutzerFilter = filterBenutzer === "all" || 
      (filterBenutzer === "__ALLGEMEIN__" && !a.zugewiesen_an) || 
      a.zugewiesen_an === filterBenutzer;
    
    return matchesSearch && matchesStatus && matchesHierarchy && matchesBenutzerFilter;
  });

  const statusColors = {
    "Offen": "bg-slate-100 text-slate-700",
    "In Bearbeitung": "bg-blue-100 text-blue-700",
    "Erledigt": "bg-emerald-100 text-emerald-700",
    "Storniert": "bg-red-100 text-red-700"
  };

  const prioritaetColors = {
    "Niedrig": "bg-slate-100 text-slate-600",
    "Mittel": "bg-blue-100 text-blue-600",
    "Hoch": "bg-amber-100 text-amber-600",
    "Kritisch": "bg-red-100 text-red-600"
  };

  const statusIcons = {
    "Offen": Clock,
    "In Bearbeitung": AlertCircle,
    "Erledigt": CheckCircle2,
    "Storniert": AlertCircle
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Aufgaben</h1>
          <p className="text-slate-500 mt-1">To-Do-Liste für alle Mitarbeiter</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Neue Aufgabe
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Aufgabe suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterBenutzer} onValueChange={setFilterBenutzer}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Benutzer filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Benutzer</SelectItem>
                <SelectItem value="__ALLGEMEIN__">Allgemein (Für alle)</SelectItem>
                {currentBenutzer && getSubordinates(currentBenutzer.id).map(userId => {
                  const user = benutzer.find(b => b.id === userId);
                  return user ? (
                    <SelectItem key={user.id} value={user.id}>
                      {user.vorname} {user.nachname} {user.id === currentBenutzer.id ? "(Ich)" : ""}
                    </SelectItem>
                  ) : null;
                })}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="Offen">Offen</SelectItem>
                <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                <SelectItem value="Erledigt">Erledigt</SelectItem>
                <SelectItem value="Storniert">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAufgaben.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center text-slate-400">
            Keine Aufgaben gefunden
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAufgaben.map((aufgabe) => {
            const StatusIcon = statusIcons[aufgabe.status] || Clock;
            return (
              <Card key={aufgabe.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {!aufgabe.zugewiesen_an ? (
                      <div className="mt-1 p-1 rounded-full bg-blue-100 text-blue-600">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(
                          aufgabe, 
                          aufgabe.status === "Erledigt" ? "Offen" : "Erledigt"
                        )}
                        className={`mt-1 p-1 rounded-full transition-colors ${
                          aufgabe.status === "Erledigt" 
                            ? "bg-emerald-100 text-emerald-600" 
                            : "bg-slate-100 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-medium ${aufgabe.status === "Erledigt" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                            {aufgabe.titel}
                          </h3>
                          {aufgabe.beschreibung && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{aufgabe.beschreibung}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className={statusColors[aufgabe.status]}>{aufgabe.status}</Badge>
                            <Badge className={prioritaetColors[aufgabe.prioritaet]}>{aufgabe.prioritaet}</Badge>
                            {aufgabe.zugewiesen_name ? (
                              <span className="text-xs text-slate-500">→ {aufgabe.zugewiesen_name}</span>
                            ) : (
                              <Badge className="bg-blue-50 text-blue-700">Allgemein</Badge>
                            )}
                            {aufgabe.projekt_nummer && (
                              <span className="text-xs text-slate-400">{aufgabe.projekt_nummer}</span>
                            )}
                            {aufgabe.faellig_am && (
                              <span className="text-xs text-slate-500">
                                Fällig: {format(new Date(aufgabe.faellig_am), "dd.MM.yyyy", { locale: de })}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {(!aufgabe.zugewiesen_an && currentBenutzer && !["Admin", "Büro"].includes(currentBenutzer.position)) ? null : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(aufgabe)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(aufgabe.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAufgabe ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input
                value={form.titel}
                onChange={(e) => setForm({ ...form, titel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={form.beschreibung}
                onChange={(e) => setForm({ ...form, beschreibung: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-4">
              {currentBenutzer && currentBenutzer.position !== "Worker" && (
                <div className="space-y-2">
                  <Label>Zugewiesen an</Label>
                  <Select value={form.zugewiesen_an} onValueChange={(v) => setForm({ ...form, zugewiesen_an: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Benutzer wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Admin", "Büro"].includes(currentBenutzer.position) ? (
                        <SelectItem value="__ALL__">Für alle (Allgemein)</SelectItem>
                      ) : (
                        <SelectItem value={currentBenutzer.id}>Notiz für mich</SelectItem>
                      )}
                      {getAssignableUsers().map(b => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.vorname} {b.nachname} {b.id === currentBenutzer?.id ? "(Ich)" : ""} - {b.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Projekt</Label>
                <Select value={form.projekt_id} onValueChange={(v) => setForm({ ...form, projekt_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Kein Projekt</SelectItem>
                    {projekte.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.projekt_nummer} - {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Priorität</Label>
                <Select value={form.prioritaet} onValueChange={(v) => setForm({ ...form, prioritaet: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Niedrig">Niedrig</SelectItem>
                    <SelectItem value="Mittel">Mittel</SelectItem>
                    <SelectItem value="Hoch">Hoch</SelectItem>
                    <SelectItem value="Kritisch">Kritisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Offen">Offen</SelectItem>
                    <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                    <SelectItem value="Erledigt">Erledigt</SelectItem>
                    <SelectItem value="Storniert">Storniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fällig am</Label>
                <Input
                  type="date"
                  value={form.faellig_am}
                  onChange={(e) => setForm({ ...form, faellig_am: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
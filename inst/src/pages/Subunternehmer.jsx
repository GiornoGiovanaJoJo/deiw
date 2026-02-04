import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function Subunternehmer() {
  const [subunternehmer, setSubunternehmer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentBenutzer, setCurrentBenutzer] = useState(null);
  const [form, setForm] = useState({
    firma: "",
    ansprechpartner: "",
    email: "",
    telefon: "",
    adresse: "",
    plz: "",
    stadt: "",
    spezialisierung: "",
    status: "Aktiv",
    notizen: "",
    stundensatz: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessionData = localStorage.getItem("benutzer_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          const benutzerList = await base44.entities.Benutzer.filter({ id: session.id });
          if (benutzerList.length > 0) {
            setCurrentBenutzer(benutzerList[0]);
          }
        }
      }

      const data = await base44.entities.Subunternehmer.list("-created_date");
      setSubunternehmer(data);
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      firma: "",
      ansprechpartner: "",
      email: "",
      telefon: "",
      adresse: "",
      plz: "",
      stadt: "",
      spezialisierung: "",
      status: "Aktiv",
      notizen: "",
      stundensatz: ""
    });
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setForm({
      firma: item.firma || "",
      ansprechpartner: item.ansprechpartner || "",
      email: item.email || "",
      telefon: item.telefon || "",
      adresse: item.adresse || "",
      plz: item.plz || "",
      stadt: item.stadt || "",
      spezialisierung: item.spezialisierung || "",
      status: item.status || "Aktiv",
      notizen: item.notizen || "",
      stundensatz: item.stundensatz?.toString() || ""
    });
    setEditingId(item.id);
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Subunternehmer wirklich löschen?")) return;

    try {
      await base44.entities.Subunternehmer.delete(id);
      toast.success("Subunternehmer gelöscht");
      loadData();
    } catch (error) {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleSave = async () => {
    if (!form.firma) {
      toast.error("Bitte Firma eingeben");
      return;
    }

    try {
      const data = { ...form };
      if (data.stundensatz) data.stundensatz = parseFloat(data.stundensatz);
      else delete data.stundensatz;

      if (editingId) {
        await base44.entities.Subunternehmer.update(editingId, data);
        toast.success("Subunternehmer aktualisiert");
      } else {
        await base44.entities.Subunternehmer.create(data);
        toast.success("Subunternehmer erstellt");
      }
      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const filteredSubunternehmer = subunternehmer.filter(s => {
    const matchesSearch = searchQuery === "" || 
      s.firma?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ansprechpartner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.spezialisierung?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const canEdit = ["Admin", "Büro", "Projektleiter"].includes(currentBenutzer?.position);

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
          <h1 className="text-2xl font-bold text-slate-800">Subunternehmer</h1>
          <p className="text-slate-500">Verwaltung von Subunternehmern</p>
        </div>
        {canEdit && (
          <Button onClick={() => { resetForm(); setShowDialog(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Subunternehmer hinzufügen
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Suche nach Firma, Ansprechpartner, Spezialisierung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="Aktiv">Aktiv</SelectItem>
            <SelectItem value="Inaktiv">Inaktiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firma</TableHead>
              <TableHead>Ansprechpartner</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Spezialisierung</TableHead>
              <TableHead>Stundensatz</TableHead>
              <TableHead>Status</TableHead>
              {canEdit && <TableHead className="text-right">Aktionen</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubunternehmer.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-8 text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>Keine Subunternehmer gefunden</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredSubunternehmer.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.firma}</TableCell>
                  <TableCell>{item.ansprechpartner || "-"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {item.email && <div>{item.email}</div>}
                      {item.telefon && <div className="text-slate-500">{item.telefon}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{item.spezialisierung || "-"}</TableCell>
                  <TableCell>
                    {item.stundensatz ? `${item.stundensatz.toFixed(2)} €` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Aktiv" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Subunternehmer bearbeiten" : "Subunternehmer hinzufügen"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Firma *</Label>
                <Input
                  value={form.firma}
                  onChange={(e) => setForm({ ...form, firma: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ansprechpartner</Label>
                <Input
                  value={form.ansprechpartner}
                  onChange={(e) => setForm({ ...form, ansprechpartner: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Spezialisierung</Label>
                <Input
                  value={form.spezialisierung}
                  onChange={(e) => setForm({ ...form, spezialisierung: e.target.value })}
                  placeholder="z.B. Elektriker, Schlosser"
                />
              </div>
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={form.telefon}
                  onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Adresse</Label>
                <Input
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>PLZ</Label>
                <Input
                  value={form.plz}
                  onChange={(e) => setForm({ ...form, plz: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Stadt</Label>
                <Input
                  value={form.stadt}
                  onChange={(e) => setForm({ ...form, stadt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Stundensatz (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.stundensatz}
                  onChange={(e) => setForm({ ...form, stundensatz: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktiv">Aktiv</SelectItem>
                    <SelectItem value="Inaktiv">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Notizen</Label>
                <Textarea
                  value={form.notizen}
                  onChange={(e) => setForm({ ...form, notizen: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                Abbrechen
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
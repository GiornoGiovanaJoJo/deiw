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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Building2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export default function Kunden() {
  const [kunden, setKunden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKunde, setEditingKunde] = useState(null);
  const [form, setForm] = useState({
    typ: "Firma",
    firma: "",
    ansprechpartner: "",
    email: "",
    telefon: "",
    adresse: "",
    plz: "",
    stadt: "",
    notizen: "",
    status: "Aktiv"
  });

  useEffect(() => {
    loadKunden();
  }, []);

  const loadKunden = async () => {
    try {
      const data = await base44.entities.Kunde.list();
      setKunden(data);
    } catch (error) {
      toast.error("Fehler beim Laden der Kunden");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingKunde) {
        await base44.entities.Kunde.update(editingKunde.id, form);
        toast.success("Kunde aktualisiert");
      } else {
        await base44.entities.Kunde.create(form);
        toast.success("Kunde erstellt");
      }
      setDialogOpen(false);
      resetForm();
      loadKunden();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleEdit = (item) => {
    setEditingKunde(item);
    setForm({
      typ: item.typ || "Firma",
      firma: item.firma || "",
      ansprechpartner: item.ansprechpartner || "",
      email: item.email || "",
      telefon: item.telefon || "",
      adresse: item.adresse || "",
      plz: item.plz || "",
      stadt: item.stadt || "",
      notizen: item.notizen || "",
      status: item.status || "Aktiv"
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Möchten Sie diesen Kunden wirklich löschen?")) {
      try {
        await base44.entities.Kunde.delete(id);
        toast.success("Kunde gelöscht");
        loadKunden();
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const resetForm = () => {
    setEditingKunde(null);
    setForm({
      typ: "Firma",
      firma: "",
      ansprechpartner: "",
      email: "",
      telefon: "",
      adresse: "",
      plz: "",
      stadt: "",
      notizen: "",
      status: "Aktiv"
    });
  };

  const filteredKunden = kunden.filter(k =>
    k.firma?.toLowerCase().includes(search.toLowerCase()) ||
    k.ansprechpartner?.toLowerCase().includes(search.toLowerCase()) ||
    k.stadt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kunden</h1>
          <p className="text-slate-500 mt-1">Kundenstamm verwalten</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Neuer Kunde
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Firma, Ansprechpartner oder Stadt suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firma</TableHead>
                <TableHead className="hidden md:table-cell">Ansprechpartner</TableHead>
                <TableHead className="hidden md:table-cell">Kontakt</TableHead>
                <TableHead className="hidden lg:table-cell">Ort</TableHead>
                <TableHead>Status</TableHead>
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
              ) : filteredKunden.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Keine Kunden gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredKunden.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{item.firma}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.typ || "Firma"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">
                      {item.ansprechpartner || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        {item.email && (
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Mail className="w-3 h-3" />
                            {item.email}
                          </div>
                        )}
                        {item.telefon && (
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Phone className="w-3 h-3" />
                            {item.telefon}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-slate-600">
                      {item.plz && item.stadt ? `${item.plz} ${item.stadt}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "Aktiv" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingKunde ? "Kunde bearbeiten" : "Neuer Kunde"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Typ *</Label>
              <Select value={form.typ} onValueChange={(v) => setForm({ ...form, typ: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Firma">Firma</SelectItem>
                  <SelectItem value="Privat">Privat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{form.typ === "Firma" ? "Firma" : "Name"} *</Label>
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
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="space-y-2">
              <Label>Notizen</Label>
              <Textarea
                value={form.notizen}
                onChange={(e) => setForm({ ...form, notizen: e.target.value })}
                rows={3}
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
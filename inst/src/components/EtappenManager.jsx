import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function EtappenManager({ projektId }) {
  const [etappen, setEtappen] = useState([]);
  const [benutzerMap, setBenutzerMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEtappe, setEditingEtappe] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    beschreibung: "",
    status: "Geplant",
    bilder: []
  });

  useEffect(() => {
    loadEtappen();
  }, [projektId]);

  const loadEtappen = async () => {
    try {
      const data = await base44.entities.Etappe.filter({ projekt_id: projektId });
      setEtappen(data.sort((a, b) => (a.reihenfolge || 0) - (b.reihenfolge || 0)));

      // Load user data for created_by
      const allBenutzer = await base44.entities.Benutzer.list();
      const map = {};
      allBenutzer.forEach(b => {
        map[b.created_by] = `${b.vorname} ${b.nachname}`;
      });
      setBenutzerMap(map);
    } catch (error) {
      toast.error("Fehler beim Laden der Etappen");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name ist erforderlich");
      return;
    }

    try {
      const data = {
        ...form,
        projekt_id: projektId,
        reihenfolge: editingEtappe?.reihenfolge || etappen.length
      };

      if (editingEtappe) {
        await base44.entities.Etappe.update(editingEtappe.id, data);
        toast.success("Etappe aktualisiert");
      } else {
        await base44.entities.Etappe.create(data);
        toast.success("Etappe erstellt");
      }

      setDialogOpen(false);
      resetForm();
      loadEtappen();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleEdit = (etappe) => {
    setEditingEtappe(etappe);
    setForm({
      name: etappe.name || "",
      beschreibung: etappe.beschreibung || "",
      status: etappe.status || "Geplant",
      bilder: etappe.bilder || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Möchten Sie diese Etappe wirklich löschen?")) {
      try {
        await base44.entities.Etappe.delete(id);
        toast.success("Etappe gelöscht");
        loadEtappen();
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setForm(prev => ({
        ...prev,
        bilder: [...(prev.bilder || []), ...urls]
      }));
      toast.success("Bilder hochgeladen");
    } catch (error) {
      toast.error("Fehler beim Hochladen");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      bilder: prev.bilder.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setEditingEtappe(null);
    setForm({
      name: "",
      beschreibung: "",
      status: "Geplant",
      bilder: []
    });
  };

  const statusColors = {
    "Geplant": "bg-slate-100 text-slate-700",
    "In Bearbeitung": "bg-blue-100 text-blue-700",
    "Abgeschlossen": "bg-emerald-100 text-emerald-700"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Arbeitsetappen</h3>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Etappe hinzufügen
        </Button>
      </div>

      {etappen.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Noch keine Etappen definiert</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {etappen.map((etappe, index) => (
            <Card key={etappe.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{etappe.name}</h4>
                        <Badge className={statusColors[etappe.status]}>{etappe.status}</Badge>
                      </div>
                      {etappe.beschreibung && (
                        <p className="text-sm text-slate-600 mb-2">{etappe.beschreibung}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                        <span>Erstellt von: {benutzerMap[etappe.created_by] || etappe.created_by || "Unbekannt"}</span>
                        <span>•</span>
                        <span>{new Date(etappe.created_date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {etappe.bilder && etappe.bilder.length > 0 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                          {etappe.bilder.map((bild, idx) => (
                            <img
                              key={idx}
                              src={bild}
                              alt={`Bild ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(bild, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(etappe)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(etappe.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEtappe ? "Etappe bearbeiten" : "Neue Etappe"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="z.B. Fundament legen"
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={form.beschreibung}
                onChange={(e) => setForm({ ...form, beschreibung: e.target.value })}
                placeholder="Details zur Etappe..."
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
                  <SelectItem value="Geplant">Geplant</SelectItem>
                  <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                  <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bilder</Label>
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {form.bilder && form.bilder.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {form.bilder.map((bild, idx) => (
                      <div key={idx} className="relative group">
                        <img src={bild} alt={`Bild ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
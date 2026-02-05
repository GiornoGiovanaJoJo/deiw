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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Trash2,
  Search,
  Download,
  Archive,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function DokumentManager({ projektId }) {
  const [dokumente, setDokumente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTyp, setFilterTyp] = useState("all");
  const [filterStatus, setFilterStatus] = useState("Aktiv");

  const [formData, setFormData] = useState({
    titel: "",
    beschreibung: "",
    typ: "Sonstiges",
    tags: [],
    datei_url: "",
    datei_name: "",
    datei_groesse: 0,
  });

  useEffect(() => {
    loadDokumente();
  }, [projektId]);

  const loadDokumente = async () => {
    try {
      setLoading(true);
      const docs = await base44.entities.Dokument.filter({
        projekt_id: projektId,
      });
      setDokumente(docs);
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Laden der Dokumente");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({
        ...formData,
        datei_url: result.file_url,
        datei_name: file.name,
        datei_groesse: file.size,
      });
      toast.success("Datei hochgeladen");
    } catch (error) {
      toast.error("Fehler beim Hochladen");
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSave = async () => {
    if (!formData.titel || !formData.datei_url) {
      toast.error("Bitte Titel und Datei eingeben");
      return;
    }

    try {
      await base44.entities.Dokument.create({
        projekt_id: projektId,
        titel: formData.titel,
        beschreibung: formData.beschreibung,
        typ: formData.typ,
        tags: formData.tags,
        datei_url: formData.datei_url,
        datei_name: formData.datei_name,
        datei_groesse: formData.datei_groesse,
        status: "Aktiv",
      });
      toast.success("Dokument hinzugefügt");
      setFormData({
        titel: "",
        beschreibung: "",
        typ: "Sonstiges",
        tags: [],
        datei_url: "",
        datei_name: "",
        datei_groesse: 0,
      });
      setShowDialog(false);
      loadDokumente();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Dokument löschen?")) return;
    try {
      await base44.entities.Dokument.delete(id);
      toast.success("Dokument gelöscht");
      loadDokumente();
    } catch (error) {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleArchive = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Aktiv" ? "Archiviert" : "Aktiv";
      await base44.entities.Dokument.update(id, { status: newStatus });
      toast.success(
        `Dokument ${newStatus === "Aktiv" ? "wiederhergestellt" : "archiviert"}`
      );
      loadDokumente();
    } catch (error) {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const filteredDokumente = dokumente.filter((doc) => {
    const matchSearch =
      doc.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchTyp = filterTyp === "all" || doc.typ === filterTyp;
    const matchStatus = doc.status === filterStatus;
    return matchSearch && matchTyp && matchStatus;
  });

  const typColors = {
    Plan: "bg-blue-100 text-blue-800",
    Vertrag: "bg-purple-100 text-purple-800",
    Bericht: "bg-green-100 text-green-800",
    Rechnung: "bg-orange-100 text-orange-800",
    Sonstiges: "bg-slate-100 text-slate-800",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header mit Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Dokumente</h3>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Dokument hinzufügen
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Dokumente durchsuchen..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterTyp} onValueChange={setFilterTyp}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              <SelectItem value="Plan">Plan</SelectItem>
              <SelectItem value="Vertrag">Vertrag</SelectItem>
              <SelectItem value="Bericht">Bericht</SelectItem>
              <SelectItem value="Rechnung">Rechnung</SelectItem>
              <SelectItem value="Sonstiges">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aktiv">Aktive Dokumente</SelectItem>
              <SelectItem value="Archiviert">Archivierte</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dokumente Liste */}
      <div className="space-y-2">
        {filteredDokumente.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>Keine Dokumente gefunden</p>
          </div>
        ) : (
          filteredDokumente.map((doc) => (
            <div
              key={doc.id}
              className="flex items-start gap-3 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-800 truncate">
                    {doc.titel}
                  </h4>
                  <Badge className={typColors[doc.typ]}>{doc.typ}</Badge>
                  {doc.status === "Archiviert" && (
                    <Badge variant="outline">Archiviert</Badge>
                  )}
                </div>

                {doc.beschreibung && (
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                    {doc.beschreibung}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  {doc.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{doc.datei_name}</span>
                  {doc.datei_groesse && (
                    <span>
                      {(doc.datei_groesse / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                  <span>
                    {format(new Date(doc.created_date), "dd.MM.yyyy", {
                      locale: de,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => window.open(doc.datei_url, "_blank")}
                  className="text-slate-400 hover:text-blue-600"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleArchive(doc.id, doc.status)}
                  className="text-slate-400 hover:text-amber-600"
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(doc.id)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog zum Hinzufügen */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dokument hinzufügen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input
                value={formData.titel}
                onChange={(e) =>
                  setFormData({ ...formData, titel: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={formData.beschreibung}
                onChange={(e) =>
                  setFormData({ ...formData, beschreibung: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select
                  value={formData.typ}
                  onValueChange={(v) => setFormData({ ...formData, typ: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plan">Plan</SelectItem>
                    <SelectItem value="Vertrag">Vertrag</SelectItem>
                    <SelectItem value="Bericht">Bericht</SelectItem>
                    <SelectItem value="Rechnung">Rechnung</SelectItem>
                    <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (Kategorisierung)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Tag eingeben und Enter drücken"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Datei hochladen *</Label>
              {formData.datei_url ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {formData.datei_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(formData.datei_groesse / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        datei_url: "",
                        datei_name: "",
                        datei_groesse: 0,
                      })
                    }
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-sm text-slate-500">
                    Datei hochladen
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
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
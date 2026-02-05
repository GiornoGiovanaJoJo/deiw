import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MoreHorizontal, Pencil, Trash2, Tags, FolderKanban, Package, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function Kategorien() {
  const [kategorien, setKategorien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKategorie, setEditingKategorie] = useState(null);
  const [activeTab, setActiveTab] = useState("Projekt");
  const [form, setForm] = useState({
    name: "",
    beschreibung: "",
    parent_id: "",
    typ: "Projekt",
    farbe: "#3b82f6",
    icon_name: "",
    bild: "",
    zusatzfelder: []
  });

  useEffect(() => {
    loadKategorien();
  }, []);

  const loadKategorien = async () => {
    try {
      const data = await base44.entities.Kategorie.list();
      setKategorien(data);
    } catch (error) {
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Bitte Namen eingeben");
      return;
    }
    try {
      if (editingKategorie) {
        await base44.entities.Kategorie.update(editingKategorie.id, form);
        toast.success("Kategorie aktualisiert");
      } else {
        await base44.entities.Kategorie.create(form);
        toast.success("Kategorie erstellt");
      }
      setDialogOpen(false);
      resetForm();
      loadKategorien();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleEdit = (item) => {
    setEditingKategorie(item);
    setForm({
      name: item.name || "",
      beschreibung: item.beschreibung || "",
      parent_id: item.parent_id || "",
      typ: item.typ || "Projekt",
      farbe: item.farbe || "#3b82f6",
      icon_name: item.icon_name || "",
      bild: item.bild || "",
      zusatzfelder: item.zusatzfelder || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Möchten Sie diese Kategorie wirklich löschen?")) {
      try {
        await base44.entities.Kategorie.delete(id);
        toast.success("Kategorie gelöscht");
        loadKategorien();
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const resetForm = () => {
    setEditingKategorie(null);
    setForm({
      name: "",
      beschreibung: "",
      parent_id: "",
      typ: activeTab,
      farbe: "#3b82f6",
      icon_name: "",
      bild: "",
      zusatzfelder: []
    });
  };

  const openNewDialog = () => {
    resetForm();
    setForm(prev => ({ ...prev, typ: activeTab }));
    setDialogOpen(true);
  };

  const addZusatzfeld = () => {
    setForm({
      ...form,
      zusatzfelder: [...form.zusatzfelder, { name: "", label: "", type: "text", options: [] }]
    });
  };

  const removeZusatzfeld = (index) => {
    const newFelder = [...form.zusatzfelder];
    newFelder.splice(index, 1);
    setForm({ ...form, zusatzfelder: newFelder });
  };

  const updateZusatzfeld = (index, field, value) => {
    const newFelder = [...form.zusatzfelder];
    newFelder[index] = { ...newFelder[index], [field]: value };
    setForm({ ...form, zusatzfelder: newFelder });
  };

  const addOption = (feldIndex) => {
    const newFelder = [...form.zusatzfelder];
    if (!newFelder[feldIndex].options) {
      newFelder[feldIndex].options = [];
    }
    newFelder[feldIndex].options.push("");
    setForm({ ...form, zusatzfelder: newFelder });
  };

  const updateOption = (feldIndex, optionIndex, value) => {
    const newFelder = [...form.zusatzfelder];
    newFelder[feldIndex].options[optionIndex] = value;
    setForm({ ...form, zusatzfelder: newFelder });
  };

  const removeOption = (feldIndex, optionIndex) => {
    const newFelder = [...form.zusatzfelder];
    newFelder[feldIndex].options.splice(optionIndex, 1);
    setForm({ ...form, zusatzfelder: newFelder });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setForm({ ...form, bild: file_url });
        toast.success("Bild hochgeladen");
      } catch (error) {
        toast.error("Fehler beim Hochladen des Bildes");
      }
    }
  };

  const projektKategorien = kategorien.filter(k => k.typ === "Projekt");
  const warenKategorien = kategorien.filter(k => k.typ === "Ware");
  
  const getChildrenIds = (katId) => {
    const children = kategorien.filter(k => k.parent_id === katId).map(k => k.id);
    return [katId, ...children.flatMap(id => getChildrenIds(id))];
  };
  
  const parentKategorien = kategorien.filter(k => 
    k.typ === form.typ && 
    k.id !== editingKategorie?.id &&
    !getChildrenIds(editingKategorie?.id).includes(k.id)
  );

  const renderKategorieItem = (kategorie) => {
    const children = kategorien.filter(k => k.parent_id === kategorie.id);
    
    return (
      <div key={kategorie.id} className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: kategorie.farbe || "#3b82f6" }}
            />
            <div>
              <p className="font-medium text-slate-800">{kategorie.name}</p>
              {kategorie.beschreibung && (
                <p className="text-sm text-slate-500">{kategorie.beschreibung}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(kategorie)}>
                <Pencil className="w-4 h-4 mr-2" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(kategorie.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {children.length > 0 && (
          <div className="ml-6 space-y-2">
            {children.map(child => renderKategorieItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kategorien</h1>
          <p className="text-slate-500 mt-1">Kategorien für Projekte und Waren verwalten</p>
        </div>
        <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Neue Kategorie
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="Projekt" className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            Projektkategorien
          </TabsTrigger>
          <TabsTrigger value="Ware" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Warenkategorien
          </TabsTrigger>
        </TabsList>

        <TabsContent value="Projekt" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : projektKategorien.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Tags className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Keine Projektkategorien vorhanden</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projektKategorien.filter(k => !k.parent_id).map(renderKategorieItem)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Ware" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : warenKategorien.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Tags className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Keine Warenkategorien vorhanden</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {warenKategorien.filter(k => !k.parent_id).map(renderKategorieItem)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingKategorie ? "Kategorie bearbeiten" : "Neue Kategorie"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Input
                value={form.beschreibung}
                onChange={(e) => setForm({ ...form, beschreibung: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select value={form.typ} onValueChange={(v) => setForm({ ...form, typ: v, parent_id: "" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Projekt">Projekt</SelectItem>
                    <SelectItem value="Ware">Ware</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Farbe</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.farbe}
                    onChange={(e) => setForm({ ...form, farbe: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={form.farbe}
                    onChange={(e) => setForm({ ...form, farbe: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bild</Label>
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-sm"
                  />
                </div>
                {form.bild && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={form.bild} alt="Kategorie" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {!form.parent_id && (
              <div className="space-y-2">
                <Label>Icon für Hauptkategorie</Label>
                <div className="text-sm text-slate-500 mb-2">
                  Verfügbare Icons: Zap, Droplet, Hammer, Wrench, Paintbrush, Lightbulb, Home, Layers, Settings, Cpu, Box, Key, Gauge, Building2
                </div>
                <Input
                  placeholder="z.B. Zap, Droplet, Hammer..."
                  value={form.icon_name}
                  onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Übergeordnete Kategorie</Label>
              <Select value={form.parent_id} onValueChange={(v) => setForm({ ...form, parent_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Keine (Hauptkategorie)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Keine (Hauptkategorie)</SelectItem>
                  {parentKategorien.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.parent_id && (
              <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Дополнительные вопросы</Label>
                  <Button type="button" size="sm" onClick={addZusatzfeld} variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить вопрос
                  </Button>
                </div>

                {form.zusatzfelder.map((feld, idx) => (
                  <div key={idx} className="space-y-3 p-3 border rounded-lg bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Вопрос {idx + 1}</span>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={() => removeZusatzfeld(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Название поля</Label>
                        <Input
                          placeholder="napр. grundstuecksgroesse"
                          value={feld.name}
                          onChange={(e) => updateZusatzfeld(idx, "name", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Текст вопроса</Label>
                        <Input
                          placeholder="напр. Grundstücksgröße"
                          value={feld.label}
                          onChange={(e) => updateZusatzfeld(idx, "label", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Тип поля</Label>
                      <Select 
                        value={feld.type} 
                        onValueChange={(v) => updateZusatzfeld(idx, "type", v)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Текст</SelectItem>
                          <SelectItem value="number">Число</SelectItem>
                          <SelectItem value="select">Выбор из списка</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {feld.type === "select" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Варианты ответов</Label>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => addOption(idx)}
                            className="h-6 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Вариант
                          </Button>
                        </div>
                        {feld.options?.map((option, optIdx) => (
                          <div key={optIdx} className="flex gap-2">
                            <Input
                              placeholder={`Вариант ${optIdx + 1}`}
                              value={option}
                              onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                              className="h-7 text-sm"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => removeOption(idx, optIdx)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {form.zusatzfelder.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-2">
                    Нажмите "Добавить вопрос" чтобы создать дополнительные поля
                  </p>
                )}
              </div>
            )}
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
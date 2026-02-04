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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Package, AlertTriangle, Barcode, Upload, X, TrendingUp, History, ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

const EINHEITEN = ["Stk", "kg", "m", "l", "m²", "m³", "Set"];

export default function Waren() {
  const [waren, setWaren] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategorie, setFilterKategorie] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWare, setEditingWare] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lieferungDialog, setLieferungDialog] = useState(false);
  const [lieferungMenge, setLieferungMenge] = useState("");
  const [inventurDialog, setInventurDialog] = useState(false);
  const [inventurMenge, setInventurMenge] = useState("");
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailWare, setDetailWare] = useState(null);
  const [warenLog, setWarenLog] = useState([]);
  const [benutzer, setBenutzer] = useState(null);
  const [form, setForm] = useState({
    name: "",
    beschreibung: "",
    barcode: "",
    kategorie_id: "",
    einheit: "Stk",
    einkaufspreis: "",
    verkaufspreis: "",
    bestand: "",
    mindestbestand: "",
    lagerort: "",
    notizen: "",
    bild: "",
    status: "Verfügbar"
  });

  useEffect(() => {
    loadData();
    loadBenutzer();
  }, []);

  const loadBenutzer = async () => {
    try {
      const sessionData = localStorage.getItem("benutzer_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const benutzerList = await base44.entities.Benutzer.filter({ id: session.id });
        if (benutzerList.length > 0) {
          setBenutzer(benutzerList[0]);
        }
      }
    } catch (error) {
      console.log("Error loading benutzer");
    }
  };

  const loadData = async () => {
    try {
      const [warenData, kategorienData] = await Promise.all([
        base44.entities.Ware.list(),
        base44.entities.Kategorie.filter({ typ: "Ware" })
      ]);
      setWaren(warenData);
      setKategorien(kategorienData);
    } catch (error) {
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const generateBarcode = () => {
    const prefix = "400";
    const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, "0");
    const checksum = calculateEANChecksum(prefix + random.slice(0, 9));
    return prefix + random.slice(0, 9) + checksum;
  };

  const calculateEANChecksum = (code) => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    return ((10 - (sum % 10)) % 10).toString();
  };

  const checkBarcodeUnique = (barcode) => {
    return !waren.some(w => w.barcode === barcode && w.id !== editingWare?.id);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, bild: result.file_url });
      toast.success("Foto hochgeladen");
    } catch (error) {
      toast.error("Fehler beim Hochladen");
    } finally {
      setUploading(false);
    }
  };

  const handleLieferung = (ware) => {
    setEditingWare(ware);
    setLieferungMenge("");
    setLieferungDialog(true);
  };

  const handleLieferungSave = async () => {
    const menge = parseFloat(lieferungMenge);
    if (!menge || menge <= 0) {
      toast.error("Bitte gültige Menge eingeben");
      return;
    }

    try {
      const user = await base44.auth.me();
      const newBestand = (editingWare.bestand || 0) + menge;
      
      let newStatus = "Verfügbar";
      if (newBestand <= 0) {
        newStatus = "Ausverkauft";
      } else if (editingWare.mindestbestand && newBestand <= editingWare.mindestbestand) {
        newStatus = "Niedrig";
      }

      await base44.entities.Ware.update(editingWare.id, {
        bestand: newBestand,
        status: newStatus
      });

      await base44.entities.WarenLog.create({
        ware_id: editingWare.id,
        ware_name: editingWare.name,
        benutzer_id: user.id,
        benutzer_name: user.full_name,
        aktion: "Eingang",
        menge: menge,
        datum: new Date().toISOString(),
        notiz: `Lieferung erhalten: ${menge} ${editingWare.einheit} von ${editingWare.name} auf Lager eingegangen. Bestand: ${editingWare.bestand || 0} → ${newBestand}`
      });

      toast.success(`${menge} ${editingWare.einheit} hinzugefügt`);
      setLieferungDialog(false);
      loadData();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleInventur = (ware) => {
    setEditingWare(ware);
    setInventurMenge(ware.bestand?.toString() || "");
    setInventurDialog(true);
  };

  const handleInventurSave = async () => {
    const menge = parseFloat(inventurMenge);
    if (menge === null || menge === undefined || isNaN(menge)) {
      toast.error("Bitte gültige Menge eingeben");
      return;
    }

    try {
      const user = await base44.auth.me();
      const altBestand = editingWare.bestand || 0;
      const differenz = menge - altBestand;

      let newStatus = "Verfügbar";
      if (menge <= 0) {
        newStatus = "Ausverkauft";
      } else if (editingWare.mindestbestand && menge <= editingWare.mindestbestand) {
        newStatus = "Niedrig";
      }

      await base44.entities.Ware.update(editingWare.id, {
        bestand: menge,
        status: newStatus
      });

      await base44.entities.WarenLog.create({
        ware_id: editingWare.id,
        ware_name: editingWare.name,
        benutzer_id: user.id,
        benutzer_name: user.full_name,
        aktion: "Inventur",
        menge: Math.abs(differenz),
        datum: new Date().toISOString(),
        notiz: `Inventur durchgeführt: Alt ${altBestand} → Neu ${menge}`
      });

      toast.success("Inventur abgeschlossen");
      setInventurDialog(false);
      loadData();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Bitte Artikelname eingeben");
      return;
    }

    if (form.barcode && !checkBarcodeUnique(form.barcode)) {
      toast.error("Barcode bereits vergeben");
      return;
    }

    try {
      const data = { ...form };
      if (data.einkaufspreis) data.einkaufspreis = parseFloat(data.einkaufspreis);
      if (data.verkaufspreis) data.verkaufspreis = parseFloat(data.verkaufspreis);
      if (data.bestand) data.bestand = parseFloat(data.bestand);
      if (data.mindestbestand) data.mindestbestand = parseFloat(data.mindestbestand);

      // Update status based on stock
      if (data.bestand !== undefined && data.mindestbestand !== undefined) {
        if (data.bestand <= 0) {
          data.status = "Ausverkauft";
        } else if (data.bestand <= data.mindestbestand) {
          data.status = "Niedrig";
        } else {
          data.status = "Verfügbar";
        }
      }

      if (editingWare) {
        await base44.entities.Ware.update(editingWare.id, data);
        toast.success("Artikel aktualisiert");
      } else {
        await base44.entities.Ware.create(data);
        toast.success("Artikel erstellt");
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleEdit = (item) => {
    setEditingWare(item);
    setForm({
      name: item.name || "",
      beschreibung: item.beschreibung || "",
      barcode: item.barcode || "",
      kategorie_id: item.kategorie_id || "",
      einheit: item.einheit || "Stk",
      einkaufspreis: item.einkaufspreis?.toString() || "",
      verkaufspreis: item.verkaufspreis?.toString() || "",
      bestand: item.bestand?.toString() || "",
      mindestbestand: item.mindestbestand?.toString() || "",
      lagerort: item.lagerort || "",
      notizen: item.notizen || "",
      bild: item.bild || "",
      status: item.status || "Verfügbar"
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Möchten Sie diesen Artikel wirklich löschen?")) {
      try {
        await base44.entities.Ware.delete(id);
        toast.success("Artikel gelöscht");
        loadData();
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const resetForm = () => {
    setEditingWare(null);
    setForm({
      name: "",
      beschreibung: "",
      barcode: "",
      kategorie_id: "",
      einheit: "Stk",
      einkaufspreis: "",
      verkaufspreis: "",
      bestand: "",
      mindestbestand: "",
      lagerort: "",
      notizen: "",
      bild: "",
      status: "Verfügbar"
    });
  };

  const openNewDialog = () => {
    resetForm();
    setForm(prev => ({ ...prev, barcode: generateBarcode() }));
    setDialogOpen(true);
  };

  const filteredWaren = waren.filter(w => {
    const matchesSearch = 
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.barcode?.includes(search);
    const matchesKategorie = filterKategorie === "all" || w.kategorie_id === filterKategorie;
    return matchesSearch && matchesKategorie;
  });

  const getKategorieName = (id) => {
    const kat = kategorien.find(k => k.id === id);
    return kat?.name || "-";
  };

  const statusColors = {
    "Verfügbar": "bg-emerald-100 text-emerald-700",
    "Niedrig": "bg-amber-100 text-amber-700",
    "Ausverkauft": "bg-red-100 text-red-700"
  };

  const lowStockCount = waren.filter(w => w.status === "Niedrig" || w.status === "Ausverkauft").length;

  // Права доступа
  const canEdit = !benutzer || ["Admin", "Warehouse", "Büro"].includes(benutzer.position);
  const canViewPrices = !benutzer || ["Admin", "Warehouse", "Büro", "Projektleiter"].includes(benutzer.position);
  const isReadOnly = ["Worker", "Gruppenleiter", "Projektleiter"].includes(benutzer?.position);

  const handleOpenDetail = async (ware) => {
    setDetailWare(ware);
    try {
      const logs = await base44.entities.WarenLog.filter({ ware_id: ware.id }, "-created_date", 100);
      setWarenLog(logs);
    } catch (error) {
      console.error("Error loading logs:", error);
      setWarenLog([]);
    }
    setDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Waren</h1>
          <p className="text-slate-500 mt-1">Artikelstamm und Lagerbestände verwalten</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} niedrig
            </Badge>
          )}
          {!isReadOnly && canEdit && (
            <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Neuer Artikel
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Name oder Barcode suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterKategorie} onValueChange={setFilterKategorie}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Kategorie filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {kategorien.map(k => (
                  <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                ))}
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
                <TableHead>Artikel</TableHead>
                <TableHead className="hidden md:table-cell">Barcode</TableHead>
                <TableHead className="hidden md:table-cell">Kategorie</TableHead>
                <TableHead>Bestand</TableHead>
                {canViewPrices && <TableHead className="hidden lg:table-cell">Preis (EK/VK)</TableHead>}
                <TableHead>Status</TableHead>
                {!isReadOnly && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredWaren.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Keine Artikel gefunden</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWaren.map((item) => (
                  <TableRow 
                    key={item.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => handleOpenDetail(item)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.bild ? (
                            <img src={item.bild} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{item.name}</p>
                          {item.lagerort && (
                            <p className="text-xs text-slate-400">Lagerort: {item.lagerort}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {item.barcode || "-"}
                      </code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">
                      {getKategorieName(item.kategorie_id)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {item.bestand || 0} {item.einheit}
                      </span>
                      {item.mindestbestand > 0 && (
                        <span className="text-xs text-slate-400 ml-1">
                          (Min: {item.mindestbestand})
                        </span>
                      )}
                    </TableCell>
                    {canViewPrices && (
                      <TableCell className="hidden lg:table-cell text-slate-600">
                        {item.einkaufspreis ? `${item.einkaufspreis.toFixed(2)}€` : "-"} / {item.verkaufspreis ? `${item.verkaufspreis.toFixed(2)}€` : "-"}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleLieferung(item)}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Lieferung buchen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleInventur(item)}>
                            <Package className="w-4 h-4 mr-2" />
                            Inventur
                          </DropdownMenuItem>
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
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingWare ? "Artikel bearbeiten" : "Neuer Artikel"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Artikelname *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={form.beschreibung}
                onChange={(e) => setForm({ ...form, beschreibung: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Barcode/EAN</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setForm({ ...form, barcode: generateBarcode() })}
                  >
                    <Barcode className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select value={form.kategorie_id} onValueChange={(v) => setForm({ ...form, kategorie_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Keine</SelectItem>
                    {kategorien.map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className={`grid gap-4 ${canViewPrices ? 'grid-cols-3' : 'grid-cols-1'}`}>
              <div className="space-y-2">
                <Label>Einheit</Label>
                <Select value={form.einheit} onValueChange={(v) => setForm({ ...form, einheit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EINHEITEN.map(e => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {canViewPrices && (
                <>
                  <div className="space-y-2">
                    <Label>Einkaufspreis (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.einkaufspreis}
                      onChange={(e) => setForm({ ...form, einkaufspreis: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Verkaufspreis (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.verkaufspreis}
                      onChange={(e) => setForm({ ...form, verkaufspreis: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Bestand</Label>
                <Input
                  type="number"
                  value={form.bestand}
                  onChange={(e) => setForm({ ...form, bestand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mindestbestand</Label>
                <Input
                  type="number"
                  value={form.mindestbestand}
                  onChange={(e) => setForm({ ...form, mindestbestand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Lagerort</Label>
                <Input
                  value={form.lagerort}
                  onChange={(e) => setForm({ ...form, lagerort: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notizen</Label>
              <Textarea
                value={form.notizen}
                onChange={(e) => setForm({ ...form, notizen: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Artikelfoto</Label>
              {form.bild ? (
                <div className="relative">
                  <img src={form.bild} alt="Artikel" className="w-full h-48 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setForm({ ...form, bild: "" })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">Foto hochladen</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              )}
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

      {/* Lieferung Dialog */}
      <Dialog open={lieferungDialog} onOpenChange={setLieferungDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lieferung buchen</DialogTitle>
          </DialogHeader>
          {editingWare && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    {editingWare.bild ? (
                      <img src={editingWare.bild} alt={editingWare.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{editingWare.name}</p>
                    <p className="text-sm text-slate-500">
                      Aktuell: {editingWare.bestand || 0} {editingWare.einheit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gelieferte Menge ({editingWare.einheit})</Label>
                <Input
                  type="number"
                  placeholder="Menge eingeben..."
                  value={lieferungMenge}
                  onChange={(e) => setLieferungMenge(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLieferungDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleLieferungSave} className="bg-emerald-600 hover:bg-emerald-700">
              Buchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {detailWare?.name}
            </DialogTitle>
          </DialogHeader>
          {detailWare && (
            <div className="space-y-6">
              {/* Artikel Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Barcode</p>
                  <p className="font-mono text-sm font-semibold">{detailWare.barcode || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Kategorie</p>
                  <p className="font-semibold">{getKategorieName(detailWare.kategorie_id)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Bestand</p>
                  <p className="font-semibold text-lg">{detailWare.bestand || 0} {detailWare.einheit}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Status</p>
                  <Badge className={statusColors[detailWare.status]}>
                    {detailWare.status}
                  </Badge>
                </div>
                {canViewPrices && (
                  <>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">EK Preis</p>
                      <p className="font-semibold">{detailWare.einkaufspreis?.toFixed(2) || "-"}€</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">VK Preis</p>
                      <p className="font-semibold">{detailWare.verkaufspreis?.toFixed(2) || "-"}€</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-xs text-slate-500 uppercase">Lagerort</p>
                  <p className="font-semibold">{detailWare.lagerort || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Mindestbestand</p>
                  <p className="font-semibold">{detailWare.mindestbestand || 0}</p>
                </div>
              </div>

              {detailWare.beschreibung && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Beschreibung</p>
                  <p className="text-slate-700">{detailWare.beschreibung}</p>
                </div>
              )}

              {detailWare.notizen && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Notizen</p>
                  <p className="text-slate-700">{detailWare.notizen}</p>
                </div>
              )}

              {/* History */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4" />
                  <p className="text-xs text-slate-500 uppercase font-semibold">Lagerbewegungen</p>
                </div>
                {warenLog.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    <p className="text-sm">Keine Lagerbewegungen vorhanden</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {warenLog.map((log) => {
                      const actionColors = {
                        "Entnahme": "bg-red-100 text-red-700",
                        "Rückgabe": "bg-emerald-100 text-emerald-700",
                        "Eingang": "bg-blue-100 text-blue-700",
                        "Korrektur": "bg-amber-100 text-amber-700",
                        "Inventur": "bg-purple-100 text-purple-700",
                        "Verkauf": "bg-green-100 text-green-700"
                      };

                      const actionIcons = {
                        "Entnahme": <ArrowUpCircle className="w-3 h-3" />,
                        "Rückgabe": <ArrowDownCircle className="w-3 h-3" />,
                        "Eingang": <ArrowDownCircle className="w-3 h-3" />,
                        "Korrektur": <Clock className="w-3 h-3" />,
                        "Inventur": <Clock className="w-3 h-3" />,
                        "Verkauf": <ArrowUpCircle className="w-3 h-3" />
                      };

                      return (
                        <div key={log.id} className="border border-slate-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={actionColors[log.aktion]}>
                                {actionIcons[log.aktion]}
                                <span className="ml-1">{log.aktion}</span>
                              </Badge>
                              <span className="text-sm font-semibold text-slate-800">{log.menge} {detailWare.einheit}</span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {format(new Date(log.created_date), "dd.MM.yyyy HH:mm", { locale: de })}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1">
                            <p><strong>Benutzer:</strong> {log.benutzer_name || "-"}</p>
                            {log.projekt_nummer && (
                              <p><strong>Projekt:</strong> {log.projekt_nummer}</p>
                            )}
                            {log.notiz && (
                              <p><strong>Notiz:</strong> {log.notiz}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(false)}>
              Schließen
            </Button>
            {!isReadOnly && canEdit && (
              <Button onClick={() => {
                handleEdit(detailWare);
                setDetailDialog(false);
              }} className="bg-blue-600 hover:bg-blue-700">
                <Pencil className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Inventur Dialog */}
       <Dialog open={inventurDialog} onOpenChange={setInventurDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inventur</DialogTitle>
          </DialogHeader>
          {editingWare && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    {editingWare.bild ? (
                      <img src={editingWare.bild} alt={editingWare.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{editingWare.name}</p>
                    <p className="text-sm text-slate-500">
                      Aktuell: {editingWare.bestand || 0} {editingWare.einheit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gezählte Menge ({editingWare.einheit})</Label>
                <Input
                  type="number"
                  placeholder="Menge eingeben..."
                  value={inventurMenge}
                  onChange={(e) => setInventurMenge(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInventurDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleInventurSave} className="bg-blue-600 hover:bg-blue-700">
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
      );
      }
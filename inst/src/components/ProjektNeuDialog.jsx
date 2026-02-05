import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ProjektNeuDialog({ open, onOpenChange, anfrageData }) {
  const [kategorien, setKategorien] = useState([]);
  const [unterkategorien, setUnterkategorien] = useState([]);
  const [unterUnterkategorien, setUnterUnterkategorien] = useState([]);
  const [allKategorien, setAllKategorien] = useState([]);
  const [benutzer, setBenutzer] = useState([]);
  const [gruppenleiter, setGruppenleiter] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [subunternehmer, setSubunternehmer] = useState([]);
  const [kunden, setKunden] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showNewKunde, setShowNewKunde] = useState(false);
  const [newKunde, setNewKunde] = useState({
    typ: "Firma",
    firma: "",
    ansprechpartner: "",
    email: "",
    telefon: "",
    adresse: "",
    plz: "",
    stadt: ""
  });
  const [form, setForm] = useState({
    projekt_nummer: "",
    name: "",
    beschreibung: "",
    kunde_id: "",
    projektleiter_id: "",
    gruppenleiter_ids: [],
    worker_ids: [],
    subunternehmer_ids: [],
    kategorie: "",
    unterkategorie: "",
    zusatzfelder: {},
    status: "Geplant",
    startdatum: "",
    enddatum: "",
    budget: "",
    adresse: "",
    prioritaet: "Mittel",
    foto: "",
    fotos: []
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [kundenData, kategorienData, benutzerData, gruppData, workerData, projekteData, subData] = await Promise.all([
        base44.entities.Kunde.list(),
        base44.entities.Kategorie.filter({ typ: "Projekt" }),
        base44.entities.Benutzer.filter({ position: "Projektleiter" }),
        base44.entities.Benutzer.filter({ position: "Gruppenleiter" }),
        base44.entities.Benutzer.filter({ position: "Worker" }),
        base44.entities.Projekt.list(),
        base44.entities.Subunternehmer.filter({ status: "Aktiv" })
      ]);
      
      setKunden(kundenData);
      const allCats = await base44.entities.Kategorie.list();
      setAllKategorien(allCats);
      setKategorien(allCats.filter(k => !k.parent_id && k.typ === "Projekt"));
      setBenutzer(benutzerData);
      setGruppenleiter(gruppData);
      setWorkers(workerData);
      setSubunternehmer(subData);

      // Generate next EP number
      const epNumbers = projekteData
        .map(p => parseInt(p.projekt_nummer?.replace("EP-", "") || "0"))
        .filter(n => !isNaN(n));
      const nextNumber = Math.max(1000, ...epNumbers) + 1;

      // Pre-fill form with anfrage data
      const newForm = {
        projekt_nummer: `EP-${nextNumber}`,
        name: anfrageData?.kunde_name || "",
        kunde_id: anfrageData?.kunde_id || "",
        adresse: anfrageData?.kunde_adresse || "",
        kategorie: anfrageData?.kategorie || "",
        unterkategorie: anfrageData?.unterkategorie || "",
        zusatzfelder: anfrageData?.antworten ? { ...anfrageData.antworten } : {},
        beschreibung: "",
        projektleiter_id: "",
        gruppenleiter_ids: [],
        worker_ids: [],
        subunternehmer_ids: [],
        status: "Geplant",
        startdatum: "",
        enddatum: "",
        budget: "",
        prioritaet: "Mittel",
        foto: "",
        fotos: []
      };

      setForm(newForm);

      // Load full category hierarchy if anfrage has kategorie
      if (anfrageData?.kategorie && allCats.length > 0) {
        const children = allCats.filter(k => k.parent_id === anfrageData.kategorie);
        setUnterkategorien(children);

        if (anfrageData?.unterkategorie) {
          const unterChildren = allCats.filter(k => k.parent_id === anfrageData.unterkategorie);
          setUnterUnterkategorien(unterChildren);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Laden");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleKategorieChange = (kategorieId) => {
    setForm({ ...form, kategorie: kategorieId, unterkategorie: "", zusatzfelder: {} });
    setUnterUnterkategorien([]);

    if (kategorieId) {
      const children = allKategorien.filter(k => k.parent_id === kategorieId);
      setUnterkategorien(children);
    } else {
      setUnterkategorien([]);
    }
  };

  const handleUnterkategorieChange = (unterkategorieId) => {
    setForm({ ...form, unterkategorie: unterkategorieId, zusatzfelder: {} });

    if (unterkategorieId) {
      const children = allKategorien.filter(k => k.parent_id === unterkategorieId);
      setUnterUnterkategorien(children);
    } else {
      setUnterUnterkategorien([]);
    }
  };

  const getZusatzfelder = () => {
    let fields = [];
    if (form.unterkategorie) {
      const unterkat = unterkategorien.find(k => k.id === form.unterkategorie);
      if (unterkat?.zusatzfelder) {
        fields = [...fields, ...unterkat.zusatzfelder];
      }
    }
    if (form.zusatzfelder?.unter_unterkategorie) {
      const unterUnterkat = unterUnterkategorien.find(k => k.id === form.zusatzfelder.unter_unterkategorie);
      if (unterUnterkat?.zusatzfelder) {
        fields = [...fields, ...unterUnterkat.zusatzfelder];
      }
    }
    return fields;
  };

  const removePhoto = (index) => {
    const newFotos = [...form.fotos];
    newFotos.splice(index, 1);
    setForm({ ...form, fotos: newFotos });
  };

  const handleFileUpload = async (e, isMain = true) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (isMain) {
        setForm({ ...form, foto: result.file_url });
      } else {
        setForm({ ...form, fotos: [...(form.fotos || []), result.file_url] });
      }
      toast.success("Foto hochgeladen");
    } catch (error) {
      toast.error("Fehler beim Hochladen");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveNewKunde = async () => {
    if (!newKunde.firma) {
      toast.error("Bitte Firmennamen eingeben");
      return;
    }
    setLoading(true);
    try {
      const createdKunde = await base44.entities.Kunde.create(newKunde);
      setKunden([...kunden, createdKunde]);
      setForm({ ...form, kunde_id: createdKunde.id });
      setShowNewKunde(false);
      setNewKunde({
        typ: "Firma",
        firma: "",
        ansprechpartner: "",
        email: "",
        telefon: "",
        adresse: "",
        plz: "",
        stadt: ""
      });
      toast.success("Kunde erstellt");
    } catch (error) {
      toast.error("Fehler beim Erstellen");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
     if (!form.name) {
       toast.error("Bitte Projektnamen eingeben");
       return;
     }
     setLoading(true);
     try {
       const data = { ...form };
       if (data.budget) data.budget = parseFloat(data.budget);

       // Only remove completely empty arrays and null values
       Object.keys(data).forEach(key => {
         if (Array.isArray(data[key]) && data[key].length === 0) {
           delete data[key];
         } else if (data[key] === null) {
           delete data[key];
         }
       });

       console.log("Saving project with data:", data);
       const result = await base44.entities.Projekt.create(data);
       console.log("Project created:", result);
       toast.success("Projekt erstellt");
       onOpenChange(false);
     } catch (error) {
       console.error("Error saving project:", error);
       toast.error("Fehler beim Erstellen: " + error.message);
     } finally {
       setLoading(false);
     }
   };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Projekt aus Anfrage</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Projektnummer</Label>
              <Input value={form.projekt_nummer} disabled className="bg-slate-50" />
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
                  <SelectItem value="Pausiert">Pausiert</SelectItem>
                  <SelectItem value="Storniert">Storniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Projektname *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Projektname"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Kunde</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewKunde(!showNewKunde)}
                className="text-xs text-blue-600"
              >
                {showNewKunde ? "Abbrechen" : "+ Neuer Kunde"}
              </Button>
            </div>
            {!showNewKunde ? (
              <Select value={form.kunde_id} onValueChange={(v) => setForm({ ...form, kunde_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Kunde auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Kein Kunde</SelectItem>
                  {kunden.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.firma}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Typ</Label>
                    <Select value={newKunde.typ} onValueChange={(v) => setNewKunde({ ...newKunde, typ: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Firma">Firma</SelectItem>
                        <SelectItem value="Privat">Privat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Firmenname *</Label>
                    <Input
                      value={newKunde.firma}
                      onChange={(e) => setNewKunde({ ...newKunde, firma: e.target.value })}
                      className="h-8 text-xs"
                      placeholder="Firmenname"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ansprechpartner</Label>
                  <Input
                    value={newKunde.ansprechpartner}
                    onChange={(e) => setNewKunde({ ...newKunde, ansprechpartner: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Email</Label>
                    <Input
                      value={newKunde.email}
                      onChange={(e) => setNewKunde({ ...newKunde, email: e.target.value })}
                      className="h-8 text-xs"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefon</Label>
                    <Input
                      value={newKunde.telefon}
                      onChange={(e) => setNewKunde({ ...newKunde, telefon: e.target.value })}
                      className="h-8 text-xs"
                      placeholder="Telefon"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Adresse</Label>
                  <Input
                    value={newKunde.adresse}
                    onChange={(e) => setNewKunde({ ...newKunde, adresse: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="Straße 123"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">PLZ</Label>
                    <Input
                      value={newKunde.plz}
                      onChange={(e) => setNewKunde({ ...newKunde, plz: e.target.value })}
                      className="h-8 text-xs"
                      placeholder="12345"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Stadt</Label>
                    <Input
                      value={newKunde.stadt}
                      onChange={(e) => setNewKunde({ ...newKunde, stadt: e.target.value })}
                      className="h-8 text-xs"
                      placeholder="Stadt"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveNewKunde}
                  disabled={loading}
                  className="w-full h-8 text-xs bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Speichern..." : "Kunde erstellen"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              placeholder="Projektadresse"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select value={form.kategorie} onValueChange={handleKategorieChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Keine Kategorie</SelectItem>
                  {kategorien.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>

          {unterkategorien.length > 0 && (
            <div className="space-y-2">
              <Label>Unterkategorie</Label>
              <Select value={form.unterkategorie} onValueChange={handleUnterkategorieChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Unterkategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Keine Unterkategorie</SelectItem>
                  {unterkategorien.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {unterUnterkategorien.length > 0 && (
            <div className="space-y-2">
              <Label>Unter-Unterkategorie</Label>
              <Select value={form.zusatzfelder?.unter_unterkategorie || ""} onValueChange={(v) => setForm({ ...form, zusatzfelder: { ...form.zusatzfelder, unter_unterkategorie: v } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Unter-Unterkategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {unterUnterkategorien.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {getZusatzfelder().length > 0 && (
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium text-slate-700">Zusätzliche Informationen</h4>
              {getZusatzfelder().map(feld => (
                <div key={feld.name} className="space-y-2">
                  <Label>{feld.label}</Label>
                  {feld.type === "select" ? (
                    <Select
                      value={form.zusatzfelder[feld.name] || ""}
                      onValueChange={(v) => setForm({ ...form, zusatzfelder: { ...form.zusatzfelder, [feld.name]: v } })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {feld.options.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={feld.type}
                      value={form.zusatzfelder[feld.name] || ""}
                      onChange={(e) => setForm({ ...form, zusatzfelder: { ...form.zusatzfelder, [feld.name]: e.target.value } })}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startdatum</Label>
              <Input
                type="date"
                value={form.startdatum}
                onChange={(e) => setForm({ ...form, startdatum: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Enddatum</Label>
              <Input
                type="date"
                value={form.enddatum}
                onChange={(e) => setForm({ ...form, enddatum: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Budget (€)</Label>
            <Input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoadingData || loading}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isLoadingData || loading} className="bg-blue-600 hover:bg-blue-700">
            {isLoadingData ? "Laden..." : loading ? "Speichern..." : "Projekt erstellen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
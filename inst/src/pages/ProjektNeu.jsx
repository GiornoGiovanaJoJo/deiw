import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Plus, Building2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import CameraPhotoUpload from "@/components/CameraPhotoUpload";

export default function ProjektNeu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [kunden, setKunden] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [unterkategorien, setUnterkategorien] = useState([]);
  const [unterUnterkategorien, setUnterUnterkategorien] = useState([]);
  const [benutzer, setBenutzer] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
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
  const [uploading, setUploading] = useState(false);
  const [gruppenleiter, setGruppenleiter] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [subunternehmer, setSubunternehmer] = useState([]);
  const [neuerKunde, setNeuerKunde] = useState({
    firma: "",
    ansprechpartner: "",
    email: "",
    telefon: ""
  });
  const [showNeuerKunde, setShowNeuerKunde] = useState(false);
  const [allKategorien, setAllKategorien] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      
      // Check if anfrage data is passed via URL
      const anfrageName = searchParams.get("anfrage_name");
      const anfrageKunde = searchParams.get("anfrage_kunde_id");
      const anfrageMail = searchParams.get("anfrage_email");
      const anfrageTel = searchParams.get("anfrage_telefon");
      const anfrageAdresse = searchParams.get("anfrage_adresse");
      const anfrageKategorie = searchParams.get("anfrage_kategorie");
      const anfrageUnterkategorie = searchParams.get("anfrage_unterkategorie");
      const anfrageZusatzfelder = searchParams.get("anfrage_zusatzfelder");
      
      const newForm = {
        ...form,
        projekt_nummer: `EP-${nextNumber}`,
        name: anfrageName || "",
        kunde_id: anfrageKunde || "",
        adresse: anfrageAdresse || "",
        kategorie: anfrageKategorie || "",
        unterkategorie: anfrageUnterkategorie || "",
        zusatzfelder: anfrageZusatzfelder ? JSON.parse(decodeURIComponent(anfrageZusatzfelder)) : {}
      };
      
      // If anfrage has kunde_id, find and set kunde data
      if (anfrageKunde) {
        const kundeData = kundenData.find(k => k.id === anfrageKunde);
        // If kunde doesn't exist but we have email/tel, create as new
        if (!kundeData) {
          newForm.newKunde = {
            firma: anfrageName || "",
            email: anfrageMail || "",
            telefon: anfrageTel || "",
            ansprechpartner: ""
          };
        }
      }
      
      setForm(newForm);
      
      // If anfrage has kategorien, load their unterkategorien
      if (anfrageKategorie && allCats.length > 0) {
        const children = allCats.filter(k => k.parent_id === anfrageKategorie);
        setUnterkategorien(children);
        
        if (anfrageUnterkategorie) {
          const unterChildren = allCats.filter(k => k.parent_id === anfrageUnterkategorie);
          setUnterUnterkategorien(unterChildren);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateKunde = async () => {
    if (!neuerKunde.firma) {
      toast.error("Bitte Firmennamen eingeben");
      return;
    }
    try {
      const created = await base44.entities.Kunde.create({ ...neuerKunde, status: "Aktiv" });
      setKunden([...kunden, created]);
      setForm({ ...form, kunde_id: created.id });
      setShowNeuerKunde(false);
      setNeuerKunde({ firma: "", ansprechpartner: "", email: "", telefon: "" });
      toast.success("Kunde erstellt");
    } catch (error) {
      toast.error("Fehler beim Erstellen");
    }
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

  const removePhoto = (index) => {
    const newFotos = [...form.fotos];
    newFotos.splice(index, 1);
    setForm({ ...form, fotos: newFotos });
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
    
    // Get fields from unterkategorie (second level)
    if (form.unterkategorie) {
      const unterkat = unterkategorien.find(k => k.id === form.unterkategorie);
      if (unterkat?.zusatzfelder) {
        fields = [...fields, ...unterkat.zusatzfelder];
      }
    }
    
    // Get fields from unter-unterkategorie (third level)
    if (form.zusatzfelder?.unter_unterkategorie) {
      const unterUnterkat = unterUnterkategorien.find(k => k.id === form.zusatzfelder.unter_unterkategorie);
      if (unterUnterkat?.zusatzfelder) {
        fields = [...fields, ...unterUnterkat.zusatzfelder];
      }
    }
    
    return fields;
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
      await base44.entities.Projekt.create(data);
      toast.success("Projekt erstellt");
      navigate(createPageUrl("Projekte"));
    } catch (error) {
      toast.error("Fehler beim Erstellen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Neues Projekt</h1>
          <p className="text-slate-500">Projekt anlegen und Kunden zuordnen</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${step === 1 ? "text-blue-600" : "text-slate-400"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-blue-600 text-white" : "bg-slate-200"}`}>
            1
          </div>
          <span className="font-medium">Kunde</span>
        </div>
        <div className="flex-1 h-px bg-slate-200"></div>
        <div className={`flex items-center gap-2 ${step === 2 ? "text-blue-600" : "text-slate-400"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-200"}`}>
            2
          </div>
          <span className="font-medium">Projektdaten</span>
        </div>
      </div>

      {/* Step 1: Kunde */}
      {step === 1 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Kunde wählen oder erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNeuerKunde ? (
              <>
                <div className="space-y-2">
                  <Label>Vorhandenen Kunden wählen</Label>
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
                </div>
                <div className="text-center py-2">
                  <span className="text-slate-400">oder</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowNeuerKunde(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Neuen Kunden anlegen
                </Button>
              </>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Neuer Kunde</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowNeuerKunde(false)}>
                    Abbrechen
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Firma *</Label>
                  <Input
                    value={neuerKunde.firma}
                    onChange={(e) => setNeuerKunde({ ...neuerKunde, firma: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ansprechpartner</Label>
                  <Input
                    value={neuerKunde.ansprechpartner}
                    onChange={(e) => setNeuerKunde({ ...neuerKunde, ansprechpartner: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>E-Mail</Label>
                    <Input
                      type="email"
                      value={neuerKunde.email}
                      onChange={(e) => setNeuerKunde({ ...neuerKunde, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input
                      value={neuerKunde.telefon}
                      onChange={(e) => setNeuerKunde({ ...neuerKunde, telefon: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateKunde} className="w-full bg-blue-600 hover:bg-blue-700">
                  Kunde anlegen
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700">
                Weiter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Projektdaten */}
      {step === 2 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Projektdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="space-y-2">
              <Label>Projektleiter</Label>
              <Select value={form.projektleiter_id} onValueChange={(v) => setForm({ ...form, projektleiter_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Projektleiter zuweisen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nicht zugewiesen</SelectItem>
                  {benutzer.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.vorname} {b.nachname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget (€)</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Projektadresse</Label>
                <Input
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subunternehmer</Label>
              <div className="flex flex-wrap gap-2">
                {subunternehmer.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      const ids = form.subunternehmer_ids || [];
                      if (ids.includes(sub.id)) {
                        setForm({ ...form, subunternehmer_ids: ids.filter(id => id !== sub.id) });
                      } else {
                        setForm({ ...form, subunternehmer_ids: [...ids, sub.id] });
                      }
                    }}
                    className={`px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                      (form.subunternehmer_ids || []).includes(sub.id)
                        ? "bg-purple-50 border-purple-500 text-purple-700"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-medium">{sub.firma}</p>
                    {sub.spezialisierung && (
                      <p className="text-xs text-slate-500">{sub.spezialisierung}</p>
                    )}
                  </div>
                ))}
                {subunternehmer.length === 0 && (
                  <p className="text-sm text-slate-400">Keine aktiven Subunternehmer verfügbar</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hauptfoto</Label>
              {form.foto ? (
                <div className="relative">
                  <img src={form.foto} alt="Projekt" className="w-full h-48 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setForm({ ...form, foto: "" })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <CameraPhotoUpload
                  disabled={uploading}
                  onPhotoCapture={(base64) => {
                    setForm({ ...form, foto: base64 });
                  }}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Weitere Fotos</Label>
              <div className="space-y-3">
                <CameraPhotoUpload
                  disabled={uploading}
                  onPhotoCapture={(base64) => {
                    setForm({ ...form, fotos: [...(form.fotos || []), base64] });
                  }}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(form.fotos || []).map((foto, idx) => (
                    <div key={idx} className="relative">
                      <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removePhoto(idx)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Zurück
              </Button>
              <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? "Speichern..." : "Projekt erstellen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
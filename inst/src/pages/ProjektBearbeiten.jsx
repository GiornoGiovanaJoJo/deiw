import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
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
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function ProjektBearbeiten() {
  const navigate = useNavigate();
  const [kunden, setKunden] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [unterkategorien, setUnterkategorien] = useState([]);
  const [benutzer, setBenutzer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projektId, setProjektId] = useState(null);
  const [gruppenleiter, setGruppenleiter] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [subunternehmer, setSubunternehmer] = useState([]);
  const [allBenutzer, setAllBenutzer] = useState([]);
  const [currentBenutzer, setCurrentBenutzer] = useState(null);
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
    loadData();
  }, []);

  const loadData = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    if (!id) {
      navigate(createPageUrl("Projekte"));
      return;
    }
    
    setProjektId(id);

    try {
      // Load current user from session
      const sessionData = localStorage.getItem("benutzer_session");
      let currentBen = null;
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          const benutzerList = await base44.entities.Benutzer.filter({ id: session.id });
          if (benutzerList.length > 0) {
            currentBen = benutzerList[0];
          }
        }
      }
      setCurrentBenutzer(currentBen);

      const [projekteData, kundenData, kategorienData, allBenutzerData, benutzerData, gruppData, workerData, subData] = await Promise.all([
        base44.entities.Projekt.filter({ id }),
        base44.entities.Kunde.list(),
        base44.entities.Kategorie.filter({ typ: "Projekt" }),
        base44.entities.Benutzer.list(),
        base44.entities.Benutzer.filter({ position: "Projektleiter" }),
        base44.entities.Benutzer.filter({ position: "Gruppenleiter" }),
        base44.entities.Benutzer.filter({ position: "Worker" }),
        base44.entities.Subunternehmer.filter({ status: "Aktiv" })
      ]);
      
      setAllBenutzer(allBenutzerData);
      
      if (projekteData.length === 0) {
        navigate(createPageUrl("Projekte"));
        return;
      }
      
      const p = projekteData[0];
      setForm({
        projekt_nummer: p.projekt_nummer || "",
        name: p.name || "",
        beschreibung: p.beschreibung || "",
        kunde_id: p.kunde_id || "",
        projektleiter_id: p.projektleiter_id || "",
        gruppenleiter_ids: p.gruppenleiter_ids || [],
        worker_ids: p.worker_ids || [],
        subunternehmer_ids: p.subunternehmer_ids || [],
        kategorie: p.kategorie || "",
        unterkategorie: p.unterkategorie || "",
        zusatzfelder: p.zusatzfelder || {},
        status: p.status || "Geplant",
        startdatum: p.startdatum || "",
        enddatum: p.enddatum || "",
        budget: p.budget?.toString() || "",
        adresse: p.adresse || "",
        prioritaet: p.prioritaet || "Mittel",
        foto: p.foto || "",
        fotos: p.fotos || []
      });
      
      setKunden(kundenData);
      setKategorien(kategorienData.filter(k => !k.parent_id));
      setBenutzer(benutzerData);
      setGruppenleiter(gruppData);
      setWorkers(workerData);
      setSubunternehmer(subData);
      
      // Load unterkategorien if kategorie is set
      if (p.kategorie) {
        const allKategorien = await base44.entities.Kategorie.list();
        const children = allKategorien.filter(k => k.parent_id === p.kategorie);
        setUnterkategorien(children);
      }
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const handleProjektleiterChange = (projektleiterId) => {
    setForm(prev => ({ ...prev, projektleiter_id: projektleiterId }));
    
    if (projektleiterId) {
      // Auto-select Gruppenleiter under this Projektleiter
      const untergeordneteGruppenleiter = allBenutzer.filter(
        b => b.position === "Gruppenleiter" && b.vorgesetzter_id === projektleiterId
      );
      const gruppenleiterIds = untergeordneteGruppenleiter.map(g => g.id);
      setForm(prev => ({ ...prev, gruppenleiter_ids: gruppenleiterIds }));
    } else {
      setForm(prev => ({ ...prev, gruppenleiter_ids: [] }));
    }
  };

  const getFilteredGruppenleiter = () => {
    if (form.projektleiter_id) {
      return gruppenleiter.filter(gl => gl.vorgesetzter_id === form.projektleiter_id);
    }
    return [];
  };

  const getFilteredWorkers = () => {
    if (!form.gruppenleiter_ids || form.gruppenleiter_ids.length === 0) {
      return [];
    }
    return workers.filter(w => form.gruppenleiter_ids.includes(w.vorgesetzter_id));
  };

  const handleGruppenleiterChange = (gruppenleiterId, checked) => {
    let newIds = [...(form.gruppenleiter_ids || [])];
    
    if (checked) {
      newIds.push(gruppenleiterId);
      
      // Auto-select Workers under this Gruppenleiter
      const untergeordneteWorkers = allBenutzer.filter(
        b => b.position === "Worker" && b.vorgesetzter_id === gruppenleiterId
      );
      const workerIds = untergeordneteWorkers.map(w => w.id);
      const currentWorkerIds = form.worker_ids || [];
      const mergedWorkerIds = [...new Set([...currentWorkerIds, ...workerIds])];
      setForm(prev => ({ ...prev, gruppenleiter_ids: newIds, worker_ids: mergedWorkerIds }));
    } else {
      newIds = newIds.filter(id => id !== gruppenleiterId);
      setForm(prev => ({ ...prev, gruppenleiter_ids: newIds }));
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

  const handleKategorieChange = async (kategorieId) => {
    setForm({ ...form, kategorie: kategorieId, unterkategorie: "", zusatzfelder: {} });
    
    if (kategorieId) {
      try {
        const allKategorien = await base44.entities.Kategorie.list();
        const children = allKategorien.filter(k => k.parent_id === kategorieId);
        setUnterkategorien(children);
      } catch (error) {
        console.error(error);
      }
    } else {
      setUnterkategorien([]);
    }
  };

  const getZusatzfelder = () => {
    if (!form.unterkategorie) return [];
    
    const unterkat = unterkategorien.find(k => k.id === form.unterkategorie);
    return unterkat?.zusatzfelder || [];
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Bitte Projektnamen eingeben");
      return;
    }
    setSaving(true);
    try {
      const data = { ...form };
      if (data.budget) data.budget = parseFloat(data.budget);
      else delete data.budget;
      
      await base44.entities.Projekt.update(projektId, data);
      toast.success("Projekt aktualisiert");
      navigate(createPageUrl(`ProjektDetail?id=${projektId}`));
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projekt bearbeiten</h1>
          <p className="text-slate-500">{form.projekt_nummer}</p>
        </div>
      </div>

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
              <Label>Kunde</Label>
              <Select value={form.kunde_id} onValueChange={(v) => setForm({ ...form, kunde_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Kunde wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Kein Kunde</SelectItem>
                  {kunden.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.firma}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select value={form.kategorie} onValueChange={handleKategorieChange}>
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

          {unterkategorien.length > 0 && (
            <div className="space-y-2">
              <Label>Unterkategorie</Label>
              <Select value={form.unterkategorie} onValueChange={(v) => setForm({ ...form, unterkategorie: v, zusatzfelder: {} })}>
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
              <Label>Projektleiter</Label>
              <Select 
                value={form.projektleiter_id} 
                onValueChange={handleProjektleiterChange}
                disabled={currentBenutzer?.position === "Worker" || currentBenutzer?.position === "Gruppenleiter"}
              >
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label>Gruppenleiter</Label>
            <div className="space-y-2">
              {getFilteredGruppenleiter().map(gl => {
                const isCurrentUser = currentBenutzer?.id === gl.id && currentBenutzer?.position === "Gruppenleiter";
                const isDisabled = currentBenutzer?.position === "Worker" || isCurrentUser;
                
                return (
                  <label key={gl.id} className={`flex items-center gap-2 p-2 hover:bg-slate-50 rounded ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                    <input
                      type="checkbox"
                      checked={(form.gruppenleiter_ids || []).includes(gl.id)}
                      onChange={(e) => {
                        if (isDisabled) return;
                        handleGruppenleiterChange(gl.id, e.target.checked);
                      }}
                      className="w-4 h-4"
                      disabled={isDisabled}
                    />
                    <span className="text-sm">{gl.vorname} {gl.nachname}</span>
                  </label>
                );
              })}
              {getFilteredGruppenleiter().length === 0 && (
                <p className="text-sm text-slate-400">
                  {form.projektleiter_id 
                    ? "Keine Gruppenleiter für diesen Projektleiter verfügbar" 
                    : "Bitte wählen Sie zuerst einen Projektleiter aus"}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Arbeiter</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {getFilteredWorkers().map(w => (
                <label key={w.id} className={`flex items-center gap-2 p-2 hover:bg-slate-50 rounded ${currentBenutzer?.position === "Worker" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={(form.worker_ids || []).includes(w.id)}
                    onChange={(e) => {
                      if (currentBenutzer?.position === "Worker") return;
                      const ids = form.worker_ids || [];
                      if (e.target.checked) {
                        setForm({ ...form, worker_ids: [...ids, w.id] });
                      } else {
                        setForm({ ...form, worker_ids: ids.filter(id => id !== w.id) });
                      }
                    }}
                    className="w-4 h-4"
                    disabled={currentBenutzer?.position === "Worker"}
                  />
                  <span className="text-sm">{w.vorname} {w.nachname}</span>
                  {w.spezialisierung && (
                    <span className="text-xs text-slate-400">({w.spezialisierung})</span>
                  )}
                </label>
              ))}
              {getFilteredWorkers().length === 0 && (
                <p className="text-sm text-slate-400">
                  {form.gruppenleiter_ids && form.gruppenleiter_ids.length > 0
                    ? "Keine Arbeiter für die ausgewählten Gruppenleiter verfügbar"
                    : "Bitte wählen Sie zuerst Gruppenleiter aus"}
                </p>
              )}
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
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">Hauptfoto hochladen</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, true)}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label>Weitere Fotos</Label>
            <div className="grid grid-cols-3 gap-2">
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
              {(form.fotos || []).length < 10 && (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">+ Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, false)}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function CreateProjectMinimal({ open, onOpenChange, anfrage }) {
  const [loading, setLoading] = useState(false);
  const [projektenummer, setProjektenummer] = useState("");
  const [projektnummer, setProjektnummer] = useState("");
  const [kunde_id, setKunde_id] = useState("");
  const [kunden, setKunden] = useState([]);
  const [beschreibung, setBeschreibung] = useState("");
  const [startdatum, setStartdatum] = useState("");
  const [enddatum, setEnddatum] = useState("");
  const [budget, setBudget] = useState("");
  const [showNewKunde, setShowNewKunde] = useState(false);
  const [newKundeName, setNewKundeName] = useState("");

  useEffect(() => {
    if (open && anfrage) {
      loadKunden();
      generateProjectnummer();
    }
  }, [open, anfrage]);

  const loadKunden = async () => {
    try {
      const data = await base44.entities.Kunde.list();
      setKunden(data);

      // Try to find matching customer by name or email
      const matchingKunde = data.find(
        k => k.firma?.toLowerCase() === anfrage.kunde_name?.toLowerCase()
      );
      if (matchingKunde) {
        setKunde_id(matchingKunde.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generateProjectnummer = async () => {
    try {
      const projekte = await base44.entities.Projekt.list();
      const epNumbers = projekte
        .map(p => parseInt(p.projekt_nummer?.replace("EP-", "") || "0"))
        .filter(n => !isNaN(n));
      const nextNumber = Math.max(1000, ...epNumbers) + 1;
      setProjektnummer(`EP-${nextNumber}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateKunde = async () => {
    if (!newKundeName) {
      toast.error("Bitte Firmennamen eingeben");
      return;
    }

    try {
      const newKunde = await base44.entities.Kunde.create({
        firma: newKundeName,
        typ: "Firma"
      });
      setKunde_id(newKunde.id);
      setKunden([...kunden, newKunde]);
      setShowNewKunde(false);
      setNewKundeName("");
      toast.success("Kunde erstellt");
    } catch (error) {
      toast.error("Fehler beim Erstellen des Kunden");
    }
  };

  const handleSave = async () => {
    if (!projektenummer) {
      toast.error("Bitte Projektnamen eingeben");
      return;
    }

    if (!anfrage) {
      toast.error("Keine Anfrage ausgewählt");
      return;
    }

    setLoading(true);
    try {
      const projektData = {
        projekt_nummer: projektnummer,
        name: projektenummer,
        kunde_id: kunde_id || null,
        anfrage_id: anfrage?.id || null,
        kategorie: anfrage?.kategorie || "",
        unterkategorie: anfrage?.unterkategorie || "",
        zusatzfelder: anfrage?.antworten ? { ...anfrage.antworten } : {},
        adresse: anfrage?.kunde_adresse || "",
        beschreibung: beschreibung || "",
        status: "Geplant",
        prioritaet: "Mittel",
        startdatum: startdatum || null,
        enddatum: enddatum || null,
        budget: budget ? parseFloat(budget) : null
      };

      // Remove null values and empty arrays
      Object.keys(projektData).forEach(key => {
        if (Array.isArray(projektData[key]) && projektData[key].length === 0) {
          delete projektData[key];
        } else if (projektData[key] === null) {
          delete projektData[key];
        }
      });

      console.log("Anfrage data:", anfrage);
      console.log("Saving project:", projektData);
      const result = await base44.entities.Projekt.create(projektData);
      console.log("Project created:", result);
      toast.success("Projekt erstellt");
      
      // Update anfrage status and link project
      await base44.entities.Anfrage.update(anfrage.id, {
        status: "Abgeschlossen",
        projekt_id: result.id
      });
      
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Fehler beim Erstellen: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!anfrage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neues Projekt erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Projektnummer</Label>
            <Input value={projektnummer} disabled className="bg-slate-50" />
          </div>

          <div className="space-y-2">
            <Label>Projektname *</Label>
            <Input
              value={projektenummer}
              onChange={(e) => setProjektenummer(e.target.value)}
              placeholder="z.B. Solaranlage Müller"
            />
          </div>

          <div className="space-y-2">
            <Label>Kunde</Label>
            {!showNewKunde ? (
              <div className="flex gap-2">
                <Select value={kunde_id} onValueChange={setKunde_id}>
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
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowNewKunde(true)}
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newKundeName}
                  onChange={(e) => setNewKundeName(e.target.value)}
                  placeholder="Firma..."
                />
                <Button 
                  type="button"
                  size="sm"
                  onClick={handleCreateKunde}
                  className="flex-shrink-0 bg-green-600 hover:bg-green-700"
                >
                  OK
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setShowNewKunde(false);
                    setNewKundeName("");
                  }}
                  className="flex-shrink-0"
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Projektbeschreibung..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Startdatum</Label>
              <Input
                type="date"
                value={startdatum}
                onChange={(e) => setStartdatum(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Enddatum</Label>
              <Input
                type="date"
                value={enddatum}
                onChange={(e) => setEnddatum(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Budget (€)</Label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="text-sm text-slate-500 p-3 bg-slate-50 rounded">
            <p>Kategorie: <span className="font-medium">{anfrage.kategorie}</span></p>
            <p>Adresse: <span className="font-medium">{anfrage.kunde_adresse}</span></p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? "Erstelle..." : "Projekt erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
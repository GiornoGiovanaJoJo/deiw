import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  QrCode, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search,
  CheckCircle2,
  User,
  FolderKanban,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Terminal() {
  const [step, setStep] = useState("login"); // login, menu, scan, confirm
  const [benutzer, setBenutzer] = useState(null);
  const [allBenutzer, setAllBenutzer] = useState([]);
  const [projekte, setProjekte] = useState([]);
  const [waren, setWaren] = useState([]);
  const [selectedWare, setSelectedWare] = useState(null);
  const [selectedProjekt, setSelectedProjekt] = useState("");
  const [aktion, setAktion] = useState("");
  const [menge, setMenge] = useState(1);
  const [qrInput, setQrInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (inputRef.current && step === "login") {
      inputRef.current.focus();
    }
  }, [step]);

  const loadData = async () => {
    try {
      const [benutzerData, projekteData, warenData] = await Promise.all([
        base44.entities.Benutzer.filter({ status: "Aktiv" }),
        base44.entities.Projekt.filter({ status: "In Bearbeitung" }),
        base44.entities.Ware.list()
      ]);
      setAllBenutzer(benutzerData);
      setProjekte(projekteData);
      setWaren(warenData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleQRLogin = () => {
    const found = allBenutzer.find(b => b.qr_code === qrInput);
    if (found) {
      setBenutzer(found);
      setStep("menu");
      setQrInput("");
    } else {
      toast.error("QR-Code nicht erkannt");
    }
  };

  const handleSearch = (value) => {
    setSearchInput(value);
    if (value.length >= 2) {
      const results = waren.filter(w => 
        w.name?.toLowerCase().includes(value.toLowerCase()) ||
        w.barcode?.includes(value)
      );
      setSearchResults(results.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  };

  const selectWare = (ware) => {
    setSelectedWare(ware);
    setSearchInput("");
    setSearchResults([]);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedWare || !aktion || menge <= 0) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }

    try {
      // Create log entry
      const projektInfo = selectedProjekt && selectedProjekt !== 'kein_projekt' 
        ? projekte.find(p => p.id === selectedProjekt)?.projekt_nummer 
        : "";
      const notiz = aktion === "Entnahme" 
        ? `Entnahme vom Terminal: ${menge} ${selectedWare.einheit} von ${selectedWare.name}${projektInfo ? ` für Projekt ${projektInfo}` : ''}` 
        : `Rückgabe vom Terminal: ${menge} ${selectedWare.einheit} von ${selectedWare.name}${projektInfo ? ` von Projekt ${projektInfo}` : ''}`;

      await base44.entities.WarenLog.create({
        ware_id: selectedWare.id,
        ware_name: selectedWare.name,
        benutzer_id: benutzer.id,
        benutzer_name: `${benutzer.vorname} ${benutzer.nachname}`,
        projekt_id: selectedProjekt || "",
        projekt_nummer: projektInfo,
        aktion: aktion,
        menge: menge,
        notiz: notiz,
        datum: new Date().toISOString()
      });

      // Update stock
      let newBestand = selectedWare.bestand || 0;
      if (aktion === "Entnahme") {
        newBestand -= menge;
      } else if (aktion === "Rückgabe" || aktion === "Eingang") {
        newBestand += menge;
      }

      let newStatus = "Verfügbar";
      if (newBestand <= 0) {
        newStatus = "Ausverkauft";
        newBestand = Math.max(0, newBestand);
      } else if (selectedWare.mindestbestand && newBestand <= selectedWare.mindestbestand) {
        newStatus = "Niedrig";
      }

      await base44.entities.Ware.update(selectedWare.id, {
        bestand: newBestand,
        status: newStatus
      });

      setSuccessMessage(`${aktion}: ${menge}x ${selectedWare.name}`);
      setDialogOpen(false);
      resetSelection();
      loadData();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const resetSelection = () => {
    setSelectedWare(null);
    setSelectedProjekt("");
    setAktion("");
    setMenge(1);
  };

  const handleLogout = () => {
    setBenutzer(null);
    setStep("login");
    resetSelection();
  };

  // Login Screen
  if (step === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Lager-Terminal</CardTitle>
            <p className="text-slate-500 mt-2">QR-Code scannen zum Anmelden</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              ref={inputRef}
              type="password"
              placeholder="QR-Code scannen..."
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQRLogin()}
              className="text-center text-lg h-14"
              autoFocus
            />
            <Button onClick={handleQRLogin} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
              Anmelden
            </Button>

            <div className="text-center pt-4">
              <p className="text-xs text-slate-400">
                Halten Sie Ihren QR-Code vor den Scanner
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Terminal Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {benutzer?.vorname} {benutzer?.nachname}
              </p>
              <p className="text-sm text-slate-500">{benutzer?.position}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Abmelden
          </Button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-500 text-white rounded-xl p-4 flex items-center gap-3"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-medium">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => { setAktion("Entnahme"); setStep("scan"); }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <ArrowUpCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Entnahme</h3>
            <p className="text-slate-500 mt-1">Material entnehmen</p>
          </button>

          <button
            onClick={() => { setAktion("Rückgabe"); setStep("scan"); }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <ArrowDownCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Rückgabe</h3>
            <p className="text-slate-500 mt-1">Material zurückgeben</p>
          </button>
        </div>

        {/* Search Section */}
        {step === "scan" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {aktion === "Entnahme" ? "Artikel entnehmen" : "Artikel zurückgeben"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Barcode scannen oder Artikelname eingeben..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 h-14 text-lg"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {searchResults.map((ware) => (
                    <button
                      key={ware.id}
                      onClick={() => selectWare(ware)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-slate-800">{ware.name}</p>
                          <p className="text-sm text-slate-500">
                            Bestand: {ware.bestand || 0} {ware.einheit}
                          </p>
                        </div>
                      </div>
                      {ware.barcode && (
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {ware.barcode}
                        </code>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <Button variant="outline" onClick={() => { setStep("menu"); setAktion(""); }} className="w-full">
                Zurück
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Confirm Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{aktion} bestätigen</DialogTitle>
            </DialogHeader>
            {selectedWare && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Package className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{selectedWare.name}</p>
                      <p className="text-sm text-slate-500">
                        Verfügbar: {selectedWare.bestand || 0} {selectedWare.einheit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Projekt zuordnen *</Label>
                  <Select value={selectedProjekt} onValueChange={setSelectedProjekt}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Projekt wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kein_projekt">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          Kein Projekt
                        </div>
                      </SelectItem>
                      {projekte.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            <FolderKanban className="w-4 h-4 text-blue-500" />
                            {p.projekt_nummer} - {p.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Menge ({selectedWare.einheit})</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setMenge(Math.max(1, menge - 1))}
                      className="h-12 w-12"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={menge}
                      onChange={(e) => setMenge(Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-12 text-center text-lg font-semibold"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setMenge(menge + 1)}
                      className="h-12 w-12"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {aktion === "Entnahme" && selectedWare.bestand < menge && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Nicht genug Bestand vorhanden!
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleConfirm} 
                className={aktion === "Entnahme" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
                disabled={aktion === "Entnahme" && selectedWare?.bestand < menge}
              >
                {aktion} bestätigen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
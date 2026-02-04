import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Mail, Phone, QrCode } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function Benutzer() {
  const [benutzer, setBenutzer] = useState([]);
  const [rollen, setRollen] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBenutzer, setSelectedBenutzer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrBenutzer, setSelectedQrBenutzer] = useState(null);

  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    email: "",
    position: "Worker",
    telefon: "",
    spezialisierung: "",
    passwort: "",
    status: "Aktiv",
    vorgesetzter_id: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const benutzerData = await base44.entities.Benutzer.list();
      setBenutzer(benutzerData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleOpenDialog = (ben = null) => {
    if (ben) {
      setSelectedBenutzer(ben);
      setFormData({
        vorname: ben.vorname || "",
        nachname: ben.nachname || "",
        email: ben.email || "",
        position: ben.position || "Worker",
        telefon: ben.telefon || "",
        spezialisierung: ben.spezialisierung || "",
        passwort: "",
        status: ben.status || "Aktiv",
        vorgesetzter_id: ben.vorgesetzter_id || ""
      });
    } else {
      setSelectedBenutzer(null);
      setFormData({
        vorname: "",
        nachname: "",
        email: "",
        position: "Worker",
        telefon: "",
        spezialisierung: "",
        passwort: "",
        status: "Aktiv",
        vorgesetzter_id: ""
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.vorname || !formData.nachname || !formData.position) {
      alert("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    try {
      const data = {
        vorname: formData.vorname,
        nachname: formData.nachname,
        email: formData.email,
        position: formData.position,
        telefon: formData.telefon,
        spezialisierung: formData.spezialisierung,
        status: formData.status,
        vorgesetzter_id: formData.vorgesetzter_id || null
      };

      if (formData.passwort) {
        data.passwort = formData.passwort;
      }

      if (selectedBenutzer) {
        await base44.entities.Benutzer.update(selectedBenutzer.id, data);
      } else {
        await base44.entities.Benutzer.create(data);
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving benutzer:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Benutzer löschen?")) return;
    try {
      await base44.entities.Benutzer.delete(id);
      loadData();
    } catch (error) {
      console.error("Error deleting benutzer:", error);
    }
  };



  const getVorgesetzterName = (vorgesetzter_id) => {
    const vorgesetzter = benutzer.find(b => b.id === vorgesetzter_id);
    return vorgesetzter ? `${vorgesetzter.vorname} ${vorgesetzter.nachname}` : "-";
  };

  const canEditBenutzer = () => {
    const sessionData = localStorage.getItem("benutzer_session");
    if (sessionData) {
      const session = JSON.parse(sessionData);
      const currentUser = benutzer.find(b => b.id === session.id);
      if (currentUser && ["Worker", "Gruppenleiter", "Projektleiter"].includes(currentUser.position)) {
        return false;
      }
    }
    return true;
  };

  const canViewQr = (benützerId) => {
    const sessionData = localStorage.getItem("benutzer_session");
    if (sessionData) {
      const session = JSON.parse(sessionData);
      const currentUser = benutzer.find(b => b.id === session.id);
      // Admin und Warehouse können alle sehen, andere nur ihre eigenen
      if (currentUser?.position === "Admin" || currentUser?.position === "Warehouse") return true;
      if (currentUser?.id === benützerId) return true;
    }
    return false;
  };

  const filteredBenutzer = benutzer.filter(b =>
    `${b.vorname} ${b.nachname}`.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase())
  );

  const positionColors = {
    Admin: "bg-red-100 text-red-800",
    Projektleiter: "bg-blue-100 text-blue-800",
    Gruppenleiter: "bg-purple-100 text-purple-800",
    Worker: "bg-green-100 text-green-800",
    Warehouse: "bg-amber-100 text-amber-800",
    Büro: "bg-cyan-100 text-cyan-800"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Benutzer</h1>
          <p className="text-slate-500 mt-1">Verwalte Benutzer und ihre Rollen</p>
        </div>
        {canEditBenutzer() && (
          <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Neuer Benutzer
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nach Name oder E-Mail suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Laden...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Vorgesetzter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBenutzer.map(ben => (
                <TableRow key={ben.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-800">{ben.vorname} {ben.nachname}</p>
                      {ben.qr_code && canViewQr(ben.id) && (
                        <button
                          onClick={() => {
                            setSelectedQrBenutzer(ben);
                            setQrModalOpen(true);
                          }}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          <QrCode className="w-3 h-3" />
                          QR-Code anzeigen
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a href={`mailto:${ben.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {ben.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={positionColors[ben.position]}>
                        {ben.position}
                      </Badge>
                      {ben.telefon && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {ben.telefon}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      <div>{getVorgesetzterName(ben.vorgesetzter_id)}</div>
                      <div className="text-xs text-slate-400">
                        {ben.vorgesetzter_id ? benutzer.find(b => b.id === ben.vorgesetzter_id)?.position : "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ben.status === "Aktiv" ? "default" : "secondary"}>
                      {ben.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEditBenutzer() && (
                          <>
                            <DropdownMenuItem onClick={() => handleOpenDialog(ben)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(ben.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* QR Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR-Code: {selectedQrBenutzer?.vorname} {selectedQrBenutzer?.nachname}</DialogTitle>
          </DialogHeader>
          {selectedQrBenutzer?.qr_code && (
            <div className="flex flex-col items-center gap-4 p-4">
              <img 
                src={selectedQrBenutzer.qr_code} 
                alt="QR Code" 
                className="w-64 h-64 border rounded-lg"
              />
              <p className="text-lg font-semibold text-slate-800">{selectedQrBenutzer.qr_code}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedBenutzer ? "Benutzer bearbeiten" : "Neuer Benutzer"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">
                  Vorname
                </label>
                <Input
                  value={formData.vorname}
                  onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                  placeholder="Max"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">
                  Nachname
                </label>
                <Input
                  value={formData.nachname}
                  onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                  placeholder="Mustermann"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">
                E-Mail
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="max@example.com"
              />
            </div>

            <div>
               <label className="text-sm font-semibold text-slate-700 block mb-1">
                 Position
               </label>
               <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Admin">Admin</SelectItem>
                   <SelectItem value="Projektleiter">Projektleiter</SelectItem>
                   <SelectItem value="Gruppenleiter">Gruppenleiter</SelectItem>
                   <SelectItem value="Worker">Worker</SelectItem>
                   <SelectItem value="Warehouse">Warehouse</SelectItem>
                   <SelectItem value="Büro">Büro</SelectItem>
                 </SelectContent>
               </Select>
             </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">
                Telefon
              </label>
              <Input
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                placeholder="+49..."
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">
                Spezialisierung
              </label>
              <Input
                value={formData.spezialisierung}
                onChange={(e) => setFormData({ ...formData, spezialisierung: e.target.value })}
                placeholder="z.B. Elektriker"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">
                Vorgesetzter
              </label>
              <Select value={formData.vorgesetzter_id} onValueChange={(value) => setFormData({ ...formData, vorgesetzter_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Keine</SelectItem>
                  {benutzer.filter(b => b.id !== selectedBenutzer?.id).map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.vorname} {b.nachname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedBenutzer && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">
                  Passwort
                </label>
                <Input
                  type="password"
                  value={formData.passwort}
                  onChange={(e) => setFormData({ ...formData, passwort: e.target.value })}
                  placeholder="Passwort"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
              {selectedBenutzer ? "Aktualisieren" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
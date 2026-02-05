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
import { Search, Eye, MessageSquare, Mail, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [benutzer, setBenutzer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [antwort, setAntwort] = useState("");
  const [bearbeiter, setBearbeiter] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketsData, benutzerData] = await Promise.all([
        base44.entities.Ticket.list("-created_date"),
        base44.entities.Benutzer.list()
      ]);
      setTickets(ticketsData);
      setBenutzer(benutzerData);
    } catch (error) {
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setAntwort(ticket.antwort || "");
    setBearbeiter(ticket.bearbeiter_id || "");
    setStatus(ticket.status || "Neu");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      await base44.entities.Ticket.update(selectedTicket.id, {
        antwort,
        bearbeiter_id: bearbeiter,
        status
      });
      toast.success("Ticket aktualisiert");
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.betreff?.toLowerCase().includes(search.toLowerCase()) ||
      t.absender_email?.toLowerCase().includes(search.toLowerCase()) ||
      t.absender_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    "Neu": "bg-blue-100 text-blue-700",
    "In Bearbeitung": "bg-amber-100 text-amber-700",
    "Beantwortet": "bg-emerald-100 text-emerald-700",
    "Geschlossen": "bg-slate-100 text-slate-700"
  };

  const prioritaetColors = {
    "Niedrig": "bg-slate-100 text-slate-600",
    "Mittel": "bg-blue-100 text-blue-600",
    "Hoch": "bg-red-100 text-red-600"
  };

  const kategorieColors = {
    "Anfrage": "bg-blue-50 text-blue-700",
    "Support": "bg-purple-50 text-purple-700",
    "Beschwerde": "bg-red-50 text-red-700",
    "Sonstiges": "bg-slate-50 text-slate-700"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Support & Anfragen</h1>
        <p className="text-slate-500 mt-1">Tickets und Anfragen von der Webseite bearbeiten</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Betreff, E-Mail oder Name suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="Neu">Neu</SelectItem>
                <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                <SelectItem value="Beantwortet">Beantwortet</SelectItem>
                <SelectItem value="Geschlossen">Geschlossen</SelectItem>
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
                <TableHead>Betreff</TableHead>
                <TableHead className="hidden md:table-cell">Absender</TableHead>
                <TableHead className="hidden md:table-cell">Kategorie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Datum</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Keine Tickets gefunden</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleOpenTicket(ticket)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${ticket.status === "Neu" ? "bg-blue-500" : "bg-slate-300"}`} />
                        <div>
                          <p className="font-medium text-slate-800">{ticket.betreff}</p>
                          {ticket.prioritaet === "Hoch" && (
                            <Badge className={prioritaetColors["Hoch"]} variant="outline">
                              Hoch
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <p className="text-slate-700">{ticket.absender_name || "-"}</p>
                        <p className="text-sm text-slate-500">{ticket.absender_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className={kategorieColors[ticket.kategorie]}>
                        {ticket.kategorie}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[ticket.status]}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-slate-500">
                      {format(new Date(ticket.created_date), "dd.MM.yyyy HH:mm", { locale: de })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              {/* Ticket Info */}
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{selectedTicket.betreff}</h3>
                  <Badge className={statusColors[selectedTicket.status]}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    {selectedTicket.absender_email}
                  </div>
                  {selectedTicket.absender_telefon && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      {selectedTicket.absender_telefon}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    {format(new Date(selectedTicket.created_date), "dd.MM.yyyy HH:mm", { locale: de })}
                  </div>
                  <Badge className={kategorieColors[selectedTicket.kategorie]}>
                    {selectedTicket.kategorie}
                  </Badge>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-slate-500 mb-1">Nachricht:</p>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedTicket.nachricht}</p>
                </div>
              </div>

              {/* Response Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Neu">Neu</SelectItem>
                        <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                        <SelectItem value="Beantwortet">Beantwortet</SelectItem>
                        <SelectItem value="Geschlossen">Geschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bearbeiter</Label>
                    <Select value={bearbeiter} onValueChange={setBearbeiter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Bearbeiter zuweisen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Nicht zugewiesen</SelectItem>
                        {benutzer.map(b => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.vorname} {b.nachname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Antwort / Notizen</Label>
                  <Textarea
                    value={antwort}
                    onChange={(e) => setAntwort(e.target.value)}
                    rows={4}
                    placeholder="Antwort oder interne Notizen..."
                  />
                </div>
              </div>
            </div>
          )}
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
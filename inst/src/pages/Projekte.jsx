import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  FolderKanban,
  Calendar,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const STATUS_OPTIONS = ["Geplant", "In Bearbeitung", "Abgeschlossen", "Pausiert", "Storniert"];

export default function Projekte() {
  const [projekte, setProjekte] = useState([]);
  const [kunden, setKunden] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentBenutzer, setCurrentBenutzer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load from session
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

      const [projekteData, kundenData] = await Promise.all([
        base44.entities.Projekt.list("-created_date"),
        base44.entities.Kunde.list()
      ]);

      // Filter projects based on role
      let filteredProjekte = projekteData;
      if (currentBen?.position === "Projektleiter") {
        // Projektleiter sees projects without Projektleiter OR where they are assigned
        filteredProjekte = projekteData.filter(p => 
          !p.projektleiter_id || p.projektleiter_id === currentBen.id
        );
      } else if (currentBen?.position === "Gruppenleiter") {
        filteredProjekte = projekteData.filter(p => 
          (p.gruppenleiter_ids || []).includes(currentBen.id)
        );
      } else if (currentBen?.position === "Worker") {
        filteredProjekte = projekteData.filter(p => 
          (p.worker_ids || []).includes(currentBen.id)
        );
      }

      setProjekte(filteredProjekte);
      setKunden(kundenData);
    } catch (error) {
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const canDeleteProject = () => {
    return !["Worker", "Gruppenleiter"].includes(currentBenutzer?.position);
  };

  const handleDelete = async (id) => {
    if (confirm("Möchten Sie dieses Projekt wirklich löschen?")) {
      try {
        await base44.entities.Projekt.delete(id);
        toast.success("Projekt gelöscht");
        loadData();
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const getKundeName = (kundeId) => {
    const kunde = kunden.find(k => k.id === kundeId);
    return kunde?.firma || "-";
  };

  const filteredProjekte = projekte.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.projekt_nummer?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    "Geplant": "bg-slate-100 text-slate-700",
    "In Bearbeitung": "bg-blue-100 text-blue-700",
    "Abgeschlossen": "bg-emerald-100 text-emerald-700",
    "Pausiert": "bg-amber-100 text-amber-700",
    "Storniert": "bg-red-100 text-red-700"
  };

  const prioritaetColors = {
    "Niedrig": "bg-slate-100 text-slate-600",
    "Mittel": "bg-blue-100 text-blue-600",
    "Hoch": "bg-amber-100 text-amber-600",
    "Kritisch": "bg-red-100 text-red-600"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projekte</h1>
          <p className="text-slate-500 mt-1">Alle Projekte verwalten</p>
        </div>
        <Link to={createPageUrl("ProjektNeu")}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Neues Projekt
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Projektname oder EP-Nummer suchen..."
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
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Project Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProjekte.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Keine Projekte gefunden</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjekte.map((projekt) => (
            <Card key={projekt.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-400 font-medium">{projekt.projekt_nummer}</p>
                        {!projekt.projektleiter_id && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0">Kein PL</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800">{projekt.name}</h3>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem asChild>
                         <Link to={createPageUrl(`ProjektDetail?id=${projekt.id}`)}>
                           <Eye className="w-4 h-4 mr-2" />
                           Anzeigen
                         </Link>
                       </DropdownMenuItem>
                       {canDeleteProject() && (
                         <>
                           <DropdownMenuItem asChild>
                             <Link to={createPageUrl(`ProjektBearbeiten?id=${projekt.id}`)}>
                               <Pencil className="w-4 h-4 mr-2" />
                               Bearbeiten
                             </Link>
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             onClick={() => handleDelete(projekt.id)}
                             className="text-red-600"
                           >
                             <Trash2 className="w-4 h-4 mr-2" />
                             Löschen
                           </DropdownMenuItem>
                         </>
                       )}
                     </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[2.5rem]">
                  {projekt.beschreibung || "Keine Beschreibung"}
                </p>

                <div className="space-y-2 mb-4">
                  {projekt.kunde_id && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="w-4 h-4" />
                      {getKundeName(projekt.kunde_id)}
                    </div>
                  )}
                  {projekt.startdatum && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(projekt.startdatum), "dd.MM.yyyy", { locale: de })}
                      {projekt.enddatum && ` - ${format(new Date(projekt.enddatum), "dd.MM.yyyy", { locale: de })}`}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={statusColors[projekt.status]}>
                    {projekt.status}
                  </Badge>
                  {projekt.prioritaet && (
                    <Badge className={prioritaetColors[projekt.prioritaet]}>
                      {projekt.prioritaet}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
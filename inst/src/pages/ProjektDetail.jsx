import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Pencil, 
  Building2, 
  Calendar, 
  User, 
  MapPin,
  Package,
  Euro,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import EtappenManager from "@/components/EtappenManager";
import DokumentManager from "@/components/DokumentManager";
import ProjectReport from "@/components/ProjectReport";
import CommentThread from "@/components/CommentThread";

export default function ProjektDetail() {
  const navigate = useNavigate();
  const [projekt, setProjekt] = useState(null);
  const [kunde, setKunde] = useState(null);
  const [projektleiter, setProjektleiter] = useState(null);
  const [team, setTeam] = useState({ gruppenleiter: [], workers: [] });
  const [subunternehmerList, setSubunternehmerList] = useState([]);
  const [warenLogs, setWarenLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kategorieName, setKategorieName] = useState("");
  const [unterkategorieName, setUnterkategorieName] = useState("");
  const [unterUnterKategorieName, setUnterUnterKategorieName] = useState("");
  const [allBenutzer, setAllBenutzer] = useState([]);
  const [anfrage, setAnfrage] = useState(null);

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

    try {
      const [projekteData, logsData] = await Promise.all([
        base44.entities.Projekt.filter({ id }),
        base44.entities.WarenLog.filter({ projekt_id: id })
      ]);
      
      if (projekteData.length === 0) {
        navigate(createPageUrl("Projekte"));
        return;
      }
      
      const p = projekteData[0];
      setProjekt(p);
      setWarenLogs(logsData);

      if (p.anfrage_id) {
        const anfrageData = await base44.entities.Anfrage.filter({ id: p.anfrage_id });
        if (anfrageData.length > 0) setAnfrage(anfrageData[0]);
      }

      if (p.kunde_id) {
        const kundenData = await base44.entities.Kunde.filter({ id: p.kunde_id });
        if (kundenData.length > 0) setKunde(kundenData[0]);
      }
      
      if (p.projektleiter_id) {
        const benutzerData = await base44.entities.Benutzer.filter({ id: p.projektleiter_id });
        if (benutzerData.length > 0) setProjektleiter(benutzerData[0]);
      }

      // Load team members
      const benutzerList = await base44.entities.Benutzer.list();
      setAllBenutzer(benutzerList);
      const gruppenleiterList = benutzerList.filter(b => (p.gruppenleiter_ids || []).includes(b.id));
      const workerList = benutzerList.filter(b => (p.worker_ids || []).includes(b.id));
      setTeam({ gruppenleiter: gruppenleiterList, workers: workerList });

      // Load subunternehmer
      if (p.subunternehmer_ids && p.subunternehmer_ids.length > 0) {
        const allSubs = await base44.entities.Subunternehmer.list();
        const subsList = allSubs.filter(s => p.subunternehmer_ids.includes(s.id));
        setSubunternehmerList(subsList);
      }

      // Load category names
      if (p.kategorie || p.unterkategorie || p.zusatzfelder?.unter_unterkategorie) {
        const allKategorien = await base44.entities.Kategorie.list();

        if (p.kategorie) {
          const kat = allKategorien.find(k => k.id === p.kategorie);
          if (kat) setKategorieName(kat.name);
        }

        if (p.unterkategorie) {
          const unterkat = allKategorien.find(k => k.id === p.unterkategorie);
          if (unterkat) setUnterkategorieName(unterkat.name);
        }

        if (p.zusatzfelder?.unter_unterkategorie) {
          const unterUnterkat = allKategorien.find(k => k.id === p.zusatzfelder.unter_unterkategorie);
          if (unterUnterkat) setUnterUnterKategorieName(unterUnterkat.name);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!projekt) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 font-medium">{projekt.projekt_nummer}</span>
              <Badge className={statusColors[projekt.status]}>{projekt.status}</Badge>
              {projekt.prioritaet && (
                <Badge className={prioritaetColors[projekt.prioritaet]}>{projekt.prioritaet}</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{projekt.name}</h1>
          </div>
        </div>
        <Link to={createPageUrl(`ProjektBearbeiten?id=${projekt.id}`)}>
          <Button variant="outline">
            <Pencil className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
        </Link>
        </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="etappen">Etappen</TabsTrigger>
          <TabsTrigger value="material">Material ({warenLogs.length})</TabsTrigger>
          <TabsTrigger value="dokumente">Dokumente</TabsTrigger>
          <TabsTrigger value="diskussion">Diskussion</TabsTrigger>
          <TabsTrigger value="bericht">Bericht</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          {projekt.foto && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <img src={projekt.foto} alt={projekt.name} className="w-full h-64 object-cover" />
            </Card>
          )}

          {projekt.fotos && projekt.fotos.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Weitere Fotos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {projekt.fotos.map((foto, idx) => (
                    <img
                      key={idx}
                      src={foto}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(foto, '_blank')}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Info */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Projektinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projekt.beschreibung && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Beschreibung</p>
                    <p className="text-slate-700">{projekt.beschreibung}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Zeitraum</p>
                      <p className="text-sm font-medium text-slate-700">
                        {projekt.startdatum 
                          ? format(new Date(projekt.startdatum), "dd.MM.yyyy", { locale: de })
                          : "Nicht festgelegt"}
                        {projekt.enddatum && (
                          <> - {format(new Date(projekt.enddatum), "dd.MM.yyyy", { locale: de })}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {projekt.budget && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Euro className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Budget</p>
                        <p className="text-sm font-medium text-slate-700">
                          {projekt.budget.toLocaleString("de-DE")} €
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(kategorieName || unterkategorieName || unterUnterKategorieName) && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg col-span-2 lg:col-span-1">
                      <Package className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Kategorien</p>
                        {kategorieName && (
                          <p className="text-sm font-medium text-slate-700">{kategorieName}</p>
                        )}
                        {unterkategorieName && (
                          <p className="text-xs text-slate-600 mt-0.5">↳ {unterkategorieName}</p>
                        )}
                        {unterUnterKategorieName && (
                          <p className="text-xs text-slate-500 mt-0.5">  ↳ {unterUnterKategorieName}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {projekt.zusatzfelder && Object.keys(projekt.zusatzfelder).length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg col-span-2 lg:col-span-1">
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-2">Antworten</p>
                        <div className="space-y-1">
                          {Object.entries(projekt.zusatzfelder).map(([key, value]) => {
                            if (key === 'unter_unterkategorie') return null;
                            const label = key
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, char => char.toUpperCase());
                            return (
                              <p key={key} className="text-xs text-slate-700">
                                <span className="font-medium">{label}:</span> {String(value)}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {projekt.adresse && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Adresse</p>
                        <p className="text-sm font-medium text-slate-700">{projekt.adresse}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Anfrage */}
              {anfrage && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Anfrage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="font-medium text-slate-800">{anfrage.kunde_name}</p>
                      <p className="text-sm text-slate-500">{anfrage.kunde_email}</p>
                      {anfrage.created_date && (
                        <p className="text-xs text-slate-400 mt-1">
                          {format(new Date(anfrage.created_date), "dd.MM.yyyy", { locale: de })}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Kunde */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Kunde
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {kunde ? (
                    <div>
                      <p className="font-medium text-slate-800">{kunde.firma}</p>
                      {kunde.ansprechpartner && (
                        <p className="text-sm text-slate-500">{kunde.ansprechpartner}</p>
                      )}
                      {kunde.telefon && (
                        <p className="text-sm text-slate-500">{kunde.telefon}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400">Kein Kunde zugeordnet</p>
                  )}
                </CardContent>
              </Card>

              {/* Projektleiter */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Projektleiter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projektleiter ? (
                    <div>
                      <p className="font-medium text-slate-800">
                        {projektleiter.vorname} {projektleiter.nachname}
                      </p>
                      {projektleiter.telefon && (
                        <p className="text-sm text-slate-500">{projektleiter.telefon}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400">Nicht zugewiesen</p>
                  )}
                </CardContent>
              </Card>

              {/* Team */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {team.gruppenleiter.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Gruppenleiter</p>
                      <div className="space-y-1">
                        {team.gruppenleiter.map(gl => (
                          <p key={gl.id} className="text-sm text-slate-700">
                            {gl.vorname} {gl.nachname}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {team.workers.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Arbeiter</p>
                      <div className="space-y-1">
                        {team.workers.map(w => (
                          <p key={w.id} className="text-sm text-slate-700">
                            {w.vorname} {w.nachname}
                            {w.spezialisierung && (
                              <span className="text-slate-400 ml-1">({w.spezialisierung})</span>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {team.gruppenleiter.length === 0 && team.workers.length === 0 && (
                    <p className="text-slate-400 text-sm">Kein Team zugewiesen</p>
                  )}
                </CardContent>
              </Card>

              {/* Subunternehmer */}
              {subunternehmerList.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-500 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Subunternehmer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {subunternehmerList.map(sub => (
                      <div key={sub.id} className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-sm font-medium text-slate-700">{sub.firma}</p>
                        {sub.spezialisierung && (
                          <p className="text-xs text-slate-500">{sub.spezialisierung}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="etappen">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <EtappenManager projektId={projekt.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="material">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Verwendetes Material</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {warenLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Noch kein Material für dieses Projekt erfasst</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artikel</TableHead>
                      <TableHead>Aktion</TableHead>
                      <TableHead>Menge</TableHead>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Datum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warenLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.ware_name}</TableCell>
                        <TableCell>
                          <Badge variant={log.aktion === "Entnahme" ? "destructive" : "default"}>
                            {log.aktion}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.menge}</TableCell>
                        <TableCell>{log.benutzer_name}</TableCell>
                        <TableCell>
                          {log.datum 
                            ? format(new Date(log.datum), "dd.MM.yyyy HH:mm", { locale: de })
                            : format(new Date(log.created_date), "dd.MM.yyyy HH:mm", { locale: de })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="dokumente">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <DokumentManager projektId={projekt.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diskussion">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <CommentThread 
                    entitaetTyp="Projekt" 
                    entitaetId={projekt.id}
                    allBenutzer={allBenutzer}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bericht">
              <ProjectReport projekt={projekt} />
            </TabsContent>
            </Tabs>
            </div>
            );
            }
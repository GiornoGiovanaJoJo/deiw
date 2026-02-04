import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, User, Package, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function LagerBenutzer() {
  const [benutzer, setBenutzer] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBenutzer, setSelectedBenutzer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [benutzerData, logsData] = await Promise.all([
        base44.entities.Benutzer.filter({ status: "Aktiv" }),
        base44.entities.WarenLog.list("-created_date", 1000)
      ]);
      setBenutzer(benutzerData);
      setLogs(logsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getBenutzerStats = (benutzerId) => {
    const userLogs = logs.filter(l => l.benutzer_id === benutzerId);
    const entnahmen = userLogs.filter(l => l.aktion === "Entnahme");
    const rueckgaben = userLogs.filter(l => l.aktion === "Rückgabe");
    
    // Calculate currently held items (entnahmen - rückgaben per item)
    const itemBalance = {};
    userLogs.forEach(log => {
      const key = log.ware_id;
      if (!itemBalance[key]) {
        itemBalance[key] = { name: log.ware_name, count: 0 };
      }
      if (log.aktion === "Entnahme") {
        itemBalance[key].count += log.menge;
      } else if (log.aktion === "Rückgabe") {
        itemBalance[key].count -= log.menge;
      }
    });

    const currentItems = Object.values(itemBalance).filter(item => item.count > 0);

    return {
      totalEntnahmen: entnahmen.length,
      totalRueckgaben: rueckgaben.length,
      currentItems,
      recentLogs: userLogs.slice(0, 10)
    };
  };

  const openUserDetails = (user) => {
    setSelectedBenutzer(user);
    setDialogOpen(true);
  };

  const filteredBenutzer = benutzer.filter(b =>
    `${b.vorname} ${b.nachname}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lager-Benutzer</h1>
        <p className="text-slate-500 mt-1">Mitarbeiter und deren ausgeliehene Materialien</p>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Benutzer suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* User Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredBenutzer.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center text-slate-400">
            Keine Benutzer gefunden
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBenutzer.map((user) => {
            const stats = getBenutzerStats(user.id);
            const hasItems = stats.currentItems.length > 0;

            return (
              <Card 
                key={user.id} 
                className={`border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${hasItems ? "ring-2 ring-amber-200" : ""}`}
                onClick={() => openUserDetails(user)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasItems ? "bg-amber-100" : "bg-slate-100"}`}>
                        <User className={`w-6 h-6 ${hasItems ? "text-amber-600" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {user.vorname} {user.nachname}
                        </p>
                        <p className="text-sm text-slate-500">{user.position}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Entnahmen</p>
                      <p className="text-lg font-semibold text-slate-800">{stats.totalEntnahmen}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rückgaben</p>
                      <p className="text-lg font-semibold text-slate-800">{stats.totalRueckgaben}</p>
                    </div>
                  </div>

                  {hasItems && (
                    <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                      <p className="text-xs text-amber-700 font-medium">
                        {stats.currentItems.length} Artikel ausgeliehen
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Benutzer Details</DialogTitle>
          </DialogHeader>
          {selectedBenutzer && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-800">
                    {selectedBenutzer.vorname} {selectedBenutzer.nachname}
                  </p>
                  <p className="text-slate-500">{selectedBenutzer.position}</p>
                  {selectedBenutzer.spezialisierung && (
                    <Badge variant="outline" className="mt-1">
                      {selectedBenutzer.spezialisierung}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Currently Held Items */}
              {(() => {
                const stats = getBenutzerStats(selectedBenutzer.id);
                return (
                  <>
                    {stats.currentItems.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Aktuell ausgeliehene Artikel
                        </h3>
                        <div className="space-y-2">
                          {stats.currentItems.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                              <span className="font-medium text-slate-800">{item.name}</span>
                              <Badge className="bg-amber-100 text-amber-700">
                                {item.count} Stk
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Activity */}
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Letzte Aktivitäten</h3>
                      {stats.recentLogs.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">Keine Aktivitäten</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Datum</TableHead>
                              <TableHead>Artikel</TableHead>
                              <TableHead>Aktion</TableHead>
                              <TableHead>Menge</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats.recentLogs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="text-sm">
                                  {format(new Date(log.created_date), "dd.MM.yy HH:mm", { locale: de })}
                                </TableCell>
                                <TableCell>{log.ware_name}</TableCell>
                                <TableCell>
                                  <Badge variant={log.aktion === "Entnahme" ? "destructive" : "default"}>
                                    {log.aktion}
                                  </Badge>
                                </TableCell>
                                <TableCell>{log.menge}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
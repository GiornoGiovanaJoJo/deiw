import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import CategorySelector from "@/components/CategorySelector";

export default function AnfrageForm() {
  const [schritt, setSchritt] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kategorien, setKategorien] = useState([]);
  const [categoryPath, setCategoryPath] = useState([]);
  const [antworten, setAntworten] = useState({});
  const [kundenInfo, setKundenInfo] = useState({
    kunde_name: "",
    kunde_email: "",
    kunde_telefon: "",
    kunde_adresse: ""
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadKategorien();
  }, []);

  const loadKategorien = async () => {
    try {
      const data = await base44.entities.Kategorie.filter({ typ: "Projekt" });
      setKategorien(data);
    } catch (error) {
      toast.error("Fehler beim Laden der Kategorien");
    } finally {
      setLoading(false);
    }
  };

  const getChildKategorien = (parentId) => {
    if (!parentId) return kategorien.filter(k => !k.parent_id);
    return kategorien.filter(k => k.parent_id === parentId);
  };

  const getCurrentCategory = () => {
    return categoryPath[categoryPath.length - 1] || null;
  };

  const getNextKategorien = () => {
    const current = getCurrentCategory();
    return getChildKategorien(current?.id);
  };

  const getCurrentFragen = () => {
    const current = getCurrentCategory();
    if (!current || !current.zusatzfelder) return [];
    return current.zusatzfelder;
  };

  const handleKundenInfoChange = (e) => {
    const { name, value } = e.target;
    setKundenInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAntwortChange = (frageId, wert) => {
    setAntworten(prev => ({ ...prev, [frageId]: wert }));
  };

  const validateCurrentFragen = () => {
    const fragen = getCurrentFragen();
    for (let frage of fragen) {
      if (frage.erforderlich && !antworten[frage.name]) {
        toast.error(`Bitte beantworten Sie: ${frage.label}`);
        return false;
      }
    }
    return true;
  };

  const validateKundenInfo = () => {
    const { kunde_name, kunde_email, kunde_telefon, kunde_adresse } = kundenInfo;
    if (!kunde_name || !kunde_email || !kunde_telefon || !kunde_adresse) {
      toast.error("Bitte füllen Sie alle Felder aus");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateKundenInfo()) return;

    setSubmitting(true);
    try {
      const lastCategory = getCurrentCategory();
      await base44.entities.Anfrage.create({
        ...kundenInfo,
        kategorie: categoryPath[0]?.name || "",
        unterkategorie: lastCategory?.name || "",
        antworten,
        status: "Neu"
      });

      toast.success("Anfrage erfolgreich eingereicht!");
      setSubmitted(true);

      setTimeout(() => {
        setSchritt(1);
        setCategoryPath([]);
        setKundenInfo({
          kunde_name: "",
          kunde_email: "",
          kunde_telefon: "",
          kunde_adresse: ""
        });
        setAntworten({});
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      toast.error("Fehler beim Einreichen der Anfrage");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Vielen Dank!</h2>
            <p className="text-slate-600">Ihre Anfrage wurde erfolgreich eingereicht. Wir melden uns bald bei Ihnen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Schritt {schritt} von 3</span>
            <span className="text-sm text-slate-500">{Math.round((schritt / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(schritt / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Schritt 1: Kategorie */}
        {schritt === 1 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-slate-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Wählen Sie Ihre Kategorie
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
               <div className="space-y-6">
                 {categoryPath.length === 0 ? (
                   <CategorySelector
                     kategorien={getChildKategorien(null)}
                     onSelect={(kat) => setCategoryPath([kat])}
                   />
                 ) : (
                   <div className="space-y-6">
                     <div className="flex gap-2 flex-wrap">
                       {categoryPath.map((cat, idx) => (
                         <div key={cat.id} className="flex items-center gap-2">
                           <button
                             onClick={() => setCategoryPath(categoryPath.slice(0, idx + 1))}
                             className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                           >
                             {cat.name}
                           </button>
                           {idx < categoryPath.length - 1 && <span className="text-slate-400">/</span>}
                         </div>
                       ))}
                     </div>

                     {getCurrentFragen().length > 0 && (
                       <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                         <h3 className="font-semibold text-slate-700">Fragen zu {getCurrentCategory()?.name}</h3>
                         {getCurrentFragen().map(frage => (
                           <div key={frage.name} className="space-y-2">
                             <Label>{frage.label} {frage.erforderlich && <span className="text-red-500">*</span>}</Label>
                             {frage.type === "text" && (
                               <Input
                                 value={antworten[frage.name] || ""}
                                 onChange={(e) => setAntworten({...antworten, [frage.name]: e.target.value})}
                                 placeholder={frage.label}
                               />
                             )}
                             {frage.type === "textarea" && (
                               <Textarea
                                 value={antworten[frage.name] || ""}
                                 onChange={(e) => setAntworten({...antworten, [frage.name]: e.target.value})}
                                 placeholder={frage.label}
                                 rows={3}
                               />
                             )}
                             {frage.type === "number" && (
                               <Input
                                 type="number"
                                 value={antworten[frage.name] || ""}
                                 onChange={(e) => setAntworten({...antworten, [frage.name]: e.target.value})}
                                 placeholder={frage.label}
                               />
                             )}
                             {frage.type === "select" && (
                               <Select value={antworten[frage.name] || ""} onValueChange={(value) => setAntworten({...antworten, [frage.name]: value})}>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Wählen..." />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {frage.options?.map(opt => (
                                     <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             )}
                             {frage.type === "radio" && (
                               <RadioGroup value={antworten[frage.name] || ""} onValueChange={(value) => setAntworten({...antworten, [frage.name]: value})}>
                                 {frage.options?.map(opt => (
                                   <div key={opt} className="flex items-center space-x-2">
                                     <RadioGroupItem value={opt} id={`${frage.name}-${opt}`} />
                                     <Label htmlFor={`${frage.name}-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                                   </div>
                                 ))}
                               </RadioGroup>
                             )}
                           </div>
                         ))}
                       </div>
                     )}

                     {getNextKategorien().length > 0 && (
                       <div className="space-y-3">
                         <Label className="text-sm font-semibold">Weitere Kategorien</Label>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                           {getNextKategorien().map(sub => (
                             <button
                               key={sub.id}
                               onClick={() => setCategoryPath([...categoryPath, sub])}
                               className="p-3 rounded-lg border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 text-sm font-medium"
                             >
                               {sub.name}
                             </button>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 )}
               </div>
              )}

              <div className="flex justify-between gap-3 mt-8 pt-6 border-t">
                {categoryPath.length > 1 && (
                  <Button variant="outline" onClick={() => setCategoryPath(categoryPath.slice(0, -1))}>
                    Zurück
                  </Button>
                )}
                <div className="ml-auto">
                  <Button
                    onClick={() => {
                      if (validateCurrentFragen()) {
                        setSchritt(2);
                      }
                    }}
                    disabled={categoryPath.length === 0 || getNextKategorien().length > 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {getNextKategorien().length === 0 ? "Zu Kontaktangaben" : "Vorgesetzt"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Schritt 2: Kundendaten */}
        {schritt === 2 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-slate-50">
              <CardTitle>Ihre Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kunde_name">Name *</Label>
                  <Input
                    id="kunde_name"
                    name="kunde_name"
                    value={kundenInfo.kunde_name}
                    onChange={handleKundenInfoChange}
                    placeholder="Ihr Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kunde_email">Email *</Label>
                  <Input
                    id="kunde_email"
                    name="kunde_email"
                    type="email"
                    value={kundenInfo.kunde_email}
                    onChange={handleKundenInfoChange}
                    placeholder="ihre@email.de"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kunde_telefon">Telefon *</Label>
                  <Input
                    id="kunde_telefon"
                    name="kunde_telefon"
                    value={kundenInfo.kunde_telefon}
                    onChange={handleKundenInfoChange}
                    placeholder="+49 XXX XXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kunde_adresse">Adresse des Projekts *</Label>
                  <Input
                    id="kunde_adresse"
                    name="kunde_adresse"
                    value={kundenInfo.kunde_adresse}
                    onChange={handleKundenInfoChange}
                    placeholder="Straße, Hausnummer, Ort"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={() => setSchritt(1)}>
                  Zurück
                </Button>
                <Button
                  onClick={() => {
                    if (validateKundenInfo()) {
                      setSchritt(3);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Weiter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schritt 3: Bestätigung */}
        {schritt === 3 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-slate-50">
              <CardTitle>Bestätigung</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-3">Zusammenfassung</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600">Kategorie:</span>
                        <span className="font-medium text-slate-800">{categoryPath.map(c => c.name).join(" / ")}</span>
                      </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-medium text-slate-800">{kundenInfo.kunde_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-8 pt-6 border-t">
                <Button variant="outline" onClick={() => setSchritt(2)}>
                  Zurück
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? "Wird eingereicht..." : "Anfrage einreichen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
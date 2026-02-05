import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, User, Lock } from "lucide-react";
import { toast } from "sonner";

export default function BenutzerLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    passwort: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const sessionData = localStorage.getItem("benutzer_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          navigate(createPageUrl("Dashboard"));
        }
      }
    } catch (error) {
      // Not logged in
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.passwort) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }

    setLoading(true);
    try {
      const benutzerList = await base44.entities.Benutzer.filter({ 
        email: form.email,
        status: "Aktiv"
      });

      if (benutzerList.length === 0) {
        toast.error("Benutzer nicht gefunden oder inaktiv");
        setLoading(false);
        return;
      }

      const benutzer = benutzerList[0];
      
      if (benutzer.passwort !== form.passwort) {
        toast.error("Falsches Passwort");
        setLoading(false);
        return;
      }

      // Store session
      localStorage.setItem("benutzer_session", JSON.stringify({
        id: benutzer.id,
        email: form.email,
        position: benutzer.position,
        name: `${benutzer.vorname} ${benutzer.nachname}`,
        timestamp: Date.now()
      }));

      toast.success(`Willkommen, ${benutzer.vorname}!`);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      toast.error("Fehler beim Login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Admin Panel Login
          </CardTitle>
          <p className="text-slate-500">Melden Sie sich mit Ihren Zugangsdaten an</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="E-Mail eingeben"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwort">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="passwort"
                  type="password"
                  placeholder="Passwort eingeben"
                  value={form.passwort}
                  onChange={(e) => setForm({ ...form, passwort: e.target.value })}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 h-11"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Anmeldung läuft...
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Anmelden
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, User, Lock } from "lucide-react";
import { toast } from "sonner";

export default function BenutzerLogin() {
  const { login, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    passwort: ""
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.passwort) {
      toast.error("Bitte alle Felder ausfüllen");
      return;
    }

    setLoading(true);
    // Use proper login from AuthContext
    const user = await login(form.email, form.passwort);
    setLoading(false);

    if (user) {
      toast.success(`Willkommen zurück!`);
      // Conditional redirection for admin/dashboard access
      const dashboardRoles = ["Admin", "Projektleiter", "Gruppenleiter", "Worker", "Büro", "Warehouse"];
      if (user.is_superuser || (user.position && dashboardRoles.includes(user.position))) {
        navigate(createPageUrl("Dashboard"));
      } else {
        navigate(createPageUrl("Profile"));
      }
    } else {
      toast.error("Falsche E-Mail oder Passwort");
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
                  type="text"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-10"
                  disabled={loading || isLoadingAuth}
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
                  disabled={loading || isLoadingAuth}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-11"
              disabled={loading || isLoadingAuth}
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
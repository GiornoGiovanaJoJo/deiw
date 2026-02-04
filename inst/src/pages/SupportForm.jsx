import React, { useState } from "react";
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
import { MessageSquare, Mail, Phone, FileText } from "lucide-react";
import { toast } from "sonner";

export default function SupportForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    absender_name: "",
    absender_email: "",
    absender_telefon: "",
    betreff: "",
    nachricht: "",
    kategorie: "Anfrage",
    prioritaet: "Mittel"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.absender_name || !formData.absender_email || !formData.betreff || !formData.nachricht) {
      toast.error("Bitte füllen Sie alle erforderlichen Felder aus");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.Ticket.create({
        absender_name: formData.absender_name,
        absender_email: formData.absender_email,
        absender_telefon: formData.absender_telefon || null,
        betreff: formData.betreff,
        nachricht: formData.nachricht,
        kategorie: formData.kategorie,
        prioritaet: formData.prioritaet,
        status: "Neu"
      });
      
      toast.success("Ticket erfolgreich eingereicht!");
      setSubmitted(true);
      
      setTimeout(() => {
        setFormData({
          absender_name: "",
          absender_email: "",
          absender_telefon: "",
          betreff: "",
          nachricht: "",
          kategorie: "Anfrage",
          prioritaet: "Mittel"
        });
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      toast.error("Fehler beim Einreichen des Tickets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Kontaktieren Sie uns</h1>
          <p className="text-slate-500">Wir helfen Ihnen gerne weiter</p>
        </div>

        {submitted ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Vielen Dank!</h2>
                <p className="text-slate-600">Ihr Ticket wurde erfolgreich eingereicht. Wir werden uns so schnell wie möglich bei Ihnen melden.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-slate-50">
              <CardTitle className="text-lg">Neues Ticket erstellen</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 text-sm">Ihre Angaben</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="absender_name" className="text-sm">
                      Name *
                    </Label>
                    <Input
                      id="absender_name"
                      name="absender_name"
                      value={formData.absender_name}
                      onChange={handleChange}
                      placeholder="Ihr Name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="absender_email" className="text-sm">
                        <Mail className="w-4 h-4 inline mr-1" />
                        E-Mail *
                      </Label>
                      <Input
                        id="absender_email"
                        name="absender_email"
                        type="email"
                        value={formData.absender_email}
                        onChange={handleChange}
                        placeholder="ihre@email.de"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="absender_telefon" className="text-sm">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Telefon
                      </Label>
                      <Input
                        id="absender_telefon"
                        name="absender_telefon"
                        value={formData.absender_telefon}
                        onChange={handleChange}
                        placeholder="+49 XXX XXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="space-y-4 border-t pt-5">
                  <h3 className="font-semibold text-slate-700 text-sm">Ticket-Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="betreff" className="text-sm">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Betreff *
                    </Label>
                    <Input
                      id="betreff"
                      name="betreff"
                      value={formData.betreff}
                      onChange={handleChange}
                      placeholder="Worum geht es?"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kategorie" className="text-sm">
                        Kategorie
                      </Label>
                      <Select value={formData.kategorie} onValueChange={(value) => handleSelectChange("kategorie", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Anfrage">Anfrage</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Beschwerde">Beschwerde</SelectItem>
                          <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prioritaet" className="text-sm">
                        Priorität
                      </Label>
                      <Select value={formData.prioritaet} onValueChange={(value) => handleSelectChange("prioritaet", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Niedrig">Niedrig</SelectItem>
                          <SelectItem value="Mittel">Mittel</SelectItem>
                          <SelectItem value="Hoch">Hoch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nachricht" className="text-sm">
                      Nachricht *
                    </Label>
                    <Textarea
                      id="nachricht"
                      name="nachricht"
                      value={formData.nachricht}
                      onChange={handleChange}
                      placeholder="Beschreiben Sie Ihr Anliegen..."
                      rows={6}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Wird eingereicht..." : "Ticket einreichen"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
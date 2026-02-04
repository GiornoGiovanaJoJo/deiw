import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreateProjectMinimal({ open, onOpenChange, anfrage }) {
    const [loading, setLoading] = useState(false);
    const [projectName, setProjectName] = useState(anfrage ? `Projekt für ${anfrage.kunde_name}` : "");

    const handleCreate = async () => {
        try {
            setLoading(true);
            // Basic project creation
            await base44.entities.Projekt.create({
                name: projectName,
                kunde_name: anfrage.kunde_name,
                description: `Erstellt aus Anfrage #${anfrage.id}`,
                status: "Geplant",
                kategorie_name: anfrage.kategorie
            });
            toast.success("Projekt erfolgreich erstellt");
            onOpenChange(false);
        } catch (error) {
            toast.error("Fehler beim Erstellen des Projekts");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Projekt erstellen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Projektname</Label>
                        <Input
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Name des Projekts"
                        />
                    </div>
                    <div className="text-sm text-slate-500">
                        Das Projekt wird für Kunde <strong>{anfrage?.kunde_name}</strong> erstellt.
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleCreate} disabled={loading} className="bg-blue-600">
                        {loading ? "Erstelle..." : "Erstellen"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

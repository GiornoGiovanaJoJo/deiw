import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { toast } from "sonner";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      toast.success("App erfolgreich installiert");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      toast.success("App wird installiert...");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
              EP-System installieren
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Installieren Sie die App für schnelleren Zugriff und Offline-Funktionalität
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrompt(false)}
              className="h-8"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-700 h-8 gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Installieren</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
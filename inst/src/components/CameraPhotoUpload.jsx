import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function CameraPhotoUpload({ onPhotoCapture, disabled = false }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [preview, setPreview] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setPreview(base64);
        onPhotoCapture?.(base64, file);
        toast.success("Foto erfolgreich aufgenommen");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Fehler beim Verarbeiten des Fotos");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleGallerySelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || loading}
          onClick={() => cameraInputRef.current?.click()}
          className="gap-2"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Kamera</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || loading}
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Galerie</span>
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPreview(null)}
            className="text-red-600 hover:text-red-700 gap-2"
          >
            <X className="w-4 h-4" />
            Löschen
          </Button>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
        disabled={disabled || loading}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleGallerySelect}
        className="hidden"
        disabled={disabled || loading}
      />

      {/* Preview */}
      {preview && (
        <div className="relative w-full max-w-xs rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src={preview} alt="Preview" className="w-full h-auto" />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      )}
    </div>
  );
}
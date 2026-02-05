import React from "react";
import { 
  Zap, Droplet, Hammer, Wrench, Paintbrush, Lightbulb, Home, Layers, 
  Settings, Cpu, Box, Key, Gauge, Building2 
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  "Zap": Zap,
  "Droplet": Droplet,
  "Hammer": Hammer,
  "Wrench": Wrench,
  "Paintbrush": Paintbrush,
  "Lightbulb": Lightbulb,
  "Home": Home,
  "Layers": Layers,
  "Settings": Settings,
  "Cpu": Cpu,
  "Box": Box,
  "Key": Key,
  "Gauge": Gauge,
  "Building2": Building2
};

export default function CategorySelector({ kategorien, selected, onSelect }) {
  const getIcon = (iconName) => {
    return ICON_MAP[iconName] || Wrench;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {kategorien.map(kat => {
        const Icon = getIcon(kat.icon_name);
        const isSelected = selected?.id === kat.id;
        
        return (
          <button
            key={kat.id}
            onClick={() => onSelect(kat)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 overflow-hidden",
              isSelected
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
            )}
          >
            {kat.bild ? (
              <img src={kat.bild} alt={kat.name} className="w-full h-24 object-cover rounded-lg" />
            ) : (
              <div className={cn(
                "p-3 rounded-lg transition-colors",
                isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
              )}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <span className={cn(
              "text-sm font-semibold text-center",
              isSelected ? "text-blue-700" : "text-slate-700"
            )}>
              {kat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
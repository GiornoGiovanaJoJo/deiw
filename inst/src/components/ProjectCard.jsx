import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';

export default function ProjectCard({ project }) {
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
            {/* Image Placeholder - Grey */}
            <div className="h-64 bg-slate-400 relative overflow-hidden">
                {project.foto ? (
                    <img
                        src={project.foto}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">
                        {project.name}
                    </div>
                )}

                {/* Overlay Title just in case image is dark, or just stylistic choice from screenshot? 
            Screenshot shows title BELOW image, inside body. 
            Image area has text "Solar panels" centered in screenshot... maybe it's a placeholder text if no image? */}
                {!project.foto && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{project.name}</span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{project.name}</h3>

                <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">
                    {project.beschreibung || "Keine Beschreibung verfügbar."}
                </p>

                <div className="mt-auto space-y-4">
                    <button className="text-[#7C3AED] font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        Подробнее <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            {/* Use standard text for address as per screenshot "Hastedter Heerstraße 63" */}
                            <span>{project.adresse || "Adresse nicht angegeben"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

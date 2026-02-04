import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ProjectCard({ project }) {
    return (
        <article className="project-card h-full flex flex-col group">
            {/* Image */}
            <div className="project-card__img relative overflow-hidden h-64">
                {project.foto ? (
                    <img
                        src={project.foto}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/70 font-medium">
                        {project.name}
                    </div>
                )}

                {!project.foto && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{project.name}</span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="project-card__body flex-1 flex flex-col">
                <h3 className="project-card__title">{project.name}</h3>

                <p className="project-card__desc flex-1 line-clamp-3">
                    {project.beschreibung || "Keine Beschreibung verfügbar."}
                </p>

                <div className="mt-auto space-y-4">
                    <button className="project-card__link">
                        Подробнее <ArrowRight className="w-4 h-4 ml-1" />
                    </button>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <span className="truncate">{project.adresse || "Adresse nicht angegeben"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

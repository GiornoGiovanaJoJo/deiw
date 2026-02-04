import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ServiceCard({ category }) {
    // Parse description if it's a list (bullet points)
    const features = category.description
        ? category.description.split('\n').filter(line => line.trim().length > 0)
        : [];

    return (
        <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Header - Purple */}
            <div className="bg-[#A78BFA] p-8 flex items-center justify-center min-h-[160px]">
                <h3 className="text-white text-xl font-medium text-center">
                    {category.name}
                </h3>
            </div>

            {/* Body - Light Purple/Blue */}
            <div className="bg-[#F5F3FF] p-8 flex-1">
                <h4 className="font-bold text-slate-800 text-lg mb-6">{category.name}</h4>

                {features.length > 0 ? (
                    <ul className="space-y-3">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                                <span className="text-[#A78BFA] mt-1">•</span>
                                <span>{feature.replace(/^[•-]\s*/, '')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-sm">Keine Details verfügbar</p>
                )}
            </div>
        </div>
    );
}

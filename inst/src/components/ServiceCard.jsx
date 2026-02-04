import React from 'react';

export default function ServiceCard({ category }) {
    // Parse description if it's a list (bullet points)
    const features = category.description
        ? category.description.split('\n').filter(line => line.trim().length > 0)
        : [];

    return (
        <article className="service-card h-full flex flex-col">
            <div className="service-card__img min-h-[160px]">
                <h3 className="text-white text-xl font-medium text-center px-4">
                    {category.name}
                </h3>
            </div>

            <div className="service-card__body flex-1 bg-slate-50">
                <h4 className="service-card__title">{category.name}</h4>

                {features.length > 0 ? (
                    <ul className="service-card__list space-y-2">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                                <span>{feature.replace(/^[•-]\s*/, '')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-sm">Keine Details verfügbar</p>
                )}
            </div>
        </article>
    );
}

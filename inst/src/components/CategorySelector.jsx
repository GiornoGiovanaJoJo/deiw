import React from "react";
import { Folder } from "lucide-react";

export default function CategorySelector({ kategorien, onSelect }) {
    if (!kategorien || kategorien.length === 0) {
        return <div className="text-center text-slate-500 py-4">Keine Kategorien verfügbar</div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {kategorien.map((kat) => (
                <button
                    key={kat.id}
                    onClick={() => onSelect(kat)}
                    className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                        <Folder className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-blue-700 text-center">
                        {kat.name}
                    </span>
                </button>
            ))}
        </div>
    );
}

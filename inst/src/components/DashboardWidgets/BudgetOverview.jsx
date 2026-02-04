import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, TrendingUp } from "lucide-react";

export default function BudgetOverview({ projekte }) {
  const calculateBudgetStats = () => {
    const withBudget = projekte.filter((p) => p.budget && p.budget > 0);
    const totalBudget = withBudget.reduce((sum, p) => sum + p.budget, 0);
    
    // Simulate actual spend based on status
    const totalActual = withBudget.reduce((sum, p) => {
      const statusMultiplier = {
        "Geplant": 0,
        "In Bearbeitung": 0.5,
        "Abgeschlossen": 0.9,
        "Pausiert": 0.3,
        "Storniert": 0,
      };
      return sum + p.budget * (statusMultiplier[p.status] || 0);
    }, 0);

    return {
      totalBudget,
      totalActual,
      remaining: totalBudget - totalActual,
      utilization: totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0,
    };
  };

  const stats = calculateBudgetStats();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Euro className="w-5 h-5 text-purple-600" />
          Budget-Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.totalBudget > 0 ? (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Budgetauslastung</p>
                <p className="text-sm font-semibold text-slate-800">
                  {stats.utilization.toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.utilization, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Gesamtbudget</p>
                <p className="text-lg font-bold text-blue-600">
                  {(stats.totalBudget / 1000).toFixed(0)}k €
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Verbrauchtes Budget</p>
                <p className="text-lg font-bold text-amber-600">
                  {(stats.totalActual / 1000).toFixed(0)}k €
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg col-span-2">
                <p className="text-xs text-slate-600 mb-1">Verbleibendes Budget</p>
                <p className="text-lg font-bold text-emerald-600">
                  {(stats.remaining / 1000).toFixed(0)}k €
                </p>
              </div>
            </div>

            {stats.utilization > 85 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-700">
                  ⚠️ Budget zu {stats.utilization.toFixed(0)}% ausgelastet
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Euro className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>Keine Projekte mit Budget</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
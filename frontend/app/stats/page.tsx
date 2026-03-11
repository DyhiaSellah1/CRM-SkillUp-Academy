"use client";

import { useEffect, useState } from "react";
import { getStatsDetails } from "../lib/api";

type StatusStat = {
  status: string;
  total: string;
  amount: string;
};

type SourceStat = {
  source: string;
  total: string;
};

type StageStat = {
  label: string;
  total: string;
  amount: string;
};

type StatsDetails = {
  byStatus: StatusStat[];
  bySource: SourceStat[];
  byStage: StageStat[];
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatsDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStatsDetails()
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Chargement des statistiques...</div>;
  }

  return (
    <div className="p-6 bg-slate-100 min-h-screen space-y-6">
      <div>
        <p className="text-slate-500 text-sm">Analyse commerciale</p>
        <h1 className="text-4xl font-bold text-slate-900">Statistiques</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Leads par statut</h2>
          <div className="space-y-3">
            {stats?.byStatus.map((item) => (
              <div key={item.status} className="border-b pb-2">
                <p className="font-medium">{item.status}</p>
                <p className="text-sm text-slate-600">Total : {item.total}</p>
                <p className="text-sm text-slate-600">Montant : {item.amount} €</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Leads par source</h2>
          <div className="space-y-3">
            {stats?.bySource.map((item) => (
              <div key={item.source} className="border-b pb-2">
                <p className="font-medium">{item.source || "Non renseignée"}</p>
                <p className="text-sm text-slate-600">Total : {item.total}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Pipeline par étape</h2>
          <div className="space-y-3">
            {stats?.byStage.map((item) => (
              <div key={item.label} className="border-b pb-2">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-slate-600">Total : {item.total}</p>
                <p className="text-sm text-slate-600">Montant : {item.amount} €</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
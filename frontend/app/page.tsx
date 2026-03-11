"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "./lib/api";

type DashboardStats = {
  leads: number;
  revenue: number;
  contacts: number;
  tasks: number;
  converted: number;
  lost: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Chargement du dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-slate-100 min-h-screen">
      <div>
        <p className="text-slate-500 text-sm">Tableau de bord CRM</p>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">Nombre de leads</p>
          <h2 className="text-3xl font-bold mt-2">{stats?.leads ?? 0}</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">Montant total du pipeline</p>
          <h2 className="text-3xl font-bold mt-2">{stats?.revenue ?? 0} €</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">Contacts</p>
          <h2 className="text-3xl font-bold mt-2">{stats?.contacts ?? 0}</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">Tâches</p>
          <h2 className="text-3xl font-bold mt-2">{stats?.tasks ?? 0}</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">Leads convertis</p>
          <h2 className="text-3xl font-bold mt-2">{stats?.converted ?? 0}</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">Leads perdus</p>
          <h2 className="text-3xl font-bold mt-2">{stats?.lost ?? 0}</h2>
        </div>
      </div>
    </div>
  );
}
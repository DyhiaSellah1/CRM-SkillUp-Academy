"use client";

import { useEffect, useState } from "react";
import { getPipelineBoard } from "../lib/api";

type Lead = {
  id: number;
  title: string;
  amount: number;
  status: string;
  source: string;
  first_name: string;
  last_name: string;
};

type Stage = {
  id: number;
  label: string;
  order_index: number;
  leads: Lead[];
};

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPipelineBoard()
      .then((data) => setStages(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Chargement du pipeline...</div>;
  }

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="mb-6">
        <p className="text-slate-500 text-sm">Suivi du pipeline commercial</p>
        <h1 className="text-4xl font-bold text-slate-900">Pipeline</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">{stage.label}</h2>
              <span className="text-sm bg-slate-100 px-2 py-1 rounded-full">
                {stage.leads.length}
              </span>
            </div>

            <div className="space-y-3">
              {stage.leads.length === 0 ? (
                <div className="text-sm text-slate-400 border border-dashed rounded-xl p-4">
                  Aucun lead
                </div>
              ) : (
                stage.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                  >
                    <h3 className="font-semibold text-slate-900">{lead.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{lead.amount} €</p>
                    <p className="text-sm text-slate-600">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <p className="text-sm text-slate-500">{lead.source || "—"}</p>
                    <p className="text-sm text-slate-500">Statut : {lead.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
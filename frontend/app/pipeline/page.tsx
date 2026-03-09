"use client";

import { useEffect, useState } from "react";

export default function PipelinePage() {
  const [stages, setStages] = useState<any[]>([]);
  const [form, setForm] = useState({
    label: "",
    order_index: "",
  });

  async function loadStages() {
    try {
      const res = await fetch("http://localhost:3001/api/pipeline-stages");

      if (!res.ok) {
        console.error("Erreur HTTP /api/pipeline-stages :", res.status);
        setStages([]);
        return;
      }

      const data = await res.json();
      setStages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement pipeline :", error);
      setStages([]);
    }
  }

  useEffect(() => {
    loadStages();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/pipeline-stages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: form.label,
          order_index: Number(form.order_index),
        }),
      });

      if (!res.ok) {
        console.error("Erreur création étape pipeline :", res.status);
        return;
      }

      setForm({
        label: "",
        order_index: "",
      });

      loadStages();
    } catch (error) {
      console.error("Erreur soumission pipeline :", error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Configuration commerciale</p>
        <h1 className="text-3xl font-bold">Pipeline</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid gap-4 md:grid-cols-2"
      >
        <input
          type="text"
          placeholder="Nom de l'étape"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <input
          type="number"
          placeholder="Ordre"
          value={form.order_index}
          onChange={(e) => setForm({ ...form, order_index: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <button className="md:col-span-2 bg-blue-600 text-white rounded-xl px-4 py-3 font-semibold">
          Ajouter une étape
        </button>
      </form>

      <div className="grid gap-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold">{stage.label}</h3>
              <p className="text-slate-500">Ordre : {stage.order_index}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
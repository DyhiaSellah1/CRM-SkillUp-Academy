"use client";

import { useEffect, useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [form, setForm] = useState({
    lead_id: "",
    title: "",
    due_date: "",
  });

  async function loadData() {
    const [tasksRes, leadsRes] = await Promise.all([
      fetch("http://localhost:3001/api/tasks"),
      fetch("http://localhost:3001/api/leads"),
    ]);

    const tasksData = await tasksRes.json();
    const leadsData = await leadsRes.json();

    setTasks(Array.isArray(tasksData) ? tasksData : []);
    setLeads(Array.isArray(leadsData) ? leadsData : []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("http://localhost:3001/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lead_id: Number(form.lead_id),
        title: form.title,
        due_date: form.due_date,
      }),
    });

    setForm({
      lead_id: "",
      title: "",
      due_date: "",
    });

    loadData();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Planification des actions</p>
        <h1 className="text-3xl font-bold">Tâches</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid gap-4 md:grid-cols-3"
      >
        <select
          value={form.lead_id}
          onChange={(e) => setForm({ ...form, lead_id: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        >
          <option value="">Choisir un lead</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Titre de la tâche"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <input
          type="datetime-local"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <button className="md:col-span-3 bg-purple-600 text-white rounded-xl px-4 py-3 font-semibold">
          Ajouter une tâche
        </button>
      </form>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <h3 className="font-bold">{task.title}</h3>
            <p className="mt-2">Lead : {task.lead_title || task.lead_id}</p>
            <p>Échéance : {task.due_date || "—"}</p>
            <p>Statut : {task.is_completed ? "Terminée" : "En attente"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
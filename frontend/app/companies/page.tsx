"use client";

import { useEffect, useState } from "react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    city: "",
  });

  async function loadCompanies() {
    const res = await fetch("http://localhost:3001/api/companies");
    const data = await res.json();
    setCompanies(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("http://localhost:3001/api/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({ name: "", industry: "", city: "" });
    loadCompanies();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Gestion des entreprises partenaires</p>
        <h1 className="text-3xl font-bold">Entreprises</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid gap-4 md:grid-cols-3"
      >
        <input
          type="text"
          placeholder="Nom entreprise"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />
        <input
          type="text"
          placeholder="Secteur"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />
        <input
          type="text"
          placeholder="Ville"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <button className="md:col-span-3 bg-slate-900 text-white rounded-xl px-4 py-3 font-semibold">
          Ajouter une entreprise
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <h3 className="text-lg font-bold">{company.name}</h3>
            <p className="text-slate-600 mt-2">Secteur : {company.industry || "—"}</p>
            <p className="text-slate-600">Ville : {company.city || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
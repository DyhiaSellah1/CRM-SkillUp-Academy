"use client";

import { useEffect, useState } from "react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    contact_id: "",
    status: "nouveau",
    source: "",
  });

  async function loadData() {
    try {
      const [leadsRes, contactsRes] = await Promise.all([
        fetch("http://localhost:3001/api/leads"),
        fetch("http://localhost:3001/api/contacts"),
      ]);

      const leadsData = await leadsRes.json();
      const contactsData = await contactsRes.json();

      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setContacts(Array.isArray(contactsData) ? contactsData : []);
    } catch (error) {
      console.error("Erreur chargement leads/contacts :", error);
      setLeads([]);
      setContacts([]);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          contact_id: Number(form.contact_id),
        }),
      });

      if (!res.ok) {
        console.error("Erreur création lead :", res.status);
        return;
      }

      setForm({
        title: "",
        amount: "",
        contact_id: "",
        status: "nouveau",
        source: "",
      });

      loadData();
    } catch (error) {
      console.error("Erreur soumission lead :", error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Gestion du pipeline commercial</p>
        <h1 className="text-3xl font-bold">Leads</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid gap-4 md:grid-cols-2"
      >
        <input
          type="text"
          placeholder="Titre du lead"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <input
          type="number"
          placeholder="Montant"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <select
          value={form.contact_id}
          onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        >
          <option value="">Choisir un contact</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.first_name} {contact.last_name}
            </option>
          ))}
        </select>

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        >
          <option value="nouveau">Nouveau</option>
          <option value="en cours">En cours</option>
          <option value="converti">Converti</option>
          <option value="perdu">Perdu</option>
        </select>

        <input
          type="text"
          placeholder="Source"
          value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
          className="border border-slate-200 rounded-xl p-3 md:col-span-2"
        />

        <button className="md:col-span-2 bg-orange-500 text-white rounded-xl px-4 py-3 font-semibold">
          Ajouter un lead
        </button>
      </form>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <h3 className="font-bold text-lg">{lead.title}</h3>
            <p className="mt-2">Montant : {lead.amount} €</p>
            <p>Statut : {lead.status}</p>
            <p>Source : {lead.source || "—"}</p>
            <p>
              Contact : {lead.first_name ? `${lead.first_name} ${lead.last_name}` : "—"}
            </p>
            {lead.stage_label && (
              <p>Étape : {lead.stage_label}</p>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
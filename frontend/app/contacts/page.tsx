"use client";

import { useEffect, useState } from "react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  async function loadContacts() {
    const res = await fetch("http://localhost:3001/api/contacts");
    const data = await res.json();
    setContacts(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadContacts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("http://localhost:3001/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({ first_name: "", last_name: "", email: "" });
    loadContacts();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Gestion de la relation client</p>
        <h1 className="text-3xl font-bold">Contacts</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid gap-4 md:grid-cols-3"
      >
        <input
          type="text"
          placeholder="Prénom"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />
        <input
          type="text"
          placeholder="Nom"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <button className="md:col-span-3 bg-blue-600 text-white rounded-xl px-4 py-3 font-semibold">
          Ajouter un contact
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">Prénom</th>
              <th className="text-left p-4">Nom</th>
              <th className="text-left p-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t border-slate-100">
                <td className="p-4">{contact.first_name}</td>
                <td className="p-4">{contact.last_name}</td>
                <td className="p-4">{contact.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
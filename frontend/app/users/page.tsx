"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user",
  });

  async function loadUsers() {
    try {
      const res = await fetch("http://localhost:3001/api/users");

      if (!res.ok) {
        console.error("Erreur HTTP /api/users :", res.status);
        setUsers([]);
        return;
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement utilisateurs :", error);
      setUsers([]);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        console.error("Erreur création utilisateur :", res.status);
        return;
      }

      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "user",
      });

      loadUsers();
    } catch (error) {
      console.error("Erreur soumission utilisateur :", error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Administration</p>
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid gap-4 md:grid-cols-2"
      >
        <input
          type="text"
          placeholder="Nom complet"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <input
          type="text"
          placeholder="Mot de passe"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border border-slate-200 rounded-xl p-3"
        >
          <option value="user">User</option>
          <option value="commercial">Commercial</option>
          <option value="admin">Admin</option>
        </select>

        <button className="md:col-span-2 bg-slate-900 text-white rounded-xl px-4 py-3 font-semibold">
          Ajouter un utilisateur
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">Nom</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="p-4">{user.full_name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
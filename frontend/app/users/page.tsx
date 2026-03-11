"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

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
    const role = localStorage.getItem("crm_role");

    if (role === "admin") {
      setAuthorized(true);
    }

    setLoadingAuth(false);
  }, []);

  useEffect(() => {
    if (authorized) {
      loadUsers();
    }
  }, [authorized]);

  async function updateRole(userId: number, newRole: string) {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        console.error("Erreur mise à jour rôle :", res.status);
        return;
      }

      loadUsers();
    } catch (error) {
      console.error("Erreur update role :", error);
    }
  }

  if (loadingAuth) {
    return <p className="p-8">Vérification des droits...</p>;
  }

  if (!authorized) {
    return <p className="p-8">Accès refusé</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Paramètres / Administration</p>
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">Nom</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Rôle actuel</th>
              <th className="text-left p-4">Changer le rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="p-4">{user.full_name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className="border border-slate-200 rounded-xl p-2"
                  >
                    <option value="user">User</option>
                    <option value="commercial">Commercial</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
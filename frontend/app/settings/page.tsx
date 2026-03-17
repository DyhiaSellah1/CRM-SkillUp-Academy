"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MoreVertical,
  Search,
  Shield,
  Briefcase,
  User,
  Settings2,
} from "lucide-react";

type UserItem = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "commercial" | "user";
  created_at?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date?: string) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function roleLabel(role: string) {
  if (role === "admin") return "Administrateur";
  if (role === "commercial") return "Commercial";
  return "Utilisateur";
}

function roleBadgeClass(role: string) {
  if (role === "admin") {
    return "bg-violet-100 text-violet-700";
  }
  if (role === "commercial") {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-slate-100 text-slate-700";
}

function avatarClass(role: string) {
  if (role === "admin") return "bg-violet-500";
  if (role === "commercial") return "bg-emerald-500";
  return "bg-cyan-500";
}

export default function SettingsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const isMainAdmin = currentUser?.email === "sellahdyhia@gmail.com";

useEffect(() => {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) return;

  try {
    const parsedUser = JSON.parse(savedUser);
    setCurrentUser(parsedUser);
  } catch (error) {
    console.error("Erreur lecture currentUser :", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
}, []);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users");
      const data = await res.json();

      const usersData = Array.isArray(data) ? data : data.users;

      if (usersData) {
        setUsers(usersData);
        setFilteredUsers(usersData);
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs :", error);
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, []);

  useEffect(() => {
    let result = [...users];

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (user) =>
          user.full_name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [search, roleFilter, users]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const commercials = users.filter((u) => u.role === "commercial").length;
    const standardUsers = users.filter((u) => u.role === "user").length;

    return { total, admins, commercials, standardUsers };
  }, [users]);

  const handleRoleChange = async (
    userId: number,
    newRole: "user" | "commercial"
  ) => {
    if (!currentUser) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: newRole,
            requesterEmail: currentUser.email,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Erreur lors de la modification");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      setMessage("Rôle mis à jour avec succès");
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
      setMessage("Erreur serveur");
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Paramètres</h1>
          <p className="mt-2 text-slate-500">
            Gérez les comptes utilisateurs et les accès
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Total utilisateurs</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Settings2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Administrateurs</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.admins}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Shield size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Commerciaux</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.commercials}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Briefcase size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Utilisateurs</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.standardUsers}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <User size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="commercial">Commercial</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-left">
                <tr className="text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">Utilisateur</th>
                  <th className="px-6 py-4 font-medium">Rôle</th>
                  <th className="px-6 py-4 font-medium">Membre depuis</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const isProtectedAdmin =
                    user.email === "sellahdyhia@gmail.com";

                  return (
                    <tr
                      key={user.id}
                      className="border-t border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarClass(
                              user.role
                            )}`}
                          >
                            {getInitials(user.full_name)}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass(
                            user.role
                          )}`}
                        >
                          {roleLabel(user.role)}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="relative px-6 py-5 text-right">
                        {isProtectedAdmin ? (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            Admin principal
                          </span>
                        ) : isMainAdmin ? (
                          <div className="relative inline-block" ref={menuRef}>
                            <button
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === user.id ? null : user.id
                                )
                              }
                              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openMenuId === user.id && (
                              <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                                <button
                                  onClick={() =>
                                    handleRoleChange(user.id, "commercial")
                                  }
                                  className="flex w-full items-center px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                                >
                                  Mettre en commercial
                                </button>
                                <button
                                  onClick={() => handleRoleChange(user.id, "user")}
                                  className="flex w-full items-center px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                                >
                                  Mettre en user
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
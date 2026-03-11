"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  CheckSquare,
  Shield,
  BarChart3,
  Settings,
  LogIn,
  UserPlus,
  LogOut,
  UserCircle2,
} from "lucide-react";

const allLinks = {
  user: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
  ],
  commercial: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/companies", label: "Entreprises", icon: Building2 },
    { href: "/leads", label: "Leads", icon: Target },
    { href: "/tasks", label: "Tâches", icon: CheckSquare },
  ],
  admin: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/companies", label: "Entreprises", icon: Building2 },
    { href: "/leads", label: "Leads", icon: Target },
    { href: "/tasks", label: "Tâches", icon: CheckSquare },
    { href: "/stats", label: "Statistiques", icon: BarChart3 },
    { href: "/users", label: "Utilisateurs", icon: Shield },
    { href: "/pipeline", label: "Pipeline", icon: Settings },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    const savedRole = localStorage.getItem("crm_role");
    const savedUser = localStorage.getItem("crm_user");

    if (savedRole) setCurrentRole(savedRole);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  function handleLogout() {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    localStorage.removeItem("crm_role");
    window.location.href = "/login";
  }

  if (!mounted) {
    return (
      <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold">SkillUp CRM</h1>
      </aside>
    );
  }

  const links =
    currentRole && allLinks[currentRole as keyof typeof allLinks]
      ? allLinks[currentRole as keyof typeof allLinks]
      : [];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6 flex flex-col">
      <div className="mb-10">
        <p className="text-sm text-slate-400">Plateforme CRM</p>
        <h1 className="text-2xl font-bold mt-1">SkillUp CRM</h1>

        {currentUser ? (
          <div className="mt-4 bg-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <UserCircle2 size={18} />
              <span className="font-medium">{currentUser.full_name}</span>
            </div>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
            <p className="text-xs text-slate-300">
              Rôle : <span className="font-semibold">{currentRole}</span>
            </p>
          </div>
        ) : (
          <div className="mt-4 bg-slate-800 rounded-2xl p-4 space-y-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-3 font-medium"
            >
              <LogIn size={18} />
              Se connecter
            </Link>

            <Link
              href="/register"
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 rounded-xl px-4 py-3 font-medium"
            >
              <UserPlus size={18} />
              S’inscrire
            </Link>
          </div>
        )}
      </div>

      {currentUser && (
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <div className="mt-auto">
        {currentUser ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white rounded-xl px-4 py-3 font-medium"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        ) : (
          <div className="rounded-2xl bg-slate-800 p-4 text-sm text-slate-300">
            Connecte-toi pour accéder aux fonctionnalités du CRM selon ton rôle.
          </div>
        )}
      </div>
    </aside>
  );
}
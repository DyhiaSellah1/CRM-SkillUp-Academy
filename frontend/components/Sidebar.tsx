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
  const [currentRole, setCurrentRole] = useState("admin");

  useEffect(() => {
    const savedRole = localStorage.getItem("crm_role");
    if (savedRole) {
      setCurrentRole(savedRole);
    } else {
      localStorage.setItem("crm_role", "admin");
    }
  }, []);

  const links = allLinks[currentRole as keyof typeof allLinks] || allLinks.user;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6 flex flex-col">
      <div className="mb-10">
        <p className="text-sm text-slate-400">Plateforme CRM</p>
        <h1 className="text-2xl font-bold mt-1">SkillUp CRM</h1>
        <p className="text-xs text-slate-400 mt-2">Rôle : {currentRole}</p>
      </div>

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

      <div className="mt-6 bg-slate-800 rounded-2xl p-4">
        <p className="text-xs text-slate-400 mb-2">Changer de rôle (test)</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              localStorage.setItem("crm_role", "user");
              window.location.reload();
            }}
            className="bg-slate-700 rounded-xl px-3 py-2 text-sm hover:bg-slate-600"
          >
            User
          </button>
          <button
            onClick={() => {
              localStorage.setItem("crm_role", "commercial");
              window.location.reload();
            }}
            className="bg-slate-700 rounded-xl px-3 py-2 text-sm hover:bg-slate-600"
          >
            Commercial
          </button>
          <button
            onClick={() => {
              localStorage.setItem("crm_role", "admin");
              window.location.reload();
            }}
            className="bg-slate-700 rounded-xl px-3 py-2 text-sm hover:bg-slate-600"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="mt-auto rounded-2xl bg-slate-800 p-4 text-sm text-slate-300">
        Gestion de la relation client, leads, tâches et performance commerciale.
      </div>
    </aside>
  );
}
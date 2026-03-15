"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  CheckSquare,
  GitBranch,
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

type UserType = {
  full_name?: string;
  role?: string;
};

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Entreprises", href: "/companies", icon: Building2 },
  { label: "Leads", href: "/leads", icon: Target },
  { label: "Tâches", href: "/tasks", icon: CheckSquare },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserType>({});

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erreur lecture user :", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const initials =
    mounted && user?.full_name
      ? user.full_name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "U";

  return (
<aside className="flex min-h-screen w-[300px] shrink-0 flex-col justify-between self-stretch bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.15),transparent_25%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,#0f172a_0%,#172554_100%)] px-5 py-6 text-white">      <div>
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-lg">
              <span className="text-lg">🧩</span>
            </div>
            <span className="text-[20px] font-bold">CRM Pro</span>
          </div>

          <button className="text-slate-300">
            <ChevronLeft size={22} />
          </button>
        </div>

        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-[16px] font-medium transition ${
                  active
                    ? "bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <Icon size={22} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <div className="space-y-3">
          <Link
            href="/settings"
            className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-[16px] font-medium transition ${
              pathname === "/settings"// "/parametres"
                ? "bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
                : "text-slate-200 hover:bg-white/10"
            }`}
          >
            <Settings size={22} />
            <span>Paramètres</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-[16px] font-medium text-slate-200 transition hover:bg-white/10"
          >
            <LogOut size={22} />
            <span>Déconnexion</span>
          </button>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-lg font-bold text-white">
              {initials}
            </div>

            <div>
              <p className="text-lg font-semibold">
                {mounted ? user?.full_name || "Utilisateur" : "Utilisateur"}
              </p>
              <p className="text-sm capitalize text-slate-300">
                {mounted ? user?.role || "user" : "user"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
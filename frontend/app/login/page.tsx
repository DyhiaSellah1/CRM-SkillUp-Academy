"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShowcase from "../components/AuthShowcase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erreur de connexion");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    router.push("/dashboard");

  } catch (error) {
    console.error(error);
    alert("Erreur serveur");
  }
};

  return (
    <main className="min-h-screen bg-[#f5f7fb] p-2 sm:p-4 lg:p-6">
      <div className="mx-auto grid min-h-[96vh] w-full max-w-7xl overflow-hidden rounded-[24px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-2">

        <AuthShowcase />

        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-bold text-slate-900">
              Bon retour !
            </h2>

            <p className="mt-3 text-slate-500">
              Connectez-vous pour accéder à votre tableau de bord
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700"
              >
                Se connecter
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="font-semibold text-emerald-600"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Le nom complet est obligatoire");
      return;
    }

    if (!email.trim()) {
      alert("L'email est obligatoire");
      return;
    }

    if (!password.trim()) {
      alert("Le mot de passe est obligatoire");
      return;
    }

    if (!confirmPassword.trim()) {
      alert("La confirmation du mot de passe est obligatoire");
      return;
    }

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    try {
        console.log({
          full_name: fullName,
          email: email,
          password: password,
        });
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de l'inscription");
        return;
      }

      alert("Compte créé avec succès. Vous pouvez maintenant vous connecter.");
      router.push("/login");
    } catch (error) {
      console.error("Erreur inscription :", error);
      alert("Erreur serveur");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md space-y-4"
      >
        <h1 className="text-3xl font-bold">Créer un compte</h1>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nom complet</label>
          <input
            type="text"
            placeholder="Ex : Jean Duc"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="Ex : jeanduc@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Mot de passe</label>
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-blue-500 transition"
        >
          S’inscrire
        </button>
      </form>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShowcase from "../components/AuthShowcase";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    full_name: fullName,
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Erreur serveur");
                return;
            }

            alert("Compte créé avec succès !");
            window.location.href = "/login";
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
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                            Créer un compte
                        </h2>

                        <p className="mt-3 text-sm text-slate-500 sm:text-base">
                            Remplissez les informations pour commencer
                        </p>

                        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Nom complet
                                </label>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-emerald-500 focus-within:bg-white">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.8}
                                        stroke="currentColor"
                                        className="h-5 w-5 text-slate-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                        />
                                    </svg>

                                    <input
                                        type="text"
                                        placeholder="Jean Dupont"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Adresse email
                                </label>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-emerald-500 focus-within:bg-white">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.8}
                                        stroke="currentColor"
                                        className="h-5 w-5 text-slate-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 9.659A2.25 2.25 0 0 1 2.25 7.743V7.5"
                                        />
                                    </svg>

                                    <input
                                        type="email"
                                        placeholder="jean@exemple.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Mot de passe
                                </label>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-emerald-500 focus-within:bg-white">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.8}
                                        stroke="currentColor"
                                        className="h-5 w-5 text-slate-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-1.5 0h12a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4.5 19.5V12a1.5 1.5 0 0 1 1.5-1.5Z"
                                        />
                                    </svg>

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 transition hover:text-slate-600"
                                        aria-label="Afficher le mot de passe"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.8}
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1 1 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1 1 0 0 1 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Confirmation du mot de passe
                                </label>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-emerald-500 focus-within:bg-white">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.8}
                                        stroke="currentColor"
                                        className="h-5 w-5 text-slate-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-1.5 0h12a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4.5 19.5V12a1.5 1.5 0 0 1 1.5-1.5Z"
                                        />
                                    </svg>

                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-slate-400 transition hover:text-slate-600"
                                        aria-label="Afficher la confirmation du mot de passe"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.8}
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1 1 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1 1 0 0 1 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.28)] transition hover:bg-emerald-700"
                            >
                                Créer mon compte
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Déjà un compte ?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-emerald-600 hover:text-emerald-700"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
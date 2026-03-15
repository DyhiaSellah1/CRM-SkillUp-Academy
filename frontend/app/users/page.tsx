"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.role === "admin") {
      setAuthorized(true);
    } else {
      router.push("/dashboard");
    }

    setLoadingAuth(false);
  }, [router]);

  if (loadingAuth) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900">Utilisateurs</h1>
      <p className="mt-2 text-slate-500">
        Gestion des utilisateurs du CRM
      </p>
    </div>
  );
}
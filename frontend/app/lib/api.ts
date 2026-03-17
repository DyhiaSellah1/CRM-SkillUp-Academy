//const API_BASE = "http://localhost:3001/api";
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erreur récupération dashboard");
  }

  return res.json();
}

export async function getStatsDetails() {
  const res = await fetch(`${API_BASE}/stats/details`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erreur récupération statistiques détaillées");
  }

  return res.json();
}

export async function getPipelineBoard() {
  const res = await fetch(`${API_BASE}/pipeline-board`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erreur récupération pipeline");
  }

  return res.json();
}
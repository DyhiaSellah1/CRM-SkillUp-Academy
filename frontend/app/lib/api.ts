const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchData(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Erreur API : ${res.status}`);
  }

  return res.json();
}

export async function postData(endpoint: string, body: any) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Erreur API : ${res.status}`);
  }

  return res.json();
}
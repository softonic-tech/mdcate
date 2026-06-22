const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function getLandingStats() {
  const res = await fetch(`${API_BASE}/public/landing`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to load landing stats");
  return res.json();
}

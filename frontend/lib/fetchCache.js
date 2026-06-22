const memory = new Map();
const STORAGE_PREFIX = "mp-cache:";

export function getCached(key) {
  if (memory.has(key)) return memory.get(key);

  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed.expires <= Date.now()) {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return null;
    }

    memory.set(key, parsed.data);
    return parsed.data;
  } catch {
    return null;
  }
}

export function setCached(key, data, ttlMs = 5 * 60 * 1000) {
  memory.set(key, data);

  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify({ data, expires: Date.now() + ttlMs })
    );
  } catch {
    // sessionStorage full or unavailable
  }
}

export async function fetchJsonCached(url, { key, ttlMs = 5 * 60 * 1000 } = {}) {
  const cacheKey = key || url;
  const cached = getCached(cacheKey);
  if (cached != null) return cached;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  const json = await response.json();
  const data = json?.data ?? json;
  setCached(cacheKey, data, ttlMs);
  return data;
}

"use client";

import { useEffect, useState } from "react";
import { getCached, setCached } from "@/lib/fetchCache";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Stale-while-revalidate fetch: shows cached data instantly, refreshes in background.
 */
export function useCachedFetch(path, { cacheKey, ttlMs = 5 * 60 * 1000 } = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const key = cacheKey || path;

  const [data, setData] = useState(() => getCached(key));
  const [loading, setLoading] = useState(() => getCached(key) == null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const cached = getCached(key);

    if (cached != null) {
      setData(cached);
      setLoading(false);
    }

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((res) => {
        if (cancelled) return;
        const next = res?.data ?? res;
        setCached(key, next, ttlMs);
        setData(next);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        if (cached == null) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, key, ttlMs]);

  return { data, loading, error };
}

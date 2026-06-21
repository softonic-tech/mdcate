"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import toast from "react-hot-toast";

/**
 * useApi — DRY hook for API calls
 * Handles loading, error states, and toast notifications
 * Prevents state updates on unmounted components
 */
export function useApi(apiFn, options = {}) {
  const { onSuccess, onError, successMsg, showError = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        if (!mountedRef.current) return null;
        setData(result);
        if (successMsg) toast.success(successMsg);
        onSuccess?.(result);
        return result;
      } catch (err) {
        if (!mountedRef.current) return null;
        const message = err?.message || "Something went wrong.";
        setError(message);
        if (showError) toast.error(message);
        onError?.(err);
        return null;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [apiFn, onSuccess, onError, successMsg, showError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  intervalMs = 4000,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  const ctrlRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const run = useCallback(async (signal: AbortSignal) => {
    try {
      const result = await fetcherRef.current(signal);
      if (!signal.aborted) {
        setData(result);
        setError("");
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
      setError((e as Error)?.message ?? "Gagal memuat");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    run(ctrl.signal);
    const id = setInterval(() => {
      if (ctrl.signal.aborted) return;
      run(ctrl.signal);
    }, intervalMs);
    return () => {
      clearInterval(id);
      ctrl.abort();
    };
  }, [run, intervalMs]);

  const refresh = useCallback(() => {
    const ctrl = ctrlRef.current;
    if (ctrl && !ctrl.signal.aborted) run(ctrl.signal);
  }, [run]);

  return { data, error, loading, refresh };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StockQuote } from "@/lib/types";
import { POLL_INTERVAL_MS } from "@/lib/constants";

export function useStockQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const symbolsKey = symbols.join(",");
  const mountedRef = useRef(true);

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) {
      setQuotes({});
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbolsKey)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load quotes");
      }

      if (!mountedRef.current) return;

      const map: Record<string, StockQuote> = {};
      for (const quote of data.quotes as StockQuote[]) {
        map[quote.symbol] = quote;
      }
      setQuotes(map);
      setError(null);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load quotes");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [symbols.length, symbolsKey]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    void fetchQuotes();

    const interval = setInterval(() => {
      void fetchQuotes();
    }, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchQuotes]);

  const updateQuote = useCallback(
    (
      quoteOrUpdater:
        | StockQuote
        | ((prev: Record<string, StockQuote>) => Record<string, StockQuote>),
    ) => {
      if (typeof quoteOrUpdater === "function") {
        setQuotes(quoteOrUpdater);
      } else {
        setQuotes((prev) => ({ ...prev, [quoteOrUpdater.symbol]: quoteOrUpdater }));
      }
    },
    [],
  );

  return { quotes, loading, error, refetch: fetchQuotes, updateQuote };
}

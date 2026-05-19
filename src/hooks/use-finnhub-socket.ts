"use client";

import { useEffect, useRef } from "react";
import type { FinnhubTrade, StockQuote } from "@/lib/types";
import { FINNHUB_WS_URL } from "@/lib/constants";

interface UseFinnhubSocketOptions {
  symbols: string[];
  enabled?: boolean;
  onTrade: (symbol: string, price: number, timestamp: number) => void;
}

export function useFinnhubSocket({
  symbols,
  enabled = true,
  onTrade,
}: UseFinnhubSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onTradeRef = useRef(onTrade);
  onTradeRef.current = onTrade;
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!enabled || !apiKey || symbols.length === 0) return;

    const ws = new WebSocket(`${FINNHUB_WS_URL}?token=${apiKey}`);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      for (const symbol of symbols) {
        ws.send(JSON.stringify({ type: "subscribe", symbol }));
      }
    });

    ws.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data as string) as {
          type: string;
          data?: FinnhubTrade[];
        };
        if (payload.type !== "trade" || !payload.data) return;

        for (const trade of payload.data) {
          onTradeRef.current(trade.s, trade.p, trade.t);
        }
      } catch {
        // ignore malformed messages
      }
    });

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        for (const symbol of symbols) {
          ws.send(JSON.stringify({ type: "unsubscribe", symbol }));
        }
      }
      ws.close();
      wsRef.current = null;
    };
  }, [symbolsKey, enabled, symbols]);
}

export function applyLivePrice(
  quote: StockQuote | undefined,
  symbol: string,
  price: number,
  timestamp: number,
): StockQuote {
  if (!quote) {
    return {
      symbol,
      current: price,
      change: 0,
      percentChange: 0,
      high: price,
      low: price,
      open: price,
      previousClose: price,
      timestamp,
    };
  }

  const change = price - quote.previousClose;
  const percentChange =
    quote.previousClose > 0 ? (change / quote.previousClose) * 100 : 0;

  return {
    ...quote,
    current: price,
    change,
    percentChange,
    high: Math.max(quote.high, price),
    low: quote.low > 0 ? Math.min(quote.low, price) : price,
    timestamp,
  };
}

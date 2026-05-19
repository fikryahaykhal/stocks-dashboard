"use client";

import { useMemo, useState } from "react";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { NewsFeed } from "@/components/dashboard/news-feed";
import {
  WatchlistAddHint,
  WatchlistTable,
} from "@/components/dashboard/watchlist-table";
import {
  applyLivePrice,
  useFinnhubSocket,
} from "@/hooks/use-finnhub-socket";
import { useStockQuotes } from "@/hooks/use-stock-quotes";
import { MARKET_INDICES } from "@/lib/constants";
import { useWatchlistStore } from "@/store/watchlist-store";

export function DashboardClient() {
  const { symbols } = useWatchlistStore();
  const [liveSymbols, setLiveSymbols] = useState<Set<string>>(new Set());

  const allSymbols = useMemo(() => {
    const indexSymbols = MARKET_INDICES.map((i) => i.finnhubSymbol);
    return [...new Set([...indexSymbols, ...symbols])];
  }, [symbols]);

  const { quotes, loading, error, updateQuote } = useStockQuotes(allSymbols);

  useFinnhubSocket({
    symbols: allSymbols,
    onTrade: (symbol, price, timestamp) => {
      setLiveSymbols((prev) => new Set(prev).add(symbol));
      updateQuote((prev) => ({
        ...prev,
        [symbol]: applyLivePrice(prev[symbol], symbol, price, timestamp),
      }));
    },
  });

  const indexQuotes = useMemo(() => {
    const map: Record<string, typeof quotes[string]> = {};
    for (const index of MARKET_INDICES) {
      if (quotes[index.finnhubSymbol]) {
        map[index.finnhubSymbol] = quotes[index.finnhubSymbol];
      }
    }
    return map;
  }, [quotes]);

  return (
    <div className="space-y-8 p-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-loss"
        >
          {error}
          {error.includes("FINNHUB_API_KEY") && (
            <span>
              {" "}
              Copy <code className="text-xs">.env.example</code> to{" "}
              <code className="text-xs">.env.local</code> and add your free key from{" "}
              <a
                href="https://finnhub.io/register"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                finnhub.io
              </a>
              .
            </span>
          )}
        </div>
      )}

      <MarketOverview quotes={indexQuotes} loading={loading} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Your Watchlist
          </h3>
          <span className="text-xs text-muted-foreground">{symbols.length} symbols</span>
        </div>
        <WatchlistTable quotes={quotes} loading={loading} liveSymbols={liveSymbols} />
        <WatchlistAddHint />
      </section>

      <NewsFeed />
    </div>
  );
}

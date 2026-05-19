"use client";

import { useMemo, useState } from "react";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { NewsFeed } from "@/components/dashboard/news-feed";
import { WatchlistTable } from "@/components/dashboard/watchlist-table";
import { SectionHeading } from "@/components/ui/section-heading";
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
    const map: Record<string, (typeof quotes)[string]> = {};
    for (const index of MARKET_INDICES) {
      if (quotes[index.finnhubSymbol]) {
        map[index.finnhubSymbol] = quotes[index.finnhubSymbol];
      }
    }
    return map;
  }, [quotes]);

  return (
    <div className="page-container space-y-8">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-loss/25 bg-loss/10 px-4 py-3 text-sm text-loss"
        >
          {error}
          {error.includes("FINNHUB_API_KEY") && (
            <span>
              {" "}
              Add your key to <code className="text-xs">.env.local</code> — free at{" "}
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

      <section id="watchlist">
        <SectionHeading
          title="Watchlist"
          description={`${symbols.length} ${symbols.length === 1 ? "symbol" : "symbols"}`}
        />
        <WatchlistTable quotes={quotes} loading={loading} liveSymbols={liveSymbols} />
      </section>

      <NewsFeed />
    </div>
  );
}

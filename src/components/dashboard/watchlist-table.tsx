"use client";

import Link from "next/link";
import { ChevronRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PriceChange } from "@/components/ui/price-change";
import { Skeleton } from "@/components/ui/skeleton";
import type { StockQuote } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useWatchlistStore } from "@/store/watchlist-store";

interface WatchlistTableProps {
  quotes: Record<string, StockQuote>;
  loading: boolean;
  liveSymbols?: Set<string>;
}

export function WatchlistTable({ quotes, loading, liveSymbols }: WatchlistTableProps) {
  const { symbols, removeSymbol } = useWatchlistStore();

  if (symbols.length === 0) {
    return (
      <Card className="px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No stocks in your watchlist yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Search above or open a stock to add one.
        </p>
      </Card>
    );
  }

  return (
  <>
      {/* Mobile: card list */}
      <ul className="space-y-2 md:hidden">
        {symbols.map((symbol) => (
          <WatchlistCard
            key={symbol}
            symbol={symbol}
            quote={quotes[symbol]}
            loading={loading}
            isLive={liveSymbols?.has(symbol)}
            onRemove={() => removeSymbol(symbol)}
          />
        ))}
      </ul>

      {/* Desktop: table */}
      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Change</th>
                <th className="px-4 py-3 font-medium text-right">Open</th>
                <th className="px-4 py-3 font-medium text-right">High</th>
                <th className="px-4 py-3 font-medium text-right">Low</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol) => {
                const quote = quotes[symbol];
                const isLive = liveSymbols?.has(symbol);
                return (
                  <tr
                    key={symbol}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/stock/${symbol}`}
                        className="inline-flex items-center gap-2 font-semibold hover:text-primary"
                      >
                        {symbol}
                        {isLive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" />
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {quote ? formatPrice(quote.current) : loading ? "…" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {quote && (
                        <PriceChange
                          change={quote.change}
                          percentChange={quote.percentChange}
                          size="sm"
                          showIcon={false}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {quote ? formatPrice(quote.open) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {quote ? formatPrice(quote.high) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {quote ? formatPrice(quote.low) : "—"}
                    </td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => removeSymbol(symbol)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-loss/10 hover:text-loss"
                        aria-label={`Remove ${symbol}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function WatchlistCard({
  symbol,
  quote,
  loading,
  isLive,
  onRemove,
}: {
  symbol: string;
  quote?: StockQuote;
  loading: boolean;
  isLive?: boolean;
  onRemove: () => void;
}) {
  return (
    <li>
      <Card className="flex items-center gap-2 p-0 overflow-hidden">
        <Link
          href={`/stock/${symbol}`}
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 active:bg-muted/30"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{symbol}</span>
              {isLive && (
                <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" aria-hidden />
              )}
            </div>
            {quote ? (
              <PriceChange
                change={quote.change}
                percentChange={quote.percentChange}
                size="sm"
                showIcon={false}
                className="mt-0.5"
              />
            ) : loading ? (
              <Skeleton className="mt-1 h-3 w-20" />
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {loading && !quote ? (
              <Skeleton className="h-5 w-16" />
            ) : quote ? (
              <p className="text-base font-semibold tabular-nums">{formatPrice(quote.current)}</p>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </div>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          className="touch-target shrink-0 border-l border-border/60 px-3 text-muted-foreground active:bg-loss/10 active:text-loss"
          aria-label={`Remove ${symbol}`}
        >
          <Minus className="h-4 w-4" />
        </button>
      </Card>
    </li>
  );
}

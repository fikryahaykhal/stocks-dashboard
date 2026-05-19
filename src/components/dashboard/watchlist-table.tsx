"use client";

import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PriceChange } from "@/components/ui/price-change";
import { Skeleton } from "@/components/ui/skeleton";
import type { StockQuote } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
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
      <Card className="p-8 text-center text-muted-foreground">
        Your watchlist is empty. Search for a stock to add one.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium text-right">Change</th>
              <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Open</th>
              <th className="px-4 py-3 font-medium text-right hidden md:table-cell">High</th>
              <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Low</th>
              <th className="px-4 py-3 font-medium w-12" />
            </tr>
          </thead>
          <tbody>
            {symbols.map((symbol) => {
              const quote = quotes[symbol];
              const isLive = liveSymbols?.has(symbol);

              return (
                <tr
                  key={symbol}
                  className="border-b border-border/50 transition hover:bg-muted/20 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/stock/${symbol}`}
                      className="flex items-center gap-2 font-semibold hover:text-primary"
                    >
                      {symbol}
                      {isLive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" title="Live" />
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {loading && !quote ? (
                      <Skeleton className="ml-auto h-4 w-16" />
                    ) : quote ? (
                      <span
                        className={cn(
                          "font-medium",
                          quote.change >= 0 ? "text-gain" : "text-loss",
                        )}
                      >
                        {formatPrice(quote.current)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {quote ? (
                      <PriceChange
                        change={quote.change}
                        percentChange={quote.percentChange}
                        size="sm"
                        showIcon={false}
                      />
                    ) : loading ? (
                      <Skeleton className="ml-auto h-4 w-20" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                    {quote ? formatPrice(quote.open) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell text-muted-foreground">
                    {quote ? formatPrice(quote.high) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell text-muted-foreground">
                    {quote ? formatPrice(quote.low) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeSymbol(symbol)}
                      className="rounded p-1 text-muted-foreground hover:bg-loss/10 hover:text-loss"
                      aria-label={`Remove ${symbol} from watchlist`}
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
  );
}

export function WatchlistAddHint() {
  return (
    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
      <Plus className="h-3 w-3" />
      Use the search bar to add symbols to your watchlist from any stock page.
    </p>
  );
}

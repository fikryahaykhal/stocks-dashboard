"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PriceChange } from "@/components/ui/price-change";
import { Skeleton } from "@/components/ui/skeleton";
import { MARKET_INDICES } from "@/lib/constants";
import type { StockQuote } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface MarketOverviewProps {
  quotes: Record<string, StockQuote>;
  loading: boolean;
}

export function MarketOverview({ quotes, loading }: MarketOverviewProps) {
  return (
    <section aria-label="Market indices">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Major Indices (ETF proxies)
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {MARKET_INDICES.map((index) => {
          const quote = quotes[index.finnhubSymbol];
          return (
            <Card key={index.symbol} className="p-4 transition hover:border-primary/30">
              {loading && !quote ? (
                <IndexSkeleton />
              ) : quote ? (
                <Link href={`/stock/${index.finnhubSymbol}`} className="block">
                  <p className="text-xs text-muted-foreground">{index.label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {formatPrice(quote.current)}
                  </p>
                  <div className="mt-2">
                    <PriceChange
                      change={quote.change}
                      percentChange={quote.percentChange}
                      size="sm"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    via {index.finnhubSymbol}
                  </p>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">Unavailable</p>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function IndexSkeleton() {
  return (
    <>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-8 w-28" />
      <Skeleton className="mt-2 h-4 w-24" />
    </>
  );
}

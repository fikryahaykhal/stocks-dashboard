"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PriceChange } from "@/components/ui/price-change";
import { SectionHeading } from "@/components/ui/section-heading";
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
      <SectionHeading title="Markets" description="Major index ETFs" />

      {/* Mobile: horizontal scroll */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory scrollbar-none md:hidden">
        {MARKET_INDICES.map((index) => (
          <IndexCard
            key={index.symbol}
            index={index}
            quote={quotes[index.finnhubSymbol]}
            loading={loading}
            className="w-[9.5rem] shrink-0 snap-start"
          />
        ))}
      </div>

      {/* Tablet+ */}
      <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-4">
        {MARKET_INDICES.map((index) => (
          <IndexCard
            key={index.symbol}
            index={index}
            quote={quotes[index.finnhubSymbol]}
            loading={loading}
          />
        ))}
      </div>
    </section>
  );
}

function IndexCard({
  index,
  quote,
  loading,
  className,
}: {
  index: (typeof MARKET_INDICES)[number];
  quote?: StockQuote;
  loading: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      {loading && !quote ? (
        <div className="p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-7 w-24" />
          <Skeleton className="mt-2 h-4 w-20" />
        </div>
      ) : quote ? (
        <Link href={`/stock/${index.finnhubSymbol}`} className="block p-4 active:bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground">{index.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
            {formatPrice(quote.current)}
          </p>
          <div className="mt-1.5">
            <PriceChange
              change={quote.change}
              percentChange={quote.percentChange}
              size="sm"
              showIcon={false}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">{index.finnhubSymbol}</p>
        </Link>
      ) : (
        <p className="p-4 text-sm text-muted-foreground">Unavailable</p>
      )}
    </Card>
  );
}

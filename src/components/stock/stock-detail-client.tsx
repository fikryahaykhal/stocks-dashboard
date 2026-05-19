"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { StockChart } from "@/components/stock/stock-chart";
import { Card } from "@/components/ui/card";
import { PriceChange } from "@/components/ui/price-change";
import { Skeleton } from "@/components/ui/skeleton";
import {
  applyLivePrice,
  useFinnhubSocket,
} from "@/hooks/use-finnhub-socket";
import type { StockProfile, StockQuote } from "@/lib/types";
import { cn, formatCompactNumber, formatPrice } from "@/lib/utils";
import { useWatchlistStore } from "@/store/watchlist-store";

interface StockDetailClientProps {
  symbol: string;
}

export function StockDetailClient({ symbol }: StockDetailClientProps) {
  const upper = symbol.toUpperCase();
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const { hasSymbol, addSymbol, removeSymbol } = useWatchlistStore();
  const inWatchlist = hasSymbol(upper);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/quote?symbol=${upper}`).then((r) => r.json()),
      fetch(`/api/profile?symbol=${upper}`).then((r) => r.json()),
    ])
      .then(([quoteData, profileData]) => {
        if (quoteData.error) throw new Error(quoteData.error);
        setQuote(quoteData);
        if (!profileData.error) setProfile(profileData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load stock"),
      )
      .finally(() => setLoading(false));
  }, [upper]);

  useFinnhubSocket({
    symbols: [upper],
    onTrade: (sym, price, timestamp) => {
      if (sym !== upper) return;
      setIsLive(true);
      setQuote((prev) => applyLivePrice(prev ?? undefined, sym, price, timestamp));
    },
  });

  function toggleWatchlist() {
    if (inWatchlist) removeSymbol(upper);
    else addSymbol(upper);
  }

  return (
    <div className="page-container space-y-5 pb-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground active:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-loss/25 bg-loss/10 px-4 py-3 text-sm text-loss"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          {profile?.logo ? (
            <Image
              src={profile.logo}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-xl bg-white p-1"
              unoptimized
            />
          ) : (
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{upper}</h1>
              {isLive && (
                <span className="rounded-full bg-gain/12 px-2 py-0.5 text-[10px] font-semibold text-gain">
                  LIVE
                </span>
              )}
            </div>
            {loading ? (
              <Skeleton className="mt-1.5 h-4 w-40" />
            ) : (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {profile?.name ?? upper}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={toggleWatchlist}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 text-sm font-medium active:bg-muted/50 md:w-auto md:px-5"
        >
          {inWatchlist ? (
            <>
              <BookmarkCheck className="h-4 w-4 text-primary" />
              In watchlist
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              Add to watchlist
            </>
          )}
        </button>
      </div>

      <Card className="p-5">
        {loading ? (
          <Skeleton className="h-9 w-36" />
        ) : quote ? (
          <>
            <p className="text-3xl font-bold tabular-nums tracking-tight md:text-4xl">
              {formatPrice(quote.current)}
            </p>
            <div className="mt-2">
              <PriceChange change={quote.change} percentChange={quote.percentChange} size="md" />
            </div>
          </>
        ) : null}
      </Card>

      <Card className="p-3 md:p-4">
        <StockChart symbol={upper} />
      </Card>

      {quote && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          <StatCard label="Open" value={formatPrice(quote.open)} />
          <StatCard label="High" value={formatPrice(quote.high)} />
          <StatCard label="Low" value={formatPrice(quote.low)} />
          <StatCard label="Prev close" value={formatPrice(quote.previousClose)} />
          {profile && profile.marketCap > 0 && (
            <StatCard
              label="Market cap"
              value={formatCompactNumber(profile.marketCap)}
              className="col-span-2 md:col-span-1"
            />
          )}
        </div>
      )}

      {profile?.weburl && (
        <a
          href={profile.weburl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-primary active:bg-muted/30"
        >
          Company website
          <ExternalLink className="h-4 w-4" />
        </a>
      )}

      {profile && (
        <p className="text-center text-xs text-muted-foreground">
          {profile.exchange} · {profile.industry}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <div className="p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-base font-semibold tabular-nums">{value}</p>
      </div>
    </Card>
  );
}

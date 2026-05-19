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
import { formatCompactNumber, formatPrice } from "@/lib/utils";
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
    <div className="space-y-6 p-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {error && (
        <div role="alert" className="rounded-lg border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-loss">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          {profile?.logo ? (
            <Image
              src={profile.logo}
              alt={`${upper} logo`}
              width={56}
              height={56}
              className="rounded-lg bg-white p-1"
              unoptimized
            />
          ) : (
            <Skeleton className="h-14 w-14 rounded-lg" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{upper}</h1>
              {isLive && (
                <span className="rounded-full bg-gain/15 px-2 py-0.5 text-[10px] font-medium text-gain">
                  LIVE
                </span>
              )}
            </div>
            {loading ? (
              <Skeleton className="mt-2 h-5 w-48" />
            ) : (
              <p className="text-muted-foreground">{profile?.name ?? upper}</p>
            )}
            {profile && (
              <p className="mt-1 text-xs text-muted-foreground">
                {profile.exchange} · {profile.industry} · {profile.country}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={toggleWatchlist}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
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

      <Card className="p-6">
        {loading ? (
          <Skeleton className="h-10 w-40" />
        ) : quote ? (
          <>
            <p className="text-4xl font-bold tabular-nums">{formatPrice(quote.current)}</p>
            <div className="mt-2">
              <PriceChange change={quote.change} percentChange={quote.percentChange} size="lg" />
            </div>
          </>
        ) : null}
      </Card>

      <Card className="p-4">
        <StockChart symbol={upper} />
      </Card>

      {quote && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Open" value={formatPrice(quote.open)} />
          <StatCard label="High" value={formatPrice(quote.high)} />
          <StatCard label="Low" value={formatPrice(quote.low)} />
          <StatCard label="Prev Close" value={formatPrice(quote.previousClose)} />
          {profile && (
            <StatCard label="Market Cap" value={formatCompactNumber(profile.marketCap)} />
          )}
          {profile?.weburl && (
            <Card className="flex items-center justify-center p-4 sm:col-span-2">
              <a
                href={profile.weburl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Company website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

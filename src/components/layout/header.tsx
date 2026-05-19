"use client";

import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { BarChart3, Radio } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const isStockPage = pathname.startsWith("/stock/");
  const hasLiveKey = Boolean(process.env.NEXT_PUBLIC_FINNHUB_API_KEY);
  const now = format(new Date(), "MMM d · h:mm a");

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div
        className="page-container !py-3 md:!py-4"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        {/* Mobile top bar */}
        <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                {isStockPage ? "Stock" : "MarketPulse"}
              </p>
              <p className="text-[11px] text-muted-foreground">{now}</p>
            </div>
          </div>
          <LivePill active={hasLiveKey} />
        </div>

        {/* Desktop title row */}
        <div className="hidden md:mb-4 md:block">
          <h1 className="text-xl font-semibold tracking-tight">
            {isStockPage ? "Stock details" : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>

        <SearchBar />
      </div>
    </header>
  );
}

function LivePill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium",
        active ? "bg-gain/12 text-gain" : "bg-muted/60 text-muted-foreground",
      )}
    >
      <Radio className={cn("h-3 w-3", active && "animate-pulse")} />
      {active ? "Live" : "15s"}
    </span>
  );
}

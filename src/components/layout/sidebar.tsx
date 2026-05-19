"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();
  const hasLiveKey = Boolean(process.env.NEXT_PUBLIC_FINNHUB_API_KEY);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">MarketPulse</h1>
          <p className="text-xs text-muted-foreground">Stocks Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
            hasLiveKey ? "bg-gain/10 text-gain" : "bg-muted/50 text-muted-foreground",
          )}
        >
          <Radio className={cn("h-3.5 w-3.5", hasLiveKey && "animate-pulse")} />
          {hasLiveKey ? "Live WebSocket active" : "Polling mode (15s)"}
        </div>
        {!hasLiveKey && (
          <p className="mt-2 px-1 text-[10px] leading-relaxed text-muted-foreground">
            Add NEXT_PUBLIC_FINNHUB_API_KEY to .env.local for real-time ticks.
          </p>
        )}
      </div>
    </aside>
  );
}

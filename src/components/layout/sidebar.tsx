"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [{ href: "/", label: "Dashboard", icon: LayoutDashboard }];

export function Sidebar() {
  const pathname = usePathname();
  const hasLiveKey = Boolean(process.env.NEXT_PUBLIC_FINNHUB_API_KEY);

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar md:flex lg:w-64">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight">MarketPulse</h1>
          <p className="text-xs text-muted-foreground">Stocks</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs",
            hasLiveKey ? "bg-gain/10 text-gain" : "bg-muted/40 text-muted-foreground",
          )}
        >
          <Radio className={cn("h-3.5 w-3.5 shrink-0", hasLiveKey && "animate-pulse")} />
          <span>{hasLiveKey ? "Live data" : "Updates every 15s"}</span>
        </div>
      </div>
    </aside>
  );
}

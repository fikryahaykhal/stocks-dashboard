"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onStock = pathname.startsWith("/stock/");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-card/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch px-2 pt-1">
        <NavItem href="/" label="Home" icon={LayoutDashboard} active={onHome} />
        <NavItem href="/#search" label="Search" icon={Search} active={false} />
        <NavItem
          href={onStock ? "/" : "/#watchlist"}
          label={onStock ? "Markets" : "Watchlist"}
          icon={LineChart}
          active={false}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  className,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "touch-target flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground active:text-foreground",
        className,
      )}
    >
      <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
      {label}
    </Link>
  );
}

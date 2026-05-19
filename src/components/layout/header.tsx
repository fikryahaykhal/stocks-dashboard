"use client";

import { SearchBar } from "@/components/search/search-bar";
import { format } from "date-fns";

export function Header() {
  const now = format(new Date(), "EEEE, MMMM d, yyyy · h:mm a");

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Market Overview</h2>
        <p className="text-sm text-muted-foreground">{now}</p>
      </div>
      <SearchBar />
    </header>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { SearchResult } from "@/lib/types";
export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 350);

  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results ?? []);
        setOpen(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSymbol(symbol: string) {
    setQuery("");
    setOpen(false);
    router.push(`/stock/${symbol}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search stocks (e.g. AAPL, Tesla)..."
          className="w-full rounded-lg border border-border bg-muted/30 py-2.5 pl-10 pr-10 text-sm outline-none ring-primary/50 transition focus:border-primary/50 focus:ring-2"
          aria-label="Search stocks"
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-border bg-popover py-1 shadow-xl"
          role="listbox"
        >
          {results.map((item) => (
            <li key={`${item.symbol}-${item.displaySymbol}`} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => selectSymbol(item.symbol)}
                className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-muted/60"
              >
                <span className="font-medium">{item.displaySymbol}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {item.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

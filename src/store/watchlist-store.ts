"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_WATCHLIST } from "@/lib/constants";

interface WatchlistState {
  symbols: string[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  hasSymbol: (symbol: string) => boolean;
  reorder: (fromIndex: number, toIndex: number) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: [...DEFAULT_WATCHLIST],
      addSymbol: (symbol) => {
        const upper = symbol.toUpperCase();
        if (get().symbols.includes(upper)) return;
        set((state) => ({ symbols: [...state.symbols, upper] }));
      },
      removeSymbol: (symbol) => {
        set((state) => ({
          symbols: state.symbols.filter((s) => s !== symbol.toUpperCase()),
        }));
      },
      hasSymbol: (symbol) => get().symbols.includes(symbol.toUpperCase()),
      reorder: (fromIndex, toIndex) => {
        set((state) => {
          const next = [...state.symbols];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return { symbols: next };
        });
      },
    }),
    { name: "stocks-watchlist" },
  ),
);

"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { CHART_RESOLUTIONS } from "@/lib/constants";
import type { CandlePoint, ChartResolution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StockChartProps {
  symbol: string;
}

function getRangeSeconds(resolution: ChartResolution): { from: number; to: number } {
  const to = Math.floor(Date.now() / 1000);
  const day = 86400;

  switch (resolution) {
    case "1":
    case "5":
      return { from: to - day, to };
    case "15":
    case "30":
    case "60":
      return { from: to - day * 5, to };
    case "D":
      return { from: to - day * 365, to };
    case "W":
      return { from: to - day * 365 * 3, to };
    case "M":
      return { from: to - day * 365 * 10, to };
    default:
      return { from: to - day * 90, to };
  }
}

export function StockChart({ symbol }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [resolution, setResolution] = useState<ChartResolution>("D");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8b9cb3",
      },
      grid: {
        vertLines: { color: "rgba(139, 156, 179, 0.06)" },
        horzLines: { color: "rgba(139, 156, 179, 0.06)" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      crosshair: { mode: 1 },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderUpColor: "#34d399",
      borderDownColor: "#f87171",
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const { from, to } = getRangeSeconds(resolution);
    setLoading(true);
    setError(null);

    fetch(
      `/api/candles?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const candles = data.candles as CandlePoint[];
        if (!seriesRef.current) return;

        const chartData = candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        seriesRef.current.setData(chartData);
        chartRef.current?.timeScale().fitContent();
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load chart"),
      )
      .finally(() => setLoading(false));
  }, [symbol, resolution]);

  return (
    <div className="space-y-3">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 scrollbar-none">
        {CHART_RESOLUTIONS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setResolution(r.value as ChartResolution)}
            className={cn(
              "shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition active:scale-[0.98]",
              resolution === r.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="relative h-56 w-full rounded-xl bg-muted/20 sm:h-72 md:h-80">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        )}
        {error && (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-loss">
            {error}
          </p>
        )}
        <div ref={containerRef} className="h-full w-full rounded-xl" />
      </div>
    </div>
  );
}

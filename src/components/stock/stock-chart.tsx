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
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" },
      },
      rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.2)" },
      timeScale: { borderColor: "rgba(148, 163, 184, 0.2)" },
      crosshair: { mode: 1 },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
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
          time: (resolution === "D" || resolution === "W" || resolution === "M"
            ? c.time
            : c.time) as Time,
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
      <div className="flex flex-wrap gap-1">
        {CHART_RESOLUTIONS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setResolution(r.value as ChartResolution)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition",
              resolution === r.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="relative h-[400px] w-full rounded-lg border border-border bg-muted/10">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        )}
        {error && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-loss">
            {error}
          </p>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}

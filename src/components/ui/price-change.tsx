import { cn, formatChange, formatPercent, isPositiveChange } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface PriceChangeProps {
  change: number;
  percentChange: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function PriceChange({
  change,
  percentChange,
  size = "md",
  showIcon = true,
}: PriceChangeProps) {
  const positive = isPositiveChange(change);
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tabular-nums",
        positive ? "text-gain" : "text-loss",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base",
      )}
    >
      {showIcon && <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />}
      {formatChange(change)} ({formatPercent(percentChange)})
    </span>
  );
}

import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gain" | "loss" | "neutral";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variant === "gain" && "bg-gain/15 text-gain",
        variant === "loss" && "bg-loss/15 text-loss",
        variant === "neutral" && "bg-muted text-muted-foreground",
        variant === "default" && "bg-primary/15 text-primary",
        className,
      )}
      {...props}
    />
  );
}

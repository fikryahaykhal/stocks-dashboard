import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

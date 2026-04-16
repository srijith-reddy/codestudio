import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "brand",
}: {
  value: number;
  className?: string;
  tone?: "brand" | "success" | "accent";
}) {
  const toneClass = {
    brand: "bg-brand",
    success: "bg-success",
    accent: "bg-accent",
  }[tone];
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-bg-subtle",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", toneClass)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Ring({
  value,
  size = 64,
  stroke = 6,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgb(var(--bg-subtle))"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgb(var(--brand))"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      {label !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
          {label}
        </div>
      )}
    </div>
  );
}

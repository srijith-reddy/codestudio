"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "brand-gradient text-brand-fg hover:opacity-95 hover:scale-[1.02] font-semibold shadow-glow",
  secondary:
    "bg-bg-subtle text-fg border border-border hover:border-border-strong hover:bg-bg-elevated",
  ghost: "text-fg-muted hover:text-fg hover:bg-white/[0.06]",
  outline:
    "border border-white/20 text-fg hover:border-white/40 hover:bg-white/[0.06]",
  danger: "bg-danger/90 text-white hover:bg-danger",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-sm rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "disabled:opacity-40 disabled:pointer-events-none",
          "active:scale-[0.97]",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

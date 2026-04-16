"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PATTERNS } from "@/lib/data/patterns";
import { PROBLEMS_BY_PATTERN } from "@/lib/data/problems";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function PatternsPage() {
  const [hydrated, setHydrated] = useState(false);
  const patternMastery = useApp((s) => s.patternMastery);
  useEffect(() => setHydrated(true), []);

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase tracking-widest text-fg-muted">
          Pattern library
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tight">
          Twelve patterns. One good month.
        </h1>
        <p className="mt-2 text-sm text-fg-muted max-w-2xl">
          Every interview question is a remix of one of these. Master the
          triggers, the skeleton, and the common helpers — the problems fall in
          line after that.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PATTERNS.map((p) => {
          const problems = PROBLEMS_BY_PATTERN[p.id] || [];
          const mastery = hydrated ? patternMastery(p.id) : 0;
          return (
            <Link key={p.id} href={`/patterns/${p.id}`}>
              <Card
                className={cn(
                  "relative overflow-hidden p-6 hover:border-border-strong transition-all group h-full",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
                    p.accent,
                  )}
                  aria-hidden
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-fg-subtle">
                        Pattern {String(p.order).padStart(2, "0")}
                      </div>
                      <div className="mt-1 text-lg font-display font-semibold">
                        {p.name}
                      </div>
                      <div className="text-sm text-fg-muted">{p.tagline}</div>
                    </div>
                    <Badge tone="neutral">{problems.length} problems</Badge>
                  </div>

                  <p className="mt-4 text-sm text-fg-muted line-clamp-2">
                    {p.summary}
                  </p>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-fg-subtle mb-1.5">
                      <span>Mastery</span>
                      <span>{mastery}%</span>
                    </div>
                    <Progress value={mastery} />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-fg-muted group-hover:text-fg transition-colors">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

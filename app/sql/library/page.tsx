"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Database } from "lucide-react";
import {
  SQL_CATEGORIES,
  SQL_PROBLEMS,
  SQL_PROBLEMS_BY_CATEGORY,
} from "@/lib/data/sql";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SqlLibraryPage() {
  const [hydrated, setHydrated] = useState(false);
  const sqlProgress = useApp((s) => s.sqlProgress);
  useEffect(() => setHydrated(true), []);

  const categoryMastery = (catId: string) => {
    const ids = (SQL_PROBLEMS_BY_CATEGORY[catId] || []).map((p) => p.id);
    if (ids.length === 0) return 0;
    const total = ids.reduce((acc, id) => {
      const rec = sqlProgress[id];
      if (!rec) return acc;
      return acc + Math.min(100, rec.masteryPoints);
    }, 0);
    return Math.round((total / (ids.length * 100)) * 100);
  };

  const solvedCount = hydrated
    ? Object.values(sqlProgress).filter(
        (r) => r.status === "solved_alone" || r.status === "mastered",
      ).length
    : 0;

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-bg-elevated p-8 md:p-10">
        <div
          className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent pointer-events-none"
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <Database className="h-3.5 w-3.5" /> SQL 50 · Library
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tight">
            Fifty queries. Seven categories. One reflex.
          </h1>
          <p className="mt-3 text-sm text-fg-muted max-w-2xl">
            SQL interviews aren't about esoteric syntax — they're about whether
            you can sequence SELECT → WHERE → GROUP BY → HAVING → ORDER BY
            without thinking. Drill the shapes here and they become muscle
            memory.
          </p>
          <div className="mt-6 flex gap-2">
            <Badge tone="neutral">{SQL_PROBLEMS.length} problems</Badge>
            <Badge tone="success">{solvedCount} solved</Badge>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SQL_CATEGORIES.map((c) => {
          const problems = SQL_PROBLEMS_BY_CATEGORY[c.id] || [];
          const mastery = hydrated ? categoryMastery(c.id) : 0;
          return (
            <Link key={c.id} href={`/sql/${c.id}`}>
              <Card
                className={cn(
                  "relative overflow-hidden p-6 hover:border-border-strong transition-all group h-full",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
                    c.accent,
                  )}
                  aria-hidden
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-fg-subtle">
                        Category {String(c.order).padStart(2, "0")}
                      </div>
                      <div className="mt-1 text-lg font-display font-semibold">
                        {c.name}
                      </div>
                      <div className="text-sm text-fg-muted">{c.tagline}</div>
                    </div>
                    <Badge tone="neutral">{problems.length} queries</Badge>
                  </div>

                  <p className="mt-4 text-sm text-fg-muted line-clamp-2">
                    {c.coreIdea}
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

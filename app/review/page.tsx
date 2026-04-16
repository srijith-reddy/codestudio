"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Repeat,
  Circle,
  ArrowRight,
  Target,
} from "lucide-react";
import { PROBLEM_MAP, PROBLEMS, PROBLEMS_BY_PATTERN } from "@/lib/data/problems";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { useApp } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ReviewPage() {
  const [hydrated, setHydrated] = useState(false);
  // Subscribe only to problemProgress — everything downstream derives from it.
  // Don't subscribe to the `dueForReview` / `patternMastery` function selectors;
  // those are stable refs but pulling them encourages inline calls that re-run
  // O(n) work on every render. We compute locally instead.
  const problemProgress = useApp((s) => s.problemProgress);

  useEffect(() => setHydrated(true), []);

  // Single derivation pass over problemProgress — one sweep computes every
  // card on this page. Previously: three separate unmemoized computations
  // (dueForReview + notStarted + weakPatterns), with weakPatterns re-filtering
  // all 130 PROBLEMS for every pattern on every render. That's what was slow.
  const { due, weakPatterns, notStarted } = useMemo(() => {
    if (!hydrated) {
      return {
        due: [] as string[],
        weakPatterns: [] as { id: string; mastery: number }[],
        notStarted: [] as typeof PROBLEMS,
      };
    }

    const now = Date.now();
    const due: string[] = [];
    for (const [id, rec] of Object.entries(problemProgress)) {
      if (rec.nextReview && rec.nextReview <= now && rec.status !== "mastered") {
        due.push(id);
      }
    }

    // Weak patterns — one pass, using the precomputed PROBLEMS_BY_PATTERN
    // index instead of re-filtering PROBLEMS for every pattern.
    const weakPatterns = Object.values(PATTERN_MAP)
      .map((p) => {
        const problems = PROBLEMS_BY_PATTERN[p.id] || [];
        if (problems.length === 0) return { id: p.id, mastery: 0 };
        let total = 0;
        for (const prob of problems) {
          const rec = problemProgress[prob.id];
          if (rec) total += Math.min(100, rec.masteryPoints);
        }
        return {
          id: p.id,
          mastery: Math.round((total / (problems.length * 100)) * 100),
        };
      })
      .filter((p) => p.mastery > 0 && p.mastery < 50)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 4);

    const notStarted = PROBLEMS.filter((p) => !problemProgress[p.id]).slice(0, 6);

    return { due, weakPatterns, notStarted };
  }, [hydrated, problemProgress]);

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
          <Repeat className="h-3.5 w-3.5" /> Review
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tight">
          Review beats ego.
        </h1>
        <p className="mt-2 text-sm text-fg-muted max-w-2xl">
          Spaced repetition keeps patterns sticky. Redo one due problem, rebuild
          one weak template, and you'll never lose ground.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-fg-muted">
                Due today
              </div>
              <div className="mt-1 text-2xl font-display font-semibold">
                {hydrated ? due.length : 0}
              </div>
            </div>
            <Badge tone="brand">{hydrated ? due.length : 0}</Badge>
          </div>
          {hydrated && due.length === 0 ? (
            <p className="mt-4 text-sm text-fg-subtle italic">
              Nothing due. You're coasting — keep it going.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {due.slice(0, 6).map((id) => {
                const p = PROBLEM_MAP[id];
                if (!p) return null;
                return (
                  <li key={id}>
                    <Link
                      href={`/problems/${id}`}
                      className="group flex items-center gap-3 py-2.5 text-sm"
                    >
                      <Circle className="h-4 w-4 text-fg-subtle" />
                      <span className="flex-1 font-medium">{p.title}</span>
                      <Badge tone="neutral">{p.difficulty}</Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-fg-subtle group-hover:text-fg" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-fg-muted">
                Weak patterns
              </div>
              <div className="mt-1 text-2xl font-display font-semibold">
                Redo these
              </div>
            </div>
            <Target className="h-5 w-5 text-accent" />
          </div>
          {weakPatterns.length === 0 ? (
            <p className="mt-4 text-sm text-fg-subtle italic">
              No weak spots yet — or you haven't hit them yet. Either works.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {weakPatterns.map((wp) => {
                const p = PATTERN_MAP[wp.id];
                return (
                  <li key={wp.id}>
                    <Link
                      href={`/patterns/${wp.id}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-fg-subtle">
                        {wp.mastery}%
                      </span>
                    </Link>
                    <Progress value={wp.mastery} className="mt-1.5" tone="accent" />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-xs uppercase tracking-widest text-fg-muted">
          Haven't started yet
        </div>
        <div className="mt-1 text-sm text-fg-muted">
          Low-friction wins you can pick off in 10 minutes each.
        </div>
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {notStarted.map((p) => (
            <li key={p.id}>
              <Link
                href={`/problems/${p.id}`}
                className="group flex items-center gap-3 py-3 text-sm"
              >
                <Circle className="h-4 w-4 text-fg-subtle" />
                <span className="flex-1 font-medium">{p.title}</span>
                <Badge tone="neutral">{PATTERN_MAP[p.patternId]?.name}</Badge>
                <Badge
                  tone={p.difficulty === "Easy" ? "success" : "warning"}
                >
                  {p.difficulty}
                </Badge>
                <ArrowRight className="h-3.5 w-3.5 text-fg-subtle group-hover:text-fg" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

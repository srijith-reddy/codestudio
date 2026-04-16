"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Database,
  Flame,
  Trophy,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import {
  SQL_CATEGORIES,
  SQL_CATEGORY_MAP,
  SQL_PROBLEMS,
  SQL_PROBLEMS_BY_CATEGORY,
} from "@/lib/data/sql";
import { cn } from "@/lib/utils";

/**
 * SQL Progress — mirror of /progress, scoped to the SQL track for
 * track-specific stats. XP/streak/gallery are shared across tracks, so
 * those numbers are shown here as a unified header and link into the full
 * gallery on /progress.
 */
export default function SqlProgressPage() {
  const [hydrated, setHydrated] = useState(false);
  const xp = useApp((s) => s.xp);
  const level = useApp((s) => s.level());
  const streak = useApp((s) => s.streak);
  const sqlProgress = useApp((s) => s.sqlProgress);
  const artProgress = useApp((s) => s.artProgress);

  useEffect(() => setHydrated(true), []);

  const { solvedCount, masteredCount, dueCount, recentSolves, categoryStats } =
    useMemo(() => {
      if (!hydrated) {
        return {
          solvedCount: 0,
          masteredCount: 0,
          dueCount: 0,
          recentSolves: [] as { id: string; lastSeen: number }[],
          categoryStats: [] as { id: string; name: string; mastery: number; count: number; solved: number }[],
        };
      }
      const now = Date.now();
      let solvedCount = 0;
      let masteredCount = 0;
      let dueCount = 0;
      const recent: { id: string; lastSeen: number }[] = [];
      for (const [id, rec] of Object.entries(sqlProgress)) {
        if (rec.status === "solved_alone" || rec.status === "mastered") {
          solvedCount += 1;
        }
        if (rec.status === "mastered") masteredCount += 1;
        if (rec.nextReview && rec.nextReview <= now && rec.status !== "mastered") {
          dueCount += 1;
        }
        if (rec.lastSeen) recent.push({ id, lastSeen: rec.lastSeen });
      }
      recent.sort((a, b) => b.lastSeen - a.lastSeen);

      const categoryStats = SQL_CATEGORIES.map((c) => {
        const list = SQL_PROBLEMS_BY_CATEGORY[c.id] || [];
        if (list.length === 0) {
          return { id: c.id, name: c.name, mastery: 0, count: 0, solved: 0 };
        }
        let total = 0;
        let solved = 0;
        for (const p of list) {
          const rec = sqlProgress[p.id];
          if (rec) {
            total += Math.min(100, rec.masteryPoints);
            if (rec.status === "solved_alone" || rec.status === "mastered") {
              solved += 1;
            }
          }
        }
        return {
          id: c.id,
          name: c.name,
          mastery: Math.round((total / (list.length * 100)) * 100),
          count: list.length,
          solved,
        };
      });

      return {
        solvedCount,
        masteredCount,
        dueCount,
        recentSolves: recent.slice(0, 5),
        categoryStats,
      };
    }, [hydrated, sqlProgress]);

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
          <Database className="h-3.5 w-3.5" /> SQL Progress
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tight">
          Your SQL rep count.
        </h1>
        <p className="mt-2 text-sm text-fg-muted max-w-2xl">
          Category mastery, solved problems, and review queue — scoped to the
          SQL 50. XP, streak, and the painting gallery are shared across
          tracks, so every SQL solve feeds the same wall.
        </p>
      </header>

      {/* Shared reward header — same numbers as DSA /progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-fg-muted">
            <Zap className="h-3 w-3 text-brand" /> XP
          </div>
          <div className="mt-1 text-2xl font-display font-semibold">
            {hydrated ? xp : 0}
          </div>
          <div className="mt-0.5 text-[11px] text-fg-subtle">
            Level {hydrated ? level : 1} · shared
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-fg-muted">
            <Flame className="h-3 w-3 text-orange-400" /> Streak
          </div>
          <div className="mt-1 text-2xl font-display font-semibold">
            {hydrated ? streak : 0}d
          </div>
          <div className="mt-0.5 text-[11px] text-fg-subtle">
            Any solve counts
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-fg-muted">
            <Trophy className="h-3 w-3 text-accent" /> SQL Solved
          </div>
          <div className="mt-1 text-2xl font-display font-semibold">
            {hydrated ? solvedCount : 0}
            <span className="ml-1 text-xs text-fg-subtle font-sans">
              / {SQL_PROBLEMS.length}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-fg-subtle">
            {hydrated ? masteredCount : 0} mastered
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-fg-muted">
            <Activity className="h-3 w-3 text-warning" /> Due
          </div>
          <div className="mt-1 text-2xl font-display font-semibold">
            {hydrated ? dueCount : 0}
          </div>
          <div className="mt-0.5 text-[11px] text-fg-subtle">
            Review scheduled
          </div>
        </Card>
      </div>

      {/* Category mastery grid */}
      <Card className="p-6">
        <div className="text-xs uppercase tracking-widest text-fg-muted">
          Category mastery
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryStats.map((c) => (
            <Link
              key={c.id}
              href={`/sql/${c.id}`}
              className="group rounded-2xl border border-border bg-bg-elevated p-4 hover:border-border-strong transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{c.name}</div>
                <Badge tone="neutral">
                  {c.solved}/{c.count}
                </Badge>
              </div>
              <Progress className="mt-2" value={hydrated ? c.mastery : 0} />
              <div className="mt-1.5 text-[10px] text-fg-subtle">
                {hydrated ? c.mastery : 0}% mastered
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Recently worked + shared gallery link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="text-xs uppercase tracking-widest text-fg-muted">
            Recently worked
          </div>
          {recentSolves.length === 0 ? (
            <p className="mt-3 text-sm text-fg-subtle italic">
              Nothing yet — head to{" "}
              <Link href="/sql" className="text-brand hover:underline">
                SQL Today
              </Link>{" "}
              to start.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {recentSolves.map((r) => {
                const p = SQL_PROBLEMS.find((x) => x.id === r.id);
                if (!p) return null;
                const cat = SQL_CATEGORY_MAP[p.categoryId];
                return (
                  <li key={r.id}>
                    <Link
                      href={`/sql/problems/${r.id}`}
                      className={cn(
                        "group flex items-center gap-3 py-2.5 text-sm",
                      )}
                    >
                      <span className="flex-1 font-medium">{p.title}</span>
                      <Badge tone="neutral">{cat?.name}</Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-fg-subtle group-hover:text-fg" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="text-xs uppercase tracking-widest text-fg-muted">
            Shared gallery
          </div>
          <div className="mt-2 text-2xl font-display font-semibold">
            {hydrated ? artProgress.tilesRevealed : 0}
            <span className="ml-1 text-xs text-fg-subtle font-sans">
              tiles revealed
            </span>
          </div>
          <p className="mt-2 text-sm text-fg-muted">
            Every SQL solve reveals tiles on the same painting wall as your
            DSA work. One gallery, two tracks filling it.
          </p>
          <Link
            href="/progress"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg"
          >
            See the gallery <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  Database,
  Trophy,
  Table2,
} from "lucide-react";
import { SQL_PROBLEM_MAP, SQL_CATEGORY_MAP } from "@/lib/data/sql";
import { coachCopy } from "@/lib/data/coach";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { MemoryStatus } from "@/lib/types";

export default function SqlProblemDetailPage() {
  const params = useParams<{ id: string }>();
  const problem = params.id ? SQL_PROBLEM_MAP[params.id] : undefined;
  const category = problem ? SQL_CATEGORY_MAP[problem.categoryId] : undefined;

  const [revealedHints, setRevealedHints] = useState(0);
  const [showCode, setShowCode] = useState(false);

  const markSql = useApp((s) => s.markSql);
  const tone = useApp((s) => s.prefs.tone);
  const copy = coachCopy(tone);
  const [marked, setMarked] = useState<MemoryStatus | null>(null);

  useEffect(() => {
    setRevealedHints(0);
    setShowCode(false);
    setMarked(null);
  }, [params.id]);

  if (!problem || !category) return notFound();

  const handleMark = (status: MemoryStatus) => {
    markSql(problem.id, status);
    setMarked(status);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-fg-subtle">
        <Link href="/sql/library" className="hover:text-fg">
          SQL Library
        </Link>
        <span>/</span>
        <Link href={`/sql/${category.id}`} className="hover:text-fg">
          {category.name}
        </Link>
        <span>/</span>
        <span>{problem.title}</span>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-border bg-bg-elevated p-8 md:p-10">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
            category.accent,
          )}
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
              <Database className="h-3.5 w-3.5" /> {category.name}
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tight">
              {problem.title}
            </h1>
            <p className="mt-3 text-sm text-fg-muted">{problem.whyItMatters}</p>
          </div>
          <Badge
            tone={
              problem.difficulty === "Easy"
                ? "success"
                : problem.difficulty === "Medium"
                  ? "warning"
                  : "danger"
            }
          >
            {problem.difficulty}
          </Badge>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <BookOpen className="h-3.5 w-3.5" /> Learning objective
          </div>
          <p className="mt-3 text-sm text-fg leading-relaxed">
            {problem.learningObjective}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <Table2 className="h-3.5 w-3.5" /> Schema
          </div>
          <pre className="mt-3 code rounded-xl border border-border bg-bg-subtle p-3 text-xs overflow-x-auto scrollbar-thin">
{problem.schemaHint}
          </pre>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-xs uppercase tracking-widest text-fg-muted">
          Approach
        </div>
        <p className="mt-3 text-sm text-fg-muted leading-relaxed">
          {problem.approach}
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <Lightbulb className="h-3.5 w-3.5" /> Hints
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setRevealedHints((n) => Math.min(problem.hints.length, n + 1))
            }
            disabled={revealedHints >= problem.hints.length}
          >
            Unlock hint {Math.min(problem.hints.length, revealedHints + 1)}
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {problem.hints.map((h, i) => (
            <AnimatePresence key={i} initial={false}>
              {i < revealedHints && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-border bg-bg-subtle px-4 py-3 text-sm text-fg-muted"
                >
                  <span className="text-fg-subtle mr-2">Hint {i + 1}</span>
                  {h}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
          {revealedHints === 0 && (
            <p className="text-sm text-fg-subtle italic">
              Try the query cold first. Peek only if you're stuck.
            </p>
          )}
        </div>
      </Card>

      {problem.pitfalls.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <AlertTriangle className="h-3.5 w-3.5" /> Pitfalls
          </div>
          <ul className="mt-3 space-y-1.5">
            {problem.pitfalls.map((p) => (
              <li key={p} className="text-sm text-fg-muted flex gap-2">
                <span className="text-warning">!</span> {p}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-fg-muted">
            Reference query
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode((s) => !s)}
          >
            {showCode ? (
              <>
                <EyeOff className="h-4 w-4" /> Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Reveal query
              </>
            )}
          </Button>
        </div>
        {showCode ? (
          <pre className="mt-4 code rounded-xl border border-border bg-bg-subtle p-4 overflow-x-auto scrollbar-thin text-xs">
{problem.finalCode}
          </pre>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-fg-subtle">
            Query is hidden. Write it first — it sticks better that way.
          </div>
        )}
      </Card>

      <Card className="p-6 border-brand/30 bg-brand-soft/20">
        <div className="text-xs uppercase tracking-widest text-brand">
          Remember this
        </div>
        <div className="mt-2 text-lg font-display">{problem.rememberThis}</div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
          <Trophy className="h-3.5 w-3.5" /> How did it go?
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { s: "tried" as MemoryStatus, label: "Tried it", tone: "ghost" },
            {
              s: "solved_with_help" as MemoryStatus,
              label: "Solved w/ help",
              tone: "secondary",
            },
            {
              s: "solved_alone" as MemoryStatus,
              label: "Solved alone",
              tone: "primary",
            },
            {
              s: "mastered" as MemoryStatus,
              label: "Mastered",
              tone: "primary",
            },
          ].map((o) => (
            <Button
              key={o.s}
              variant={(o.tone as any) || "secondary"}
              className={cn(marked === o.s && "ring-2 ring-brand/60")}
              onClick={() => handleMark(o.s)}
            >
              {o.label}
            </Button>
          ))}
        </div>
        {marked && (
          <div className="mt-3 text-xs text-fg-subtle">
            {copy.echoSavedReview}
          </div>
        )}
      </Card>
    </div>
  );
}

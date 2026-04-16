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
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { PROBLEM_MAP } from "@/lib/data/problems";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { coachCopy } from "@/lib/data/coach";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { MemoryStatus } from "@/lib/types";

export default function ProblemDetailPage() {
  const params = useParams<{ id: string }>();
  const problem = params.id ? PROBLEM_MAP[params.id] : undefined;
  const pattern = problem ? PATTERN_MAP[problem.patternId] : undefined;

  const [revealedHints, setRevealedHints] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [recallIdx, setRecallIdx] = useState(0);
  const [showRecall, setShowRecall] = useState(false);

  const markProblem = useApp((s) => s.markProblem);
  const tone = useApp((s) => s.prefs.tone);
  const copy = coachCopy(tone);
  const [marked, setMarked] = useState<MemoryStatus | null>(null);

  useEffect(() => {
    setRevealedHints(0);
    setShowCode(false);
    setRecallIdx(0);
    setShowRecall(false);
    setMarked(null);
  }, [params.id]);

  if (!problem || !pattern) return notFound();

  const handleMark = (status: MemoryStatus) => {
    markProblem(problem.id, status);
    setMarked(status);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-fg-subtle">
        <Link href="/patterns" className="hover:text-fg">
          Patterns
        </Link>
        <span>/</span>
        <Link href={`/patterns/${pattern.id}`} className="hover:text-fg">
          {pattern.name}
        </Link>
        <span>/</span>
        <span>{problem.title}</span>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-bg-elevated p-8 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
              <Sparkles className="h-3.5 w-3.5" /> {pattern.name}
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tight">
              {problem.title}
            </h1>
            <p className="mt-3 text-sm text-fg-muted">{problem.whyItMatters}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
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
              <Badge tone="neutral">~{problem.estimatedMinutes}m</Badge>
            </div>
            <div className="text-xs text-fg-subtle">
              Time {problem.complexity.time} · Space {problem.complexity.space}
            </div>
          </div>
        </div>
      </section>

      {/* Objective + brute / optimal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <Target className="h-3.5 w-3.5" /> Learning objective
          </div>
          <p className="mt-3 text-sm text-fg leading-relaxed">
            {problem.learningObjective}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <BookOpen className="h-3.5 w-3.5" /> Brute force → optimal
          </div>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-fg-subtle">
                Brute
              </div>
              <p className="text-fg-muted">{problem.bruteForce}</p>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-fg-subtle">
                Optimal
              </div>
              <p className="text-fg">{problem.optimalInsight}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Hints */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <Lightbulb className="h-3.5 w-3.5" /> Hints (unlock one at a time)
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
              Try to solve it first. Unlock hints only if you get stuck.
            </p>
          )}
        </div>
      </Card>

      {/* Pitfalls */}
      <Card className="p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
          <AlertTriangle className="h-3.5 w-3.5" /> Common pitfalls
        </div>
        <ul className="mt-3 space-y-1.5">
          {problem.pitfalls.map((p) => (
            <li key={p} className="text-sm text-fg-muted flex gap-2">
              <span className="text-warning">!</span> {p}
            </li>
          ))}
        </ul>
      </Card>

      {/* Final code */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-fg-muted">
            Reference implementation
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
                <Eye className="h-4 w-4" /> Reveal code
              </>
            )}
          </Button>
        </div>
        {showCode ? (
          <pre className="mt-4 code rounded-xl border border-border bg-bg-subtle p-4 overflow-x-auto scrollbar-thin">
{problem.finalCode}
          </pre>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-fg-subtle">
            Code is hidden. Try writing it first — your memory gets stronger
            every time you attempt it cold.
          </div>
        )}
      </Card>

      {/* Active recall */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-fg-muted">
              Active recall
            </div>
            <div className="text-sm text-fg-muted mt-1">
              Fast, frictionless. Say the answer out loud.
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setShowRecall(true);
            }}
          >
            {showRecall ? "Next question" : "Start recall"}
          </Button>
        </div>
        {showRecall && (
          <div className="mt-4 rounded-xl border border-border bg-bg-subtle p-4">
            <div className="text-[11px] uppercase tracking-widest text-fg-subtle">
              Question {recallIdx + 1} of {problem.recallQuestions.length}
            </div>
            <div className="mt-2 text-base">
              {problem.recallQuestions[recallIdx]}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setRecallIdx((i) =>
                    Math.min(i + 1, problem.recallQuestions.length - 1),
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Remember this */}
      <Card className="p-6 border-brand/30 bg-brand-soft/20">
        <div className="text-xs uppercase tracking-widest text-brand">
          Remember this
        </div>
        <div className="mt-2 text-lg font-display">
          {problem.rememberThis}
        </div>
      </Card>

      {/* Mark progress */}
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

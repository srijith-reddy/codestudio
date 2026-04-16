"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Database,
  Lightbulb,
  Sparkles,
  Sunrise,
  Table2,
  Target,
  Trophy,
  Feather,
  Check,
} from "lucide-react";
import { SQL_CATEGORY_MAP, SQL_PROBLEMS } from "@/lib/data/sql";
import { sqlPuzzleFor } from "@/lib/data/sql-puzzles";
import { sqlDaySlot, type SqlDaySlot } from "@/lib/data/sql-plan";
import { CodeBlockPuzzle } from "@/components/code-blocks";
import { CurriculumAssistant } from "@/components/assistant";
import { artworkForProblem, TILES_PER_PROBLEM } from "@/lib/data/artwork";
import { RotateCcw } from "lucide-react";
import type {
  CodePuzzle,
  Pattern,
  PlaybookEntry,
  Problem,
  SQLProblem,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  StepRail,
  StepCard,
  STEP_ORDER,
  ProblemPaintingReveal,
} from "@/components/mission-flow";
import { coachCopy } from "@/lib/data/coach";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { MemoryStatus, MissionStepKind } from "@/lib/types";

/**
 * SQL Today — same three-beat mission shell as DSA, scoped to the day's SQL
 * problem. The hero + step rail + step card pieces are imported from the DSA
 * mission-flow so the two tracks stay visually in sync. Only the content of
 * each beat is SQL-specific.
 */
export default function SqlTodayPage() {
  const [hydrated, setHydrated] = useState(false);
  const currentDay = useApp((s) => s.currentDay);
  const sqlProgress = useApp((s) => s.sqlProgress);
  const markSql = useApp((s) => s.markSql);
  const addPlaybookEntry = useApp((s) => s.addPlaybookEntry);
  const sqlDueForReview = useApp((s) => s.sqlDueForReview);
  const problemArtProgress = useApp((s) => s.problemArtProgress);
  const planLength = useApp((s) => s.prefs.planLength || 30);
  const tone = useApp((s) => s.prefs.tone);
  const copy = coachCopy(tone);

  const [day, setDay] = useState(1);
  const [activeStep, setActiveStep] = useState<MissionStepKind>("warmup");
  const [doneSteps, setDoneSteps] = useState<Set<MissionStepKind>>(new Set());
  const [puzzleOutcome, setPuzzleOutcome] = useState<
    { clean: boolean; hintsUsed: number } | null
  >(null);
  const [marked, setMarked] = useState<MemoryStatus | null>(null);
  // Baseline tile count snapshot — captured before the solve so Echo can
  // animate the delta in, the same way DSA does via tilesBeforeByProblem.
  const [baselineTiles, setBaselineTiles] = useState<number | null>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHydrated(true);
    setDay(currentDay());
  }, [currentDay]);

  // Compute today's slot — either a new problem or a review day.
  // On plans longer than the SQL catalog, extras become review slots that
  // pull from the SRS queue (oldest-overdue first), so users revisit what
  // they're most likely to have forgotten.
  const slot: SqlDaySlot | null = useMemo(() => {
    if (!hydrated) return null;
    const due = sqlDueForReview();
    const solvedIds = Object.keys(sqlProgress);
    return sqlDaySlot(day, planLength, due, solvedIds);
  }, [hydrated, day, planLength, sqlDueForReview, sqlProgress]);

  const problem = slot?.problem ?? null;
  const isReviewDay = slot?.kind === "review";

  const puzzle = useMemo(
    () => (problem ? sqlPuzzleFor(problem.id) : undefined),
    [problem?.id],
  );

  const category = problem ? SQL_CATEGORY_MAP[problem.categoryId] : undefined;
  const rec = problem ? sqlProgress[problem.id] : undefined;
  const already =
    rec?.status === "solved_alone" || rec?.status === "mastered";

  useEffect(() => {
    setDoneSteps(new Set());
    setPuzzleOutcome(null);
    setMarked(null);
    setActiveStep("warmup");
    setBaselineTiles(null);
  }, [problem?.id]);

  // Snapshot the baseline tile count the first time the user engages with
  // this problem. Any new tiles revealed by solving become the delta that
  // Echo animates. Store once and never update so the reveal is stable.
  const sqlArtKey = problem ? `sql:${problem.id}` : null;
  useEffect(() => {
    if (!sqlArtKey) return;
    if (baselineTiles !== null) return;
    setBaselineTiles(problemArtProgress[sqlArtKey] || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sqlArtKey]);

  const isStepDone = (s: MissionStepKind) => doneSteps.has(s);

  const advance = (s: MissionStepKind) => {
    setDoneSteps((prev) => new Set([...Array.from(prev), s]));
    const nextIdx = Math.min(STEP_ORDER.indexOf(s) + 1, STEP_ORDER.length - 1);
    setActiveStep(STEP_ORDER[nextIdx]);
    setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const goToStep = (s: MissionStepKind) => {
    setActiveStep(s);
    setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handlePuzzleSolved = (clean: boolean, hintsUsed: number) => {
    setPuzzleOutcome({ clean, hintsUsed });
    if (problem) {
      const status: MemoryStatus = clean ? "solved_alone" : "solved_with_help";
      markSql(problem.id, status);
      setMarked(status);
    }
  };

  const handleMark = (status: MemoryStatus) => {
    if (!problem) return;
    markSql(problem.id, status);
    setMarked(status);
  };

  if (!hydrated) {
    return <div className="h-64 rounded-3xl animate-pulse bg-bg-subtle" />;
  }

  if (!problem || !category) {
    return (
      <div className="rounded-3xl border border-border bg-bg-elevated p-8">
        <p className="text-sm text-fg-muted">
          No SQL problems available. Check back later.
        </p>
      </div>
    );
  }

  const completion =
    (doneSteps.size / STEP_ORDER.length) * 100 +
    (puzzleOutcome && !doneSteps.has("solve") ? 15 : 0);

  const dueIds = sqlDueForReview();
  // Suppress the "due" strip when today's slot already IS the oldest due
  // one — otherwise the banner repeats the hero.
  const extraDueIds = isReviewDay
    ? dueIds.filter((id) => id !== problem?.id)
    : dueIds;

  return (
    <div className="space-y-4">
      {/* Due-for-review strip — so the user knows a review queue exists even
          on new-problem days. Tap a chip to jump to that problem. */}
      {extraDueIds.length > 0 && !isReviewDay && (
        <div className="rounded-xl border border-border bg-bg-elevated p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
            <RotateCcw className="h-3 w-3 text-brand" />
            {extraDueIds.length} SQL problem
            {extraDueIds.length === 1 ? "" : "s"} due for review
          </div>
          <p className="mt-1 text-[12px] text-zinc-500 max-w-xl">
            Spaced repetition says these are the ones you&rsquo;re about to
            forget. A quick revisit keeps them sharp.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {extraDueIds.slice(0, 6).map((id) => {
              const p = SQL_PROBLEMS.find((sp) => sp.id === id);
              if (!p) return null;
              return (
                <Link
                  key={id}
                  href={`/sql/problems/${id}`}
                  className="rounded-full border border-border bg-bg-subtle px-3 py-1 text-[11px] text-zinc-300 hover:border-brand/40 hover:text-fg transition-colors"
                >
                  {p.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero — matches DSA MissionHero styling */}
      <section className="relative overflow-hidden md:rounded-2xl bg-bg-elevated">
        <div className="absolute inset-0 hero-radial pointer-events-none" aria-hidden />
        <div className="relative p-6 md:p-9">
          <div className="text-[0.62rem] uppercase tracking-widest text-zinc-600 flex items-center gap-2 flex-wrap">
            {isReviewDay ? (
              <>
                <RotateCcw className="h-3 w-3 text-brand" />
                Day {day} of {planLength} · SQL · Review day
              </>
            ) : (
              <>
                <Sunrise className="h-3 w-3 text-brand" />
                Day {day} of {planLength} · SQL
                <span className="opacity-40">—</span>
                <span className="truncate opacity-70">{category.name}</span>
              </>
            )}
          </div>
          <h1 className="mt-2.5 font-display text-2xl md:text-[2.2rem] text-fg leading-[1.1] max-w-2xl">
            {isReviewDay ? (
              <>
                Let&rsquo;s revisit{" "}
                <span className="text-brand italic">{problem.title}</span> —
                it&rsquo;s been a while.
              </>
            ) : (
              <>
                Today you&rsquo;ll make{" "}
                <span className="text-brand italic">{problem.title}</span>{" "}
                feel automatic.
              </>
            )}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
            {isReviewDay && <Badge tone="brand">Spaced review</Badge>}
            {!isReviewDay && already && <Badge tone="brand">Already solved</Badge>}
          </div>
          {isReviewDay && (
            <p className="mt-3 text-[12px] text-zinc-500 max-w-lg leading-relaxed">
              You solved this before. Spaced review pulls it back up so the
              pattern sticks. Same flow, half the effort.
            </p>
          )}
          <div className="mt-6">
            <Button size="lg" onClick={() => goToStep(activeStep)}>
              {completion === 0
                ? "Begin today"
                : completion >= 100
                  ? "Revisit today"
                  : "Continue"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <StepRail
        activeStep={activeStep}
        onSelect={goToStep}
        isDone={isStepDone}
      />

      <div ref={activeRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeStep === "warmup" && (
              <StepCard
                step="warmup"
                onComplete={() => advance("warmup")}
                ctaLabel="Got it — build it"
              >
                <SqlWarmupPanel
                  problem={problem}
                  puzzle={puzzle}
                  category={category}
                />
              </StepCard>
            )}

            {activeStep === "solve" && (
              <StepCard
                step="solve"
                onComplete={() => advance("solve")}
                ctaLabel={puzzleOutcome ? "Lock it in" : "Come back to this later"}
              >
                <SqlSolvePanel
                  problem={problem}
                  puzzle={puzzle}
                  categoryName={category.name}
                  livePainting={{
                    artworkId: artworkForProblem(`sql:${problem.id}`).id,
                    baselineTiles:
                      (sqlArtKey && problemArtProgress[sqlArtKey]) || 0,
                    potentialTiles: Math.max(
                      0,
                      TILES_PER_PROBLEM -
                        ((sqlArtKey && problemArtProgress[sqlArtKey]) || 0),
                    ),
                  }}
                  onSolved={handlePuzzleSolved}
                />
              </StepCard>
            )}

            {activeStep === "echo" && (
              <SqlEchoCard
                day={day}
                problem={problem}
                puzzleOutcome={puzzleOutcome}
                marked={marked}
                onMark={handleMark}
                copy={copy}
                onSave={addPlaybookEntry}
                onComplete={() => advance("echo")}
                baselineTiles={baselineTiles ?? 0}
                currentTiles={
                  sqlArtKey ? problemArtProgress[sqlArtKey] || 0 : 0
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CurriculumAssistant
        context={{
          problem: sqlAsProblem(problem),
          pattern: sqlAsPattern(category),
          puzzle,
        }}
        suggestedQuestions={SQL_SUGGESTED_QUESTIONS}
        launcherLabel="Ask the SQL curriculum"
      />
    </div>
  );
}

/**
 * SQL-scoped chip set. The assistant was authored against DSA question
 * routes; we keep only the ones that map cleanly onto SQL-authored fields
 * (approach, hints, pitfalls, finalCode, rememberThis, whyItMatters,
 * keySyntax, coreIdea) so users never tap a chip that returns an empty
 * answer because the underlying field isn't populated for SQL.
 */
const SQL_SUGGESTED_QUESTIONS: { label: string; query: string }[] = [
  { label: "Why this approach?", query: "why this approach" },
  { label: "I'm stuck — hint me", query: "give me a hint" },
  { label: "What are the pitfalls?", query: "common pitfalls" },
  { label: "Show the final query", query: "show final code" },
  { label: "The one-line takeaway?", query: "remember takeaway" },
  { label: "Why does it matter?", query: "why it matters interview" },
  { label: "SQL syntax helpers", query: "syntax helpers" },
  { label: "What is this category?", query: "core pattern idea" },
];

/**
 * Shim a SQLProblem into the Problem shape the curriculum assistant expects.
 * DSA-only fields (bruteForce, complexity, recallQuestions) are left blank —
 * the matching chips are filtered out of SQL_SUGGESTED_QUESTIONS so the user
 * won't land on an answer grounded in an unauthored field.
 */
function sqlAsProblem(p: SQLProblem): Problem {
  return {
    id: p.id,
    title: p.title,
    patternId: p.categoryId,
    difficulty: p.difficulty,
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: p.learningObjective,
    whyItMatters: p.whyItMatters,
    bruteForce: "",
    optimalInsight: p.approach,
    helperSyntax: [],
    hints: p.hints,
    pitfalls: p.pitfalls,
    complexity: { time: "", space: "" },
    finalCode: p.finalCode,
    recallQuestions: [],
    dayAssignment: 0,
    sourceReference: p.sourceReference,
    rememberThis: p.rememberThis,
  };
}

/** Shim a SQLCategory into the Pattern shape the assistant expects. */
function sqlAsPattern(c: (typeof SQL_CATEGORY_MAP)[string]): Pattern {
  return {
    id: c.id,
    name: c.name,
    tagline: c.tagline,
    summary: c.coreIdea,
    triggers: [],
    coreIdea: c.coreIdea,
    skeletonCode: "",
    helperSyntax: c.keySyntax,
    commonMistakes: c.commonMistakes,
    difficultyFocus: [],
    masteryThreshold: 0,
    accent: c.accent,
    icon: c.icon,
    order: c.order,
  };
}

/**
 * Commentary for a SQL clause block. Keeps the right-hand column alive the
 * same way DSA's `blockCommentary` does for Python code. The splitter yields
 * top-level clause blocks (SELECT, FROM, JOIN, WHERE, etc.) so matching the
 * leading keyword is enough — continuation lines fold into the same block.
 */
function sqlClauseCommentary(code: string): string | null {
  const first = code.trim().split("\n")[0]?.trim() ?? "";
  if (!first) return null;
  if (/^WITH\b/i.test(first))
    return "CTE — name a sub-result so the main query stays readable.";
  if (/^SELECT\s+DISTINCT/i.test(first))
    return "Projection + dedupe in one step.";
  if (/^SELECT\b/i.test(first))
    return "The columns you're handing back to the caller.";
  if (/^FROM\b/i.test(first)) return "The table the rows come from.";
  if (/^(INNER\s+)?JOIN\b/i.test(first))
    return "Match rows across tables on a shared key.";
  if (/^LEFT\s+JOIN\b/i.test(first))
    return "Keep every left row — unmatched right-side columns become NULL.";
  if (/^RIGHT\s+JOIN\b/i.test(first))
    return "Keep every right row — unmatched left-side columns become NULL.";
  if (/^FULL\s+(OUTER\s+)?JOIN\b/i.test(first))
    return "Keep both sides, filling unmatched columns with NULL.";
  if (/^CROSS\s+JOIN\b/i.test(first))
    return "Cartesian product — every left row paired with every right row.";
  if (/^WHERE\b/i.test(first))
    return "Row-level filter — runs before any grouping.";
  if (/^GROUP\s+BY\b/i.test(first))
    return "Collapse rows into buckets by the listed columns.";
  if (/^HAVING\b/i.test(first))
    return "Filter after grouping — use this for aggregate conditions.";
  if (/^(UNION|INTERSECT|EXCEPT)\b/i.test(first))
    return "Set operation — stacks two result sets.";
  if (/^ORDER\s+BY\b/i.test(first))
    return "Sort the final rows — last step before LIMIT.";
  if (/^LIMIT\b/i.test(first)) return "Cap the row count returned.";
  if (/^OFFSET\b/i.test(first)) return "Skip the first N rows.";
  return null;
}

function SqlWarmupPanel({
  problem,
  puzzle,
  category,
}: {
  problem: SQLProblem;
  puzzle: CodePuzzle | undefined;
  category: (typeof SQL_CATEGORY_MAP)[string];
}) {
  return (
    <div className="space-y-5">
      {/* Core idea — left accent bar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-l-[3px] border-brand bg-bg-elevated px-6 py-5 rounded-r-xl"
      >
        <div className="text-[10px] uppercase tracking-widest text-brand flex items-center gap-2">
          <Database className="h-3 w-3" /> The one idea
        </div>
        <p className="mt-3 font-display italic text-[1.1rem] text-fg leading-relaxed max-w-2xl">
          {category.coreIdea}
        </p>
      </motion.div>

      {/* Recall trigger */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="space-y-4"
      >
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 flex items-center gap-2">
          <Target className="h-3 w-3 text-brand" /> Use this category when you see
        </div>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="mt-[7px] h-[5px] w-[5px] rounded-full bg-brand/60 shrink-0" />
            <div className="min-w-0">
              <div className="italic text-zinc-200 text-sm">
                &ldquo;{problem.title}&rdquo;
              </div>
              <div className="mt-0.5 text-[12px] text-zinc-500 leading-relaxed">
                {problem.learningObjective}
              </div>
            </div>
          </li>
        </ul>
      </motion.div>

      {/* Schema + key syntax — compact */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 mb-2">
            <Table2 className="h-3 w-3" /> Schema
          </div>
          <pre className="code rounded-xl border border-border bg-bg-subtle p-4 text-xs overflow-x-auto scrollbar-thin">
{problem.schemaHint}
          </pre>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">
            Key syntax
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {category.keySyntax.map((k) => (
              <li
                key={k}
                className="rounded-md border border-border bg-bg-subtle px-2.5 py-1.5 text-[11px] font-mono text-zinc-300"
              >
                {k}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Today's query — line-by-line reveal */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">
          Today you&rsquo;ll build · line by line
        </div>
        {puzzle ? (
          <SqlPreviewCard problem={problem} puzzle={puzzle} />
        ) : (
          <p className="text-sm text-zinc-500 italic">
            No puzzle available for this problem.
          </p>
        )}
      </div>

      <p className="text-[11px] text-zinc-600 text-center">
        Don&rsquo;t worry about memorising every clause. Focus on the execution order.
      </p>
    </div>
  );
}

function SqlPreviewCard({
  problem,
  puzzle,
}: {
  problem: SQLProblem;
  puzzle: CodePuzzle;
}) {
  const [revealed, setRevealed] = useState(1);
  const totalLines = puzzle.blocks.length;
  const done = revealed >= totalLines;

  const takeaways = useMemo(() => {
    return (problem.rememberThis || "")
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.replace(/[.!?\s]+$/u, "").trim())
      .filter((s) => s.length > 0);
  }, [problem.rememberThis]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-xl border border-border bg-bg-elevated overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 flex-wrap bg-bg-subtle/30">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
            <span>Today&rsquo;s query</span>
            <span className="opacity-40">·</span>
            <span className="text-zinc-300">{problem.title}</span>
          </div>
          {puzzle.intent && (
            <p className="mt-2 text-sm text-fg leading-relaxed max-w-2xl">
              {puzzle.intent}
            </p>
          )}
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

      <div className="divide-y divide-border/50">
        <AnimatePresence initial={false}>
          {puzzle.blocks.slice(0, revealed).map((b, bi) => {
            const note = sqlClauseCommentary(b.code);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
                className={cn(
                  "group grid grid-cols-[28px_minmax(0,1.1fr)_minmax(0,1fr)] gap-3 px-4 py-2 transition-colors",
                  bi % 2 === 0 ? "bg-white/[0.015]" : "",
                  "hover:bg-white/[0.04]",
                )}
              >
                <span className="text-[9px] text-zinc-600 font-mono self-center tabular-nums">
                  {String(bi + 1).padStart(2, "0")}
                </span>
                <code className="font-mono text-xs text-zinc-200 whitespace-pre leading-relaxed self-center">
                  {b.code || "\u00A0"}
                </code>
                {note ? (
                  <p className="text-[11px] italic text-zinc-500 leading-relaxed self-center group-hover:text-zinc-300 transition-colors">
                    {note}
                  </p>
                ) : (
                  <span className="text-[11px] text-zinc-700 self-center">
                    —
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3 flex-wrap bg-bg-subtle/20">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 tabular-nums font-mono">
          {revealed}/{totalLines}
          <span className="text-zinc-700 font-sans">clauses</span>
        </div>
        <div className="flex items-center gap-2">
          {revealed > 1 && !done && (
            <button
              type="button"
              onClick={() => setRevealed((r) => Math.max(1, r - 1))}
              className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-1"
            >
              Step back
            </button>
          )}
          {!done ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRevealed((r) => Math.min(totalLines, r + 1))}
            >
              Reveal next line <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(1)}
              className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-1"
            >
              Replay from line 1
            </button>
          )}
        </div>
      </div>

      {takeaways.length > 0 && (
        <div className="px-6 py-5 border-t border-border">
          <div className="relative pl-5">
            <span
              aria-hidden
              className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-gradient-to-b from-brand to-transparent"
            />
            <div className="space-y-3">
              {takeaways.map((t, i) => (
                <p
                  key={i}
                  className="font-display text-[1.05rem] leading-snug text-fg"
                >
                  {t}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SqlSolvePanel({
  problem,
  puzzle,
  categoryName,
  livePainting,
  onSolved,
}: {
  problem: SQLProblem;
  puzzle: CodePuzzle | undefined;
  categoryName: string;
  livePainting: {
    artworkId: string;
    baselineTiles: number;
    potentialTiles: number;
  };
  onSolved: (clean: boolean, hintsUsed: number) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Problem strip — mirrors DSA SolvePanel */}
      <div className="rounded-xl border border-border bg-bg-elevated p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
              <span>{categoryName} · in the wild</span>
            </div>
            <div className="mt-1.5 font-display text-[1.3rem] text-fg leading-tight">
              {problem.title}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
        </div>
        {problem.approach && (
          <div className="mt-4 border-l-2 border-brand bg-brand/[0.04] px-3 py-2.5 rounded-r-lg">
            <div className="text-[10px] uppercase tracking-widest text-brand flex items-center gap-1.5">
              <Lightbulb className="h-3 w-3" /> The shape
            </div>
            <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
              {problem.approach}
            </p>
          </div>
        )}
      </div>

      {puzzle ? (
        <CodeBlockPuzzle
          key={puzzle.id}
          puzzle={puzzle}
          livePainting={livePainting}
          onSolved={onSolved}
        />
      ) : (
        <p className="text-sm text-zinc-500 italic">
          No puzzle available for this problem.
        </p>
      )}
    </div>
  );
}

/**
 * Echo card — SQL-specific reflection. Mirrors the DSA EchoStep shape
 * (day-complete header, saved-notes strip, mark grid, next-day pointer) but
 * pulls its content from the SQL problem rather than a pattern + problems.
 */
function SqlEchoCard({
  day,
  problem,
  puzzleOutcome,
  marked,
  onMark,
  copy,
  onSave,
  onComplete,
  baselineTiles,
  currentTiles,
}: {
  day: number;
  problem: (typeof SQL_PROBLEMS)[number];
  puzzleOutcome: { clean: boolean; hintsUsed: number } | null;
  marked: MemoryStatus | null;
  onMark: (s: MemoryStatus) => void;
  copy: ReturnType<typeof coachCopy>;
  onSave: (entry: Omit<PlaybookEntry, "id" | "createdAt">) => void;
  onComplete: () => void;
  baselineTiles: number;
  currentTiles: number;
}) {
  // Auto-save the SQL note to the playbook the moment Echo mounts — same
  // contract as DSA's EchoCard. One entry per problem, keyed by problem.id
  // with the SQL category as patternId so /playbook can surface it.
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const confidence: 1 | 2 | 3 | 4 | 5 = !puzzleOutcome
      ? 3
      : puzzleOutcome.clean && puzzleOutcome.hintsUsed === 0
        ? 5
        : puzzleOutcome.clean && puzzleOutcome.hintsUsed <= 2
          ? 4
          : puzzleOutcome.hintsUsed >= 4
            ? 2
            : 3;
    onSave({
      patternId: problem.categoryId,
      problemId: `sql:${problem.id}`,
      day,
      rememberLine: (problem.rememberThis || problem.title).trim(),
      pitfall: problem.pitfalls[0],
      confidence,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const tileDelta = Math.max(0, currentTiles - baselineTiles);
  const closing = (() => {
    if (!puzzleOutcome) return copy.closingEmpty;
    if (puzzleOutcome.clean && puzzleOutcome.hintsUsed === 0)
      return copy.closingClean;
    if (puzzleOutcome.clean) return copy.closingHinted;
    return copy.closingStruggled;
  })();

  const outcomeBadge = (() => {
    if (!puzzleOutcome) return "Captured";
    if (puzzleOutcome.clean && puzzleOutcome.hintsUsed === 0)
      return "Clean solve";
    if (puzzleOutcome.clean)
      return `Solved · ${puzzleOutcome.hintsUsed} hint${puzzleOutcome.hintsUsed === 1 ? "" : "s"}`;
    return `${puzzleOutcome.hintsUsed} hint${puzzleOutcome.hintsUsed === 1 ? "" : "s"} used`;
  })();

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgb(var(--brand) / 0.06), transparent)",
        }}
      />
      <div className="relative p-6 md:p-8">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
              <Trophy className="h-3 w-3 text-brand" />
              Beat 3 · Review
              <span className="opacity-50">· ~1 min</span>
            </div>
            <h2 className="mt-2 font-display text-2xl md:text-[1.8rem] text-fg leading-tight">
              Day complete.
            </h2>
            <p className="mt-1 text-[0.85rem] text-zinc-500 max-w-xl leading-relaxed">
              {closing}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Saved notes strip */}
          <div className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand">
              <Feather className="h-3 w-3" />
              Saved to your notes
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-500 normal-case tracking-normal">
                {outcomeBadge}
              </span>
            </div>
            <div className="px-5 pb-5">
              <div className="border-l-[2px] border-brand pl-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {problem.title}
                </div>
                <p className="mt-1.5 font-display text-[1.05rem] leading-snug text-fg">
                  {problem.rememberThis}
                </p>
              </div>
              {problem.pitfalls.length > 0 && (
                <div className="mt-5 border-l-[2px] border-border pl-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Watch out for
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {problem.pitfalls.slice(0, 2).map((p) => (
                      <li
                        key={p}
                        className="text-[12px] text-zinc-400 leading-snug"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-border bg-bg-subtle/30 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] text-zinc-500 inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-success" />
                Saved
              </span>
              <Link
                href="/sql/library"
                className="text-[11px] text-zinc-600 hover:text-fg inline-flex items-center gap-1 transition-colors"
              >
                Browse SQL library <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* How did it go? */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
              How did it go?
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(
                [
                  { s: "tried", label: "Tried it" },
                  { s: "solved_with_help", label: "Solved w/ help" },
                  { s: "solved_alone", label: "Solved alone" },
                  { s: "mastered", label: "Mastered" },
                ] as { s: MemoryStatus; label: string }[]
              ).map((o) => (
                <Button
                  key={o.s}
                  variant={
                    o.s === "solved_alone" || o.s === "mastered"
                      ? "primary"
                      : "secondary"
                  }
                  className={cn(marked === o.s && "ring-2 ring-brand/60")}
                  onClick={() => onMark(o.s)}
                >
                  {o.label}
                </Button>
              ))}
            </div>
            {marked && (
              <div className="mt-3 text-xs text-zinc-500">
                {copy.echoSavedSql}
              </div>
            )}
          </div>

          {/* Painting reveal — same component DSA uses, fed from the shared
              gallery via the `sql:${id}` key so SQL solves paint tiles on
              the same gallery DSA does. */}
          <div className="space-y-3">
            {tileDelta > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-accent font-medium">
                <Sparkles className="h-3 w-3" />+{tileDelta} tile
                {tileDelta === 1 ? "" : "s"} restored just now
              </div>
            )}
            <ProblemPaintingReveal
              problemId={`sql:${problem.id}`}
              problemTitle={problem.title}
              baselineTiles={baselineTiles}
              currentTiles={currentTiles}
            />
            <div className="flex items-center justify-end">
              <Link
                href="/sql/progress"
                className="text-[11px] text-zinc-600 hover:text-fg inline-flex items-center gap-1 transition-colors"
              >
                See the gallery <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-border/60">
            <Button onClick={onComplete}>
              Finish day {day} <ArrowRight className="h-4 w-4" />
            </Button>
            <span className="text-xs text-zinc-600">
              Progress auto-saves. Pause anytime.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

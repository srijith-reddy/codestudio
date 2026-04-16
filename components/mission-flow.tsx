"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Feather,
  Lightbulb,
  Palette,
  Plus,
  RotateCcw,
  Sparkles,
  Sunrise,
  Target,
  Puzzle as PuzzleIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { PROBLEM_MAP, PROBLEMS } from "@/lib/data/problems";
import { puzzleForProblem, hasPuzzle } from "@/lib/data/puzzles";
import { buildPlan } from "@/lib/data/plan";
import { coachCopy, type CoachCopy } from "@/lib/data/coach";
import { ArtworkCanvas } from "@/components/artwork-canvas";
import { CodeBlockPuzzle } from "@/components/code-blocks";
import { CurriculumAssistant } from "@/components/assistant";
import {
  ARTWORK_ORDER,
  artworkForProblem,
  TILES_PER_PROBLEM,
} from "@/lib/data/artwork";
import { cn } from "@/lib/utils";
import type {
  CodePuzzle,
  MissionStepKind,
  Pattern,
  Problem,
} from "@/lib/types";

export const STEP_ORDER: MissionStepKind[] = ["warmup", "solve", "echo"];

const STEP_META: Record<
  MissionStepKind,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    minutes: number;
  }
> = {
  warmup: { label: "Warm up", icon: Lightbulb, minutes: 3 },
  solve: { label: "Solve", icon: PuzzleIcon, minutes: 10 },
  echo: { label: "Review", icon: Feather, minutes: 1 },
};

// Tone-varied tagline + purpose per step. Coach copy lives in lib/data/coach.
export function stepCopy(
  step: MissionStepKind,
  copy: CoachCopy,
): { tagline: string; purpose: string } {
  switch (step) {
    case "warmup":
      return { tagline: copy.warmupTagline, purpose: copy.warmupPurpose };
    case "solve":
      return { tagline: copy.solveTagline, purpose: copy.solvePurpose };
    case "echo":
      return { tagline: copy.echoTagline, purpose: copy.echoPurpose };
  }
}

export function MissionFlow() {
  const [hydrated, setHydrated] = useState(false);
  const prefs = useApp((s) => s.prefs);
  const startTimestamp = useApp((s) => s.startTimestamp);
  const startDayOffset = useApp((s) => s.startDayOffset);
  const currentMissionStep = useApp((s) => s.currentMissionStep);
  const completeMissionStep = useApp((s) => s.completeMissionStep);
  const missionCompletion = useApp((s) => s.missionCompletion);
  const missionProgress = useApp((s) => s.missionProgress);
  const markPuzzle = useApp((s) => s.markPuzzle);
  const addPlaybookEntry = useApp((s) => s.addPlaybookEntry);
  const problemArtProgress = useApp((s) => s.problemArtProgress);
  const recordSolveScore = useApp((s) => s.recordSolveScore);
  const dueForReview = useApp((s) => s.dueForReview);

  const [activeStep, setActiveStep] = useState<MissionStepKind>("warmup");
  const [solveIndex, setSolveIndex] = useState(0);
  const [puzzleOutcomes, setPuzzleOutcomes] = useState<
    Record<string, { clean: boolean; hintsUsed: number }>
  >({});
  const [tilesBeforeByProblem, setTilesBeforeByProblem] = useState<
    Record<string, number>
  >({});
  const activeRef = useRef<HTMLDivElement>(null);

  // Scoring-side state. We measure wall-clock time per problem (reset each
  // time a new problem is opened on Solve) and count "back navigations" —
  // any step back in the flow, whether to a previous problem on Solve or
  // from Solve back to Warmup. Each solve's score debits the running count
  // and resets it so penalties attribute to the solve that "paid for them".
  const [solveStartedAt, setSolveStartedAt] = useState<Record<string, number>>(
    {},
  );
  const backNavCountRef = useRef<number>(0);

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!hydrated) return;
    setActiveStep(currentMissionStep());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, currentMissionStep, missionProgress]);

  const planLength = prefs.planLength || 30;
  const plan = useMemo(() => buildPlan(planLength), [planLength]);
  const day = useMemo(() => {
    if (!startTimestamp) return 1 + (startDayOffset || 0);
    const d =
      Math.floor((Date.now() - startTimestamp) / 86_400_000) +
      1 +
      (startDayOffset || 0);
    return Math.max(1, Math.min(d, planLength));
  }, [startTimestamp, planLength, startDayOffset]);

  const dayPlan = plan[day - 1] || plan[0];
  const pattern = PATTERN_MAP[dayPlan.patternFocus];

  // Today's problems: prefer plan-assigned new problems that (a) match the
  // day's pattern focus and (b) have an authored puzzle. Fall back to the
  // first 2 pattern problems with puzzles so the flow never crashes.
  const todayProblems = useMemo<Problem[]>(() => {
    const fromPlan = dayPlan.newProblems
      .map((id) => PROBLEM_MAP[id])
      .filter(
        (p): p is Problem =>
          Boolean(p) && p.patternId === pattern.id && hasPuzzle(p.id),
      );
    if (fromPlan.length > 0) return fromPlan;
    return PROBLEMS.filter(
      (p) => p.patternId === pattern.id && hasPuzzle(p.id),
    ).slice(0, 2);
  }, [dayPlan, pattern.id]);

  const todayPuzzles = useMemo<(CodePuzzle | undefined)[]>(
    () => todayProblems.map((p) => puzzleForProblem(p.id)),
    [todayProblems],
  );
  const currentProblem: Problem | undefined =
    todayProblems[solveIndex] || todayProblems[0];
  const currentPuzzle: CodePuzzle | undefined =
    todayPuzzles[solveIndex] || todayPuzzles[0];

  const completion = hydrated ? missionCompletion() : 0;
  const today = new Date().toISOString().slice(0, 10);
  const completedSteps = missionProgress[today]?.completedSteps || [];
  const isStepDone = (s: MissionStepKind) => completedSteps.includes(s);

  const advance = (s: MissionStepKind) => {
    completeMissionStep(s);
    const nextIdx = Math.min(STEP_ORDER.indexOf(s) + 1, STEP_ORDER.length - 1);
    setActiveStep(STEP_ORDER[nextIdx]);
    setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const goToStep = (s: MissionStepKind) => {
    const prevIdx = STEP_ORDER.indexOf(activeStep);
    const nextIdx = STEP_ORDER.indexOf(s);
    if (prevIdx >= 0 && nextIdx >= 0 && nextIdx < prevIdx) {
      backNavCountRef.current += 1;
    }
    setActiveStep(s);
    setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleSelectProblem = (nextIndex: number) => {
    if (nextIndex < solveIndex) {
      backNavCountRef.current += 1;
    }
    setSolveIndex(nextIndex);
  };

  // Start the solve timer when the user arrives at Solve or switches to a
  // new problem. If they've already solved it we skip — rescoring a solved
  // puzzle would be punitive.
  useEffect(() => {
    if (activeStep !== "solve") return;
    const pid = todayProblems[solveIndex]?.id;
    if (!pid) return;
    if (puzzleOutcomes[pid]) return;
    setSolveStartedAt((prev) =>
      prev[pid] ? prev : { ...prev, [pid]: Date.now() },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, solveIndex, todayProblems]);

  if (!hydrated) {
    return <div className="h-64 rounded-3xl animate-pulse bg-bg-subtle" />;
  }

  const solvedCount = todayProblems.filter(
    (p) => puzzleOutcomes[p.id],
  ).length;

  const handleSolveOutcome = (
    problemId: string,
    clean: boolean,
    hintsUsed: number,
  ) => {
    setTilesBeforeByProblem((prev) => ({
      ...prev,
      [problemId]: prev[problemId] ?? problemArtProgress[problemId] ?? 0,
    }));
    markPuzzle(problemId, clean, hintsUsed);
    setPuzzleOutcomes((prev) => ({
      ...prev,
      [problemId]: { clean, hintsUsed },
    }));

    // Score the solve: time since the solve timer started, hint usage, and
    // back-nav count since the last scored solve. Reset both counters so the
    // next problem gets a fresh budget.
    const startedAt = solveStartedAt[problemId] || Date.now();
    const timeMs = Math.max(0, Date.now() - startedAt);
    const backNavs = backNavCountRef.current;
    backNavCountRef.current = 0;
    recordSolveScore({
      problemId,
      day,
      timeMs,
      hintsUsed,
      backNavs,
      clean,
    });
  };

  const advanceSolve = () => {
    const nextIdx = solveIndex + 1;
    if (nextIdx < todayProblems.length) {
      setSolveIndex(nextIdx);
    } else {
      advance("solve");
    }
  };

  const dueIds = hydrated ? dueForReview() : [];
  // Suppress the strip on review/rest days when today's focus pattern already
  // has a due problem in it — otherwise the banner just repeats the hero's
  // intent. On new-problem days we always show if anything is overdue.
  const todayIds = new Set(todayProblems.map((p) => p.id));
  const extraDueIds =
    dayPlan.kind === "new"
      ? dueIds
      : dueIds.filter((id) => !todayIds.has(id));

  return (
    <div className="space-y-4">
      {extraDueIds.length > 0 && dayPlan.kind === "new" && (
        <div className="rounded-xl border border-border bg-bg-elevated p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
            <RotateCcw className="h-3 w-3 text-brand" />
            {extraDueIds.length} problem
            {extraDueIds.length === 1 ? "" : "s"} due for review
          </div>
          <p className="mt-1 text-[12px] text-zinc-500 max-w-xl">
            Spaced repetition says these are the ones you&rsquo;re about to
            forget. A quick revisit keeps them sharp.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {extraDueIds.slice(0, 6).map((id) => {
              const p = PROBLEM_MAP[id];
              if (!p) return null;
              return (
                <Link
                  key={id}
                  href={`/problems/${id}`}
                  className="rounded-full border border-border bg-bg-subtle px-3 py-1 text-[11px] text-zinc-300 hover:border-brand/40 hover:text-fg transition-colors"
                >
                  {p.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <MissionHero
        day={day}
        planLength={planLength}
        theme={dayPlan.theme}
        pattern={pattern}
        completion={completion}
        kind={dayPlan.kind}
        onBegin={() => goToStep(currentMissionStep())}
      />

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
                <WarmUpPanel
                  pattern={pattern}
                  problems={todayProblems}
                  puzzles={todayPuzzles}
                />
              </StepCard>
            )}

            {activeStep === "solve" && (
              <StepCard
                step="solve"
                onComplete={advanceSolve}
                ctaLabel={
                  solveIndex + 1 < todayProblems.length
                    ? "Next problem"
                    : "Close the day"
                }
              >
                {currentProblem && currentPuzzle ? (
                  <SolvePanel
                    pattern={pattern}
                    problem={currentProblem}
                    puzzle={currentPuzzle}
                    solveIndex={solveIndex}
                    total={todayProblems.length}
                    solvedCount={solvedCount}
                    allProblems={todayProblems}
                    puzzleOutcomes={puzzleOutcomes}
                    onSelectProblem={handleSelectProblem}
                    solveStartedAt={solveStartedAt[currentProblem.id]}
                    livePainting={{
                      artworkId: artworkForProblem(currentProblem.id).id,
                      baselineTiles:
                        problemArtProgress[currentProblem.id] || 0,
                      potentialTiles: Math.max(
                        0,
                        TILES_PER_PROBLEM -
                          (problemArtProgress[currentProblem.id] || 0),
                      ),
                    }}
                    onSolved={(clean, hintsUsed) =>
                      handleSolveOutcome(
                        currentProblem.id,
                        clean,
                        hintsUsed,
                      )
                    }
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-fg-subtle">
                    No puzzle authored for this pattern yet.
                  </div>
                )}
              </StepCard>
            )}

            {activeStep === "echo" && (
              <EchoCard
                pattern={pattern}
                problems={todayProblems}
                day={day}
                puzzleOutcomes={puzzleOutcomes}
                onSave={(entry) => addPlaybookEntry(entry)}
                onComplete={() => advance("echo")}
                problemArtProgress={problemArtProgress}
                tilesBeforeByProblem={tilesBeforeByProblem}
                nextDayPlan={plan[day] || null}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CurriculumAssistant
        context={{
          problem: currentProblem,
          pattern,
          puzzle: currentPuzzle,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────

function MissionHero({
  day,
  planLength,
  theme,
  pattern,
  completion,
  kind,
  onBegin,
}: {
  day: number;
  planLength: number;
  theme: string;
  pattern: Pattern;
  completion: number;
  kind: "new" | "review" | "rest";
  onBegin: () => void;
}) {
  const beginLabel =
    completion === 0
      ? "Begin today"
      : completion === 100
        ? "Revisit today"
        : "Continue";

  const isReview = kind === "review";
  const isRest = kind === "rest";
  const HeroIcon = isReview || isRest ? RotateCcw : Sunrise;
  const kindLabel = isReview
    ? "Review day"
    : isRest
      ? "Mastery day"
      : null;

  return (
    <section className="relative overflow-hidden md:rounded-2xl bg-bg-elevated">
      <div className="absolute inset-0 hero-radial pointer-events-none" aria-hidden />
      <div className="relative p-6 md:p-9">
        <div className="text-[0.62rem] uppercase tracking-widest text-zinc-600 flex items-center gap-2 flex-wrap">
          <HeroIcon className="h-3 w-3 text-brand" />
          Day {day} of {planLength}
          {kindLabel && (
            <>
              <span className="opacity-40">·</span>
              <span className="text-brand/90">{kindLabel}</span>
            </>
          )}
          <span className="opacity-40">—</span>
          <span className="truncate opacity-70">{theme}</span>
        </div>
        <h1 className="mt-2.5 font-display text-2xl md:text-[2.2rem] text-fg leading-[1.1] max-w-2xl">
          {isReview ? (
            <>
              Let&rsquo;s revisit{" "}
              <span className="text-brand italic">{pattern.name}</span> — drill
              what&rsquo;s fading.
            </>
          ) : isRest ? (
            <>
              A quieter day — deepen{" "}
              <span className="text-brand italic">{pattern.name}</span> without
              the rush.
            </>
          ) : (
            <>
              Today you&rsquo;ll make{" "}
              <span className="text-brand italic">{pattern.name}</span>{" "}
              feel like muscle memory.
            </>
          )}
        </h1>
        {(isReview || isRest) && (
          <p className="mt-3 text-[12px] text-zinc-500 max-w-lg leading-relaxed">
            {isReview
              ? "Spaced repetition pulls this pattern back up so it sticks. Same flow, half the effort."
              : "No new patterns today. Sit with what you’ve built."}
          </p>
        )}
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <Button size="lg" onClick={onBegin}>
            {beginLabel} <ArrowRight className="h-4 w-4" />
          </Button>
          {isReview && <Badge tone="brand">Spaced review</Badge>}
          {isRest && <Badge tone="brand">Mastery</Badge>}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 3-beat rail (desktop + mobile share the same compact layout now)
// ─────────────────────────────────────────────────────────────────────

export function StepRail({
  activeStep,
  onSelect,
  isDone,
}: {
  activeStep: MissionStepKind;
  onSelect: (s: MissionStepKind) => void;
  isDone: (s: MissionStepKind) => boolean;
}) {
  const tone = useApp((st) => st.prefs.tone);
  const copy = coachCopy(tone);
  return (
    <div className="grid grid-cols-3 divide-x divide-border border-y border-border">
      {STEP_ORDER.map((s, i) => {
        const meta = STEP_META[s];
        const Icon = meta.icon;
        const { tagline } = stepCopy(s, copy);
        const done = isDone(s);
        const active = s === activeStep;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            className={cn(
              "relative px-4 py-4 text-left transition-colors",
              active ? "" : "hover:bg-white/[0.02]",
            )}
          >
            {/* Active underline */}
            {active && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
            )}
            <div className="flex items-center gap-2">
              {done ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    active ? "text-brand" : "text-zinc-600",
                  )}
                />
              )}
              <span className="text-[9px] uppercase tracking-widest text-zinc-600">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div
              className={cn(
                "mt-2 text-sm font-display",
                active ? "text-fg" : done ? "text-zinc-400" : "text-zinc-500",
              )}
            >
              {meta.label}
            </div>
            <div className="text-[11px] text-zinc-600">{tagline}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// StepCard shell
// ─────────────────────────────────────────────────────────────────────

export function StepCard({
  step,
  children,
  onComplete,
  ctaLabel,
}: {
  step: MissionStepKind;
  children: React.ReactNode;
  onComplete: () => void;
  ctaLabel: string;
}) {
  const meta = STEP_META[step];
  const Icon = meta.icon;
  const stepIdx = STEP_ORDER.indexOf(step);
  const tone = useApp((s) => s.prefs.tone);
  const { tagline, purpose } = stepCopy(step, coachCopy(tone));

  return (
    <div className="border-b border-border pt-6 pb-8">
      <div className="mb-6 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
          <Icon className="h-3 w-3 text-brand" />
          Beat {stepIdx + 1} · {meta.label}
          <span className="opacity-50">· ~{meta.minutes} min</span>
        </div>
        <h2 className="mt-2 font-display text-2xl md:text-[1.8rem] text-fg leading-tight">
          {tagline}.
        </h2>
        <p className="mt-1 text-[0.85rem] text-zinc-500 max-w-xl leading-relaxed">
          {purpose}
        </p>
      </div>
      <div>{children}</div>
      <div className="mt-8 flex items-center gap-4 flex-wrap">
        <Button onClick={onComplete}>
          {ctaLabel} <ArrowRight className="h-4 w-4" />
        </Button>
        <span className="text-xs text-zinc-600">
          Progress auto-saves. Pause anytime.
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Warm Up — orient + line-by-line primer, merged
// ─────────────────────────────────────────────────────────────────────

/**
 * Heuristic commentary for blocks that have no structural check. Keeps the
 * right-hand column alive without demanding an `explain` string per block on
 * all 131 puzzles. Falls through to `null` when nothing clean applies — the
 * row still renders, just without a note.
 */
function blockCommentary(code: string, hasBlank: boolean): string | null {
  const c = code.trim();
  if (!c) return null;
  if (hasBlank) return "You'll fill this one in during Solve.";
  if (/^def\s+\w+\s*\(/.test(c)) return "Function signature — the entry point.";
  if (/^class\s+\w+/.test(c)) return "Class header.";
  if (/^from\s+\w|^import\s+\w/.test(c)) return "Standard-library import.";
  if (/^return\b/.test(c)) return "Final answer handed back to the caller.";
  if (/^for\s+.+\sin\s/.test(c)) return "Iterate one step at a time.";
  if (/^while\s+/.test(c)) return "Loop until the condition breaks.";
  if (/^if\s+.+:/.test(c)) return "Guard — branch only when this holds.";
  if (/^elif\s+/.test(c)) return "Alternative branch.";
  if (/^else:?$/.test(c)) return "Fallback branch.";
  if (/\.append\(/.test(c)) return "Push onto the running collection.";
  if (/heapq\.heappush/.test(c)) return "Push onto the heap — O(log n).";
  if (/heapq\.heappop/.test(c)) return "Pop the smallest — O(log n).";
  if (/\.popleft\(\)/.test(c)) return "Dequeue from the front.";
  if (/\bbreak\b/.test(c)) return "Bail out of the loop.";
  if (/\bcontinue\b/.test(c)) return "Skip to the next iteration.";
  if (/=\s*\{\}|=\s*dict\(\)/.test(c)) return "Seed an empty dict for lookups.";
  if (/=\s*set\(\)/.test(c)) return "Seed an empty set for membership.";
  if (/=\s*\[\]/.test(c)) return "Seed an empty list for accumulation.";
  if (/=\s*deque\(/.test(c)) return "Queue for BFS / two-ended access.";
  if (/=\s*0\b/.test(c)) return "Counter starts at zero.";
  return null;
}

function WarmUpPanel({
  pattern,
  problems,
  puzzles,
}: {
  pattern: Pattern;
  problems: Problem[];
  puzzles: (CodePuzzle | undefined)[];
}) {
  return (
    <div className="space-y-5">
      {/* Core idea — left accent bar, no full border */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-l-[3px] border-brand bg-bg-elevated px-6 py-5 rounded-r-xl"
      >
        <div className="text-[10px] uppercase tracking-widest text-brand">
          The one idea
        </div>
        <p className="mt-3 font-display italic text-[1.1rem] text-fg leading-relaxed max-w-2xl">
          {pattern.coreIdea}
        </p>
      </motion.div>

      {/* Recall triggers */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="space-y-4"
      >
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 flex items-center gap-2">
          <Target className="h-3 w-3 text-brand" /> Use this pattern when you see
        </div>
        <ul className="space-y-4">
          {problems.map((p) => (
            <li key={p.id} className="flex items-start gap-3">
              <span className="mt-[7px] h-[5px] w-[5px] rounded-full bg-brand/60 shrink-0" />
              <div className="min-w-0">
                <div className="italic text-zinc-200 text-sm">
                  &ldquo;{p.title}&rdquo;
                </div>
                <div className="mt-0.5 text-[12px] text-zinc-500 leading-relaxed">
                  {p.learningObjective}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-zinc-600 text-center">
          Both problems use the same pattern — just in different situations.
        </p>
      </motion.div>

      {/* Today's problem preview(s) with inline commentary */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">
          Today you&rsquo;ll build · line by line
        </div>
        <div className="space-y-5">
          {problems.map((problem, pi) => {
            const puzzle = puzzles[pi];
            if (!puzzle) return null;
            return (
              <ProblemPreviewCard
                key={problem.id}
                problem={problem}
                puzzle={puzzle}
                index={pi}
                total={problems.length}
              />
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-zinc-600 text-center">
        Don&rsquo;t worry about memorising every line. Focus on the overall structure.
      </p>
    </div>
  );
}

// Per-problem preview card with click-to-reveal line pacing. Keeps the warmup
// calm and controlled: one line appears at a time as the user clicks through.
function ProblemPreviewCard({
  problem,
  puzzle,
  index,
  total,
}: {
  problem: Problem;
  puzzle: CodePuzzle;
  index: number;
  total: number;
}) {
  const [revealed, setRevealed] = useState(1);
  const totalLines = puzzle.blocks.length;
  const done = revealed >= totalLines;

  const checkByBlock = useMemo(() => {
    const m = new Map<string, string>();
    (puzzle.structuralChecks || []).forEach((c) => {
      if (!m.has(c.blockId)) m.set(c.blockId, c.issue);
    });
    return m;
  }, [puzzle.structuralChecks]);

  // Single source for takeaways — the problem's authored `rememberThis`,
  // split on sentence boundaries so each idea gets its own bullet. We
  // deliberately ignore `puzzle.remember` here to avoid paraphrase overlap.
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
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
      className="rounded-xl border border-border bg-bg-elevated overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 flex-wrap bg-bg-subtle/30">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
            <span>
              Problem {index + 1} of {total}
            </span>
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
            const note =
              checkByBlock.get(b.id) ||
              blockCommentary(b.code, Boolean(b.blank));
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
                <code
                  className="font-mono text-xs text-zinc-200 whitespace-pre leading-relaxed self-center"
                  style={{ paddingLeft: (b.indent ?? 0) * 14 }}
                >
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

      {/* Reveal controls */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3 flex-wrap bg-bg-subtle/20">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 tabular-nums font-mono">
          {revealed}/{totalLines}
          <span className="text-zinc-700 font-sans">lines</span>
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

/**
 * Live elapsed-time counter for the Solve page. Ticks once per second from
 * `startedAt` until `frozen` goes true (i.e. the user solved the puzzle),
 * at which point the display freezes on the final elapsed reading.
 */
function LiveSolveTimer({
  startedAt,
  frozen,
}: {
  startedAt?: number;
  frozen: boolean;
}) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!startedAt || frozen) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, frozen]);
  if (!startedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-2.5 py-1 text-[11px] text-fg-subtle font-mono tabular-nums">
        <span className="h-1.5 w-1.5 rounded-full bg-fg-subtle/40" />
        00:00
      </span>
    );
  }
  const elapsed = Math.max(0, now - startedAt);
  const mins = Math.floor(elapsed / 60_000);
  const secs = Math.floor((elapsed % 60_000) / 1000);
  const mm = mins.toString().padStart(2, "0");
  const ss = secs.toString().padStart(2, "0");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-mono tabular-nums",
        frozen
          ? "border-border bg-bg-elevated text-fg-muted"
          : "border-accent/40 bg-accent/10 text-fg",
      )}
      title={frozen ? "Final solve time" : "Elapsed — counts toward your score"}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          frozen ? "bg-fg-subtle/40" : "bg-accent animate-pulse",
        )}
      />
      {mm}:{ss}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Solve — problem-bound, blocks-only, live painting
// ─────────────────────────────────────────────────────────────────────

function SolvePanel({
  pattern,
  problem,
  puzzle,
  solveIndex,
  total,
  solvedCount,
  livePainting,
  onSolved,
  allProblems,
  puzzleOutcomes,
  onSelectProblem,
  solveStartedAt,
}: {
  pattern: Pattern;
  problem: Problem;
  puzzle: CodePuzzle;
  solveIndex: number;
  total: number;
  solvedCount: number;
  livePainting: {
    artworkId: string;
    baselineTiles: number;
    potentialTiles: number;
  };
  onSolved: (clean: boolean, hintsUsed: number) => void;
  allProblems: Problem[];
  puzzleOutcomes: Record<string, { clean: boolean; hintsUsed: number }>;
  onSelectProblem: (i: number) => void;
  solveStartedAt?: number;
}) {
  const canPrev = solveIndex > 0;
  const canNext = solveIndex + 1 < total;
  const alreadySolved = Boolean(puzzleOutcomes[problem.id]);

  return (
    <div className="space-y-5">
      {/* Problem tab bar — pill tabs */}
      {total > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => canPrev && onSelectProblem(solveIndex - 1)}
            disabled={!canPrev}
            className={cn(
              "h-8 w-8 rounded-full border flex items-center justify-center transition-colors shrink-0",
              canPrev
                ? "border-white/20 text-zinc-400 hover:bg-white/[0.08] hover:text-fg"
                : "border-border/30 text-zinc-700 cursor-not-allowed",
            )}
            aria-label="Previous problem"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
          </button>
          <div className="flex-1 flex gap-2 flex-wrap">
            {allProblems.map((p, i) => {
              const active = i === solveIndex;
              const outcome = puzzleOutcomes[p.id];
              const done = Boolean(outcome);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProblem(i)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs transition-all min-w-0 border",
                    active
                      ? "bg-brand text-brand-fg border-transparent font-semibold"
                      : done
                        ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-400/10"
                        : "border-white/20 text-zinc-400 hover:bg-white/[0.08] hover:text-fg",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {done && <Check className="h-3 w-3" />}
                    <span className="truncate">{p.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => canNext && onSelectProblem(solveIndex + 1)}
            disabled={!canNext}
            className={cn(
              "h-8 w-8 rounded-full border flex items-center justify-center transition-colors shrink-0",
              canNext
                ? "border-white/20 text-zinc-400 hover:bg-white/[0.08] hover:text-fg"
                : "border-border/30 text-zinc-700 cursor-not-allowed",
            )}
            aria-label="Next problem"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Problem strip */}
      <div className="rounded-xl border border-border bg-bg-elevated p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
              <span>{pattern.name} · in the wild</span>
              {total > 1 && (
                <>
                  <span className="opacity-40">·</span>
                  <span>
                    {solveIndex + 1} of {total}
                    {solvedCount > 0 && ` · ${solvedCount} done`}
                  </span>
                </>
              )}
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
            <Badge tone="neutral">~{problem.estimatedMinutes}m</Badge>
          </div>
        </div>
        {problem.optimalInsight && (
          <div className="mt-4 border-l-2 border-brand bg-brand/[0.04] px-3 py-2.5 rounded-r-lg">
            <div className="text-[10px] uppercase tracking-widest text-brand flex items-center gap-1.5">
              <Lightbulb className="h-3 w-3" /> The insight
            </div>
            <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
              {problem.optimalInsight}
            </p>
          </div>
        )}
      </div>

      {/* Block puzzle with live painting */}
      <CodeBlockPuzzle
        key={puzzle.id}
        puzzle={puzzle}
        livePainting={livePainting}
        onSolved={onSolved}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Echo — auto-reflect + painting reveal + tomorrow, one card
// ─────────────────────────────────────────────────────────────────────

function EchoCard({
  pattern,
  problems,
  day,
  puzzleOutcomes,
  onSave,
  onComplete,
  problemArtProgress,
  tilesBeforeByProblem,
  nextDayPlan,
}: {
  pattern: Pattern;
  problems: Problem[];
  day: number;
  puzzleOutcomes: Record<string, { clean: boolean; hintsUsed: number }>;
  onSave: (entry: {
    patternId: string;
    problemId?: string;
    day: number;
    rememberLine: string;
    confidence: 1 | 2 | 3 | 4 | 5;
  }) => void;
  onComplete: () => void;
  problemArtProgress: Record<string, number>;
  tilesBeforeByProblem: Record<string, number>;
  nextDayPlan: { patternFocus: string; theme: string } | null;
}) {
  const meta = STEP_META.echo;
  const Icon = meta.icon;
  const stepIdx = STEP_ORDER.indexOf("echo");
  const todayScore = useApp((s) => s.todayScore());

  // Aggregate outcome across today's solves for the pattern-level reflection.
  const aggregate = useMemo(() => {
    const entries = problems
      .map((p) => puzzleOutcomes[p.id])
      .filter(Boolean) as { clean: boolean; hintsUsed: number }[];
    if (entries.length === 0) return null;
    const clean = entries.every((e) => e.clean);
    const hintsUsed = entries.reduce((a, e) => a + e.hintsUsed, 0);
    return { clean, hintsUsed };
  }, [problems, puzzleOutcomes]);

  const primaryProblem = problems[0];

  // Auto-generated remember line from pattern + outcome
  const generated = useMemo(() => {
    const trigger = pattern.triggers[0] ?? pattern.name;
    if (primaryProblem?.rememberThis) return primaryProblem.rememberThis;
    if (!aggregate) return `"${trigger}" → reach for ${pattern.name}.`;
    const { clean, hintsUsed } = aggregate;
    if (clean && hintsUsed === 0)
      return `${pattern.name} felt automatic — "${trigger}" unlocks it.`;
    if (clean && hintsUsed <= 2)
      return `${pattern.name} landed after a nudge — watch for "${trigger}".`;
    if (hintsUsed >= 4)
      return `${pattern.name} needed hints today — "${trigger}" is the cue to watch for.`;
    return `${pattern.name}: ${pattern.tagline.toLowerCase()}`;
  }, [pattern, primaryProblem, aggregate]);

  const confidence: 1 | 2 | 3 | 4 | 5 = useMemo(() => {
    if (!aggregate) return 3;
    const { clean, hintsUsed } = aggregate;
    if (clean && hintsUsed === 0) return 5;
    if (clean && hintsUsed <= 2) return 4;
    if (hintsUsed >= 4) return 2;
    return 3;
  }, [aggregate]);

  const savedRef = useRef(false);

  // Auto-save the moment Echo mounts. One playbook entry per problem —
  // each carrying that problem's authored rememberThis line. No edit UI.
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    if (problems.length === 0) {
      onSave({
        patternId: pattern.id,
        problemId: primaryProblem?.id,
        day,
        rememberLine: generated,
        confidence,
      });
      return;
    }
    problems.forEach((p) => {
      onSave({
        patternId: pattern.id,
        problemId: p.id,
        day,
        rememberLine: (p.rememberThis || generated).trim(),
        confidence,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tomorrowPattern = nextDayPlan
    ? PATTERN_MAP[nextDayPlan.patternFocus]
    : null;

  const totalDelta = problems.reduce((acc, p) => {
    const now = problemArtProgress[p.id] || 0;
    const before = tilesBeforeByProblem[p.id] ?? now;
    return acc + Math.max(0, now - before);
  }, 0);

  const tone = useApp((s) => s.prefs.tone);
  const closingCopy = coachCopy(tone);
  const closing = (() => {
    if (!aggregate) return closingCopy.closingEmpty;
    if (aggregate.clean && aggregate.hintsUsed === 0)
      return closingCopy.closingClean;
    if (aggregate.clean) return closingCopy.closingHinted;
    return closingCopy.closingStruggled;
  })();

  const outcomeBadge = (() => {
    if (!aggregate) return "Captured";
    if (aggregate.clean && aggregate.hintsUsed === 0) return "Clean solves";
    if (aggregate.clean)
      return `Solved · ${aggregate.hintsUsed} hint${aggregate.hintsUsed === 1 ? "" : "s"}`;
    return `${aggregate.hintsUsed} hint${aggregate.hintsUsed === 1 ? "" : "s"} used`;
  })();

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgb(var(--brand) / 0.06), transparent)" }}
      />
      <div className="relative p-6 md:p-8">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
              <Icon className="h-3 w-3 text-brand" />
              Beat {stepIdx + 1} · {meta.label}
              <span className="opacity-50">· ~{meta.minutes} min</span>
            </div>
            <h2 className="mt-2 font-display text-2xl md:text-[1.8rem] text-fg leading-tight">
              Day complete.
            </h2>
            <p className="mt-1 text-[0.85rem] text-zinc-500 max-w-xl leading-relaxed">{closing}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Keepers — border-l per item, no full card border */}
          <div className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand">
              <Feather className="h-3 w-3" />
              Saved to your notes
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-500 normal-case tracking-normal">
                {outcomeBadge}
              </span>
            </div>
            <div className="px-5 pb-5 space-y-4">
              {problems.map((p, i) => {
                const lineText = (p.rememberThis || generated).trim();
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "border-l-[2px] border-brand pl-4",
                      i > 0 && "pt-4",
                    )}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      {p.title}
                    </div>
                    <p className="mt-1.5 font-display text-[1.05rem] leading-snug text-fg">
                      {lineText}
                    </p>
                  </div>
                );
              })}
              {problems.length === 0 && (
                <p className="border-l-[2px] border-brand pl-4 font-display text-[1.05rem] leading-snug text-fg">
                  {generated}
                </p>
              )}
            </div>
            <div className="px-5 py-3 border-t border-border bg-bg-subtle/30 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] text-zinc-500 inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-success" />
                {problems.length > 1
                  ? `${problems.length} notes saved`
                  : "Saved"}
              </span>
              <Link
                href="/playbook"
                className="text-[11px] text-zinc-600 hover:text-fg inline-flex items-center gap-1 transition-colors"
              >
                See your notes <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Optional custom note — appears as a quiet "+ Add your own note" link */}
          <CustomNoteAdder
            patternId={pattern.id}
            day={day}
            onSave={onSave}
          />

          {/* Today's score — personal best tracking, no leaderboard yet */}
          {todayScore && todayScore.totalPoints > 0 && (
            <DayScoreCard score={todayScore} problems={problems} />
          )}

          {/* Painting reveal — one card per today's problem */}
          <div className="space-y-6">
            {totalDelta > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-accent font-medium">
                <Sparkles className="h-3 w-3" />
                +{totalDelta} tile{totalDelta === 1 ? "" : "s"} restored just
                now across today&rsquo;s canvases
              </div>
            )}
            <div
              className={cn(
                "grid gap-5",
                problems.length > 1 ? "md:grid-cols-2" : "grid-cols-1",
              )}
            >
              {problems.map((p) => (
                <ProblemPaintingReveal
                  key={p.id}
                  problemId={p.id}
                  problemTitle={p.title}
                  baselineTiles={tilesBeforeByProblem[p.id] ?? 0}
                  currentTiles={problemArtProgress[p.id] || 0}
                />
              ))}
            </div>
          </div>

          {/* Tomorrow teaser */}
          {tomorrowPattern && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.35,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-xl border border-dashed border-white/[0.15] p-5"
            >
              <div className="flex items-start gap-4">
                <Sunrise className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">
                    Tomorrow
                  </div>
                  <div className="mt-0.5 text-sm text-fg">
                    <span className="font-display">
                      {tomorrowPattern.name}
                    </span>
                    <span className="text-zinc-500">
                      {" "}
                      — {tomorrowPattern.tagline.toLowerCase()}
                    </span>
                  </div>
                  {nextDayPlan?.theme && (
                    <div className="mt-1 text-[11px] text-zinc-600">
                      {nextDayPlan.theme}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-10 flex items-center gap-4 flex-wrap">
          <Button onClick={onComplete}>
            Done for today <ArrowRight className="h-4 w-4" />
          </Button>
          <Link
            href="/progress"
            className="text-[11px] text-zinc-600 hover:text-fg inline-flex items-center gap-1 transition-colors"
          >
            See your progress <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Day score breakdown — Echo's personal-best panel
// ─────────────────────────────────────────────────────────────────────

function DayScoreCard({
  score,
  problems,
}: {
  score: import("@/lib/types").DayScoreRecord;
  problems: Problem[];
}) {
  const rows = problems
    .map((p) => ({ problem: p, rec: score.perProblem[p.id] }))
    .filter((r) => r.rec);

  const fmtTime = (ms: number) => {
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem.toString().padStart(2, "0")}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-xl border border-border bg-bg-elevated overflow-hidden"
    >
      <div className="px-5 py-5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
            <Target className="h-3 w-3 text-brand" />
            Today&rsquo;s score
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-5xl text-brand tabular-nums">
              {score.totalPoints}
            </span>
            <span className="text-[11px] text-zinc-600">points</span>
          </div>
        </div>
        <Link
          href="/progress"
          className="text-[11px] text-zinc-600 hover:text-fg inline-flex items-center gap-1 transition-colors"
        >
          Score history <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {rows.length > 0 && (
        <div className="border-t border-border divide-y divide-border">
          {rows.map(({ problem, rec }) => (
            <div
              key={problem.id}
              className="px-5 py-3 grid grid-cols-[1fr_auto] items-center gap-3"
            >
              <div className="min-w-0">
                <div className="text-[13px] text-zinc-200 truncate">
                  {problem.title}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10.5px] text-zinc-600 tabular-nums flex-wrap">
                  <span>{fmtTime(rec.timeMs)}</span>
                  <span className="opacity-40">·</span>
                  <span>{rec.hintsUsed} hint{rec.hintsUsed === 1 ? "" : "s"}</span>
                  <span className="opacity-40">·</span>
                  <span>{rec.backNavs} back-nav{rec.backNavs === 1 ? "" : "s"}</span>
                  {rec.clean && (
                    <span className="rounded-full bg-emerald-400/15 text-emerald-400 text-[9px] px-2 py-0.5 uppercase tracking-wide">
                      clean
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl text-brand tabular-nums">
                  +{rec.pointsEarned}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Custom note adder — optional, collapses after save
// ─────────────────────────────────────────────────────────────────────

function CustomNoteAdder({
  patternId,
  day,
  onSave,
}: {
  patternId: string;
  day: number;
  onSave: (entry: {
    patternId: string;
    day: number;
    rememberLine: string;
    confidence: 1 | 2 | 3 | 4 | 5;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave({ patternId, day, rememberLine: trimmed, confidence: 3 });
    setText("");
    setSaved(true);
    setOpen(false);
  };

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-success">
        <Check className="h-3.5 w-3.5" /> Your note was added to the playbook.
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add your own note
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            key="note-form"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-border bg-bg-elevated overflow-hidden"
          >
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 mb-2">
                <Feather className="h-3 w-3 text-brand" /> Your note
              </div>
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="e.g. the key was initialising the map before the loop, not inside it"
                className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-zinc-600 outline-none focus:border-brand/60 leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
                }}
              />
            </div>
            <div className="px-4 pb-3 flex items-center gap-3">
              <Button size="sm" onClick={handleSave} disabled={!text.trim()}>
                Save note <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <button
                type="button"
                onClick={() => { setOpen(false); setText(""); }}
                className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <span className="ml-auto text-[10px] text-zinc-700">⌘ Enter to save</span>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Per-problem painting reveal — animates tiles from baseline → current
// ─────────────────────────────────────────────────────────────────────

export function ProblemPaintingReveal({
  problemId,
  problemTitle,
  baselineTiles,
  currentTiles,
}: {
  problemId: string;
  problemTitle: string;
  baselineTiles: number;
  currentTiles: number;
}) {
  const art = useMemo(() => artworkForProblem(problemId), [problemId]);
  const [displayTiles, setDisplayTiles] = useState(baselineTiles);
  const [revealed, setRevealed] = useState(false);
  const delta = Math.max(0, currentTiles - baselineTiles);

  useEffect(() => {
    setDisplayTiles(baselineTiles);
    if (delta <= 0) {
      setDisplayTiles(currentTiles);
      setRevealed(true);
      return;
    }
    let step = 0;
    const id = setInterval(
      () => {
        step += 1;
        setDisplayTiles(baselineTiles + step);
        if (step >= delta) {
          clearInterval(id);
          setRevealed(true);
        }
      },
      Math.max(40, Math.min(120, 700 / delta)),
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-4 space-y-3">
      <ArtworkCanvas
        artworkId={art.id}
        tilesRevealed={displayTiles}
        height={220}
      />
      <div className="flex items-start gap-2 flex-wrap">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-fg-subtle truncate">
            {problemTitle}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-sm">
            <Palette className="h-3.5 w-3.5 text-brand/60" />
            <span className="font-display text-zinc-300 truncate">
              {art.title}
            </span>
            <span className="text-zinc-600 text-[11px] truncate">
              · {art.artist}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <AnimatePresence mode="wait">
            {revealed && delta > 0 && (
              <motion.span
                key="delta"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] text-brand font-medium inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/[0.08] px-2 py-0.5"
              >
                <Sparkles className="h-3 w-3" />+{delta}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="text-[10px] text-fg-subtle">
            {currentTiles}/{TILES_PER_PROBLEM}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Keep exported so other call sites (if any) still compile; unused here.
// ─────────────────────────────────────────────────────────────────────

export function RevealRow({
  open,
  onToggle,
  label,
  subtitle,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-bg-subtle/40 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? (
            <EyeOff className="h-3.5 w-3.5 text-fg-muted shrink-0" />
          ) : (
            <Eye className="h-3.5 w-3.5 text-fg-muted shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-xs text-fg font-medium">{label}</div>
            {subtitle && (
              <div className="text-[10px] text-fg-subtle italic truncate">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 text-fg-subtle transition-transform shrink-0",
            open && "rotate-90",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Preserve a named export so ARTWORK_ORDER stays referenced.
export const __ARTWORK_ORDER_REF = ARTWORK_ORDER;

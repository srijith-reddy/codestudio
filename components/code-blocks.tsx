"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  RotateCcw,
  X,
  GripVertical,
  Lightbulb,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import type {
  CodeBlock,
  CodePuzzle,
  PuzzleHint,
  StructuralCheck,
  TraceExample,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArtworkCanvas } from "@/components/artwork-canvas";

/**
 * Block-based code assembler with a progressive hint ladder.
 *
 * Interaction:
 *  - Click a pool block → append to solution
 *  - Click a solution block → return to pool
 *  - Fill-in-the-blank blocks expose an inline input
 *  - "Nudge me forward" button steps through a 5-rung hint ladder. Hints
 *    escalate gently: plain-English goal → structural advice → highlighted
 *    next block → near-complete reveal.
 *  - Every wrong-answer check surfaces the single most educational issue
 *    via per-puzzle structuralChecks (e.g. "seen must be initialized before
 *    the for-loop"), not a generic "try again".
 *
 * Scoring:
 *  - 0 hints + first-try = "clean" → `onSolved(clean=true)` → 2 art tiles
 *  - any hints used / wrong attempts → `onSolved(clean=false)` → 1 tile
 *  - giving up via Reset doesn't cost anything
 */
export function CodeBlockPuzzle({
  puzzle,
  onSolved,
  onHintUsed,
  livePainting,
  key: _key,
}: {
  puzzle: CodePuzzle;
  onSolved?: (cleanFirstTry: boolean, hintsUsed: number) => void;
  onHintUsed?: (level: number) => void;
  /**
   * When provided, renders a large painting above the puzzle that reveals
   * tiles in real time as the user places blocks correctly. The reveal is
   * a *preview* of the tile reward the user is about to earn — when the
   * puzzle solves, the store commits those tiles and the preview stays.
   */
  livePainting?: {
    artworkId: string;
    baselineTiles: number;
    potentialTiles: number;
  };
  key?: string;
}) {
  const canonicalIds = useMemo(
    () => puzzle.blocks.map((b) => b.id),
    [puzzle],
  );
  const hints = puzzle.hints || [];

  const [pool, setPool] = useState<CodeBlock[]>(() => shuffle(puzzle.blocks));
  const [solution, setSolution] = useState<CodeBlock[]>([]);
  const [blanks, setBlanks] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0); // 0 = none, 1..5 = rungs revealed
  const [status, setStatus] = useState<"idle" | "wrong" | "solved">("idle");
  const [feedback, setFeedback] = useState<string>("");
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    setPool(shuffle(puzzle.blocks));
    setSolution([]);
    setBlanks({});
    setAttempts(0);
    setHintLevel(0);
    setStatus("idle");
    setFeedback("");
    setHintOpen(false);
  }, [puzzle.id]);

  const currentHint = hintLevel > 0 ? hints[hintLevel - 1] : undefined;
  const highlightedBlockId = currentHint?.highlightBlock;

  const addBlock = (b: CodeBlock) => {
    setPool((p) => p.filter((x) => x.id !== b.id));
    setSolution((s) => [...s, b]);
    if (status !== "idle") {
      setStatus("idle");
      setFeedback("");
    }
  };

  const removeBlock = (b: CodeBlock) => {
    setSolution((s) => s.filter((x) => x.id !== b.id));
    setPool((p) => [...p, b]);
    if (status !== "idle") {
      setStatus("idle");
      setFeedback("");
    }
  };

  const reset = () => {
    setPool(shuffle(puzzle.blocks));
    setSolution([]);
    setBlanks({});
    setStatus("idle");
    setFeedback("");
  };

  /**
   * Advance the hint ladder by one rung. Each hint may also materially
   * reorganize the pool/solution (e.g. highlight a block, pre-place most
   * blocks on L5). Higher hints mean a "supported solve" — still valuable,
   * but not a clean-first-try.
   */
  const takeHint = () => {
    if (hintLevel >= hints.length) {
      setHintOpen(true);
      return;
    }
    const next = hintLevel + 1;
    const hint = hints[next - 1];
    setHintLevel(next);
    setHintOpen(true);
    onHintUsed?.(next);

    // Materialize structural hint effects
    if (hint?.placeBlocks && hint.placeBlocks.length > 0) {
      const byId = new Map(puzzle.blocks.map((b) => [b.id, b]));
      const placed = hint.placeBlocks
        .map((id) => byId.get(id))
        .filter((b): b is CodeBlock => Boolean(b));
      const placedIds = new Set(placed.map((b) => b.id));
      setSolution((s) => {
        const preserved = s.filter((b) => !placedIds.has(b.id));
        const ordered = canonicalIds
          .map((id) => placed.find((b) => b.id === id))
          .filter((b): b is CodeBlock => Boolean(b));
        const tail = preserved.filter((b) => !placedIds.has(b.id));
        return [...ordered, ...tail];
      });
      setPool((p) => p.filter((b) => !placedIds.has(b.id)));
    }
  };

  const check = () => {
    setAttempts((n) => n + 1);

    // Complete?
    if (solution.length < canonicalIds.length) {
      setStatus("wrong");
      const missing = canonicalIds.length - solution.length;
      setFeedback(
        `You have ${solution.length} of ${canonicalIds.length} pieces placed. ${missing} more to go — the shape isn't complete yet.`,
      );
      return;
    }

    // Order check
    const firstMismatch = solution.findIndex(
      (b, i) => b.id !== canonicalIds[i],
    );

    if (firstMismatch >= 0) {
      setStatus("wrong");
      const actual = solution[firstMismatch];
      const expected = puzzle.blocks.find((b) => b.id === canonicalIds[firstMismatch]);
      const structural = findStructuralMessage(
        puzzle.structuralChecks || [],
        solution,
        canonicalIds,
      );
      if (structural) {
        setFeedback(structural);
      } else {
        setFeedback(
          `Position ${firstMismatch + 1}: \`${truncate(actual.code, 38)}\` doesn't belong here yet — try \`${truncate(expected?.code || "", 38)}\` in this slot.`,
        );
      }
      return;
    }

    // Blanks check
    const wrongBlank = puzzle.blocks.find((b) => {
      if (!b.blank) return false;
      const user = (blanks[b.id] || "").trim();
      return normalize(user) !== normalize(b.blank.answer);
    });
    if (wrongBlank) {
      setStatus("wrong");
      setFeedback(
        `The blank in \`${truncate(wrongBlank.code, 32)}\` isn't quite right — think about: ${wrongBlank.blank?.placeholder || "what belongs there"}.`,
      );
      return;
    }

    // Clean!
    setStatus("solved");
    setFeedback(puzzle.remember);
    onSolved?.(attempts === 0 && hintLevel === 0, hintLevel);
  };

  // Live "how many blocks are in the correct canonical position" count.
  // We walk the solution from the top and stop at the first mismatch — this
  // matches how the canonical check thinks about progress and makes the
  // painting reveal feel honest (only correct placements restore tiles).
  const correctPlaced = useMemo(() => {
    let n = 0;
    for (let i = 0; i < solution.length; i++) {
      if (solution[i].id === canonicalIds[i]) n += 1;
      else break;
    }
    return n;
  }, [solution, canonicalIds]);

  const livePreviewTiles = livePainting
    ? livePainting.baselineTiles +
      Math.round(
        (correctPlaced / Math.max(1, canonicalIds.length)) *
          livePainting.potentialTiles,
      )
    : 0;

  return (
    <div className="space-y-5">
      {/* Live painting reveal — the metaphor inside the action */}
      {livePainting && (
        <div className="relative">
          <ArtworkCanvas
            artworkId={livePainting.artworkId}
            tilesRevealed={livePreviewTiles}
            height={260}
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] flex-wrap">
            <span className="text-fg-subtle italic">
              Each correctly-placed block restores a tile in real time.
            </span>
            {correctPlaced > 0 && correctPlaced < canonicalIds.length && (
              <motion.span
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-accent font-medium"
              >
                {correctPlaced} / {canonicalIds.length} blocks in place ·{" "}
                {livePreviewTiles - livePainting.baselineTiles} tile
                {livePreviewTiles - livePainting.baselineTiles === 1 ? "" : "s"}{" "}
                painting
              </motion.span>
            )}
          </div>
        </div>
      )}

      {/* Puzzle header card */}
      <div className="rounded-2xl border border-border bg-bg-elevated p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-fg-muted">
              {puzzle.variant === "core"
                ? "Core puzzle"
                : puzzle.variant === "twist"
                  ? "Twist"
                  : "Diagnostic"}
            </div>
            <div className="mt-1 text-lg font-display font-semibold">
              {puzzle.title}
            </div>
            {puzzle.intent && (
              <p className="mt-2 text-sm text-fg-muted leading-relaxed max-w-2xl">
                {puzzle.intent}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-fg-subtle italic border-t border-border/50 pt-3">
          {puzzle.prompt}
        </p>
      </div>

      {/* Hint ladder display */}
      <AnimatePresence mode="wait">
        {hintOpen && currentHint && (
          <motion.div
            key={`hint-${currentHint.level}`}
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-accent/40 bg-accent/5 p-5"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-[11px] uppercase tracking-widest text-fg-muted">
                    Rung {currentHint.level} of {hints.length} · {currentHint.label}
                  </div>
                  <button
                    type="button"
                    onClick={() => setHintOpen(false)}
                    className="text-fg-subtle hover:text-fg text-[11px]"
                  >
                    hide
                  </button>
                </div>
                <p className="mt-2 text-sm text-fg leading-relaxed">
                  <RichFeedback text={currentHint.body} />
                </p>
                {currentHint.carryForward && (
                  <p className="mt-3 text-[11px] text-accent/90 italic leading-relaxed border-t border-accent/20 pt-2">
                    Carry forward → {currentHint.carryForward}
                  </p>
                )}
                {/* Rung indicator pips */}
                <div className="mt-3 flex items-center gap-1">
                  {hints.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        i < hintLevel
                          ? "bg-accent"
                          : "bg-border",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Pool */}
        <div className="rounded-2xl border border-border bg-bg-subtle/40 p-4 min-h-[260px]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-widest text-fg-subtle">
              Pool · {pool.length} pieces
            </div>
            {pool.length > 0 && solution.length === 0 && (
              <div className="text-[10px] text-fg-subtle italic">
                tap a piece to place it
              </div>
            )}
          </div>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {pool.map((b) => {
                const isHighlighted = b.id === highlightedBlockId;
                return (
                  <motion.li
                    key={b.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      type="button"
                      onClick={() => addBlock(b)}
                      className={cn(
                        "group w-full text-left rounded-xl border px-3 py-2 text-xs font-mono transition-all active:scale-[0.99] flex items-start gap-2",
                        isHighlighted
                          ? "border-accent bg-accent/10 text-fg shadow-[0_0_0_3px_rgb(var(--accent)/0.15)] animate-pulse"
                          : "border-border bg-bg-elevated text-fg-muted hover:border-brand hover:text-fg hover:bg-brand-soft/20",
                      )}
                    >
                      <GripVertical className="h-3.5 w-3.5 mt-0.5 text-fg-subtle shrink-0" />
                      <span className="whitespace-pre">{b.code}</span>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {pool.length === 0 && (
              <li className="text-[11px] italic text-fg-subtle text-center py-6">
                Every piece placed. Hit Check.
              </li>
            )}
          </ul>
        </div>

        {/* Solution */}
        <div
          className={cn(
            "rounded-2xl border p-4 min-h-[260px] transition-colors",
            status === "solved"
              ? "border-success/60 bg-success/5"
              : status === "wrong"
                ? "border-warning/60 bg-warning/5"
                : "border-border bg-bg-elevated/60",
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-widest text-fg-subtle">
              Your solution
            </div>
            <div className="text-[11px] text-fg-subtle">
              {solution.length} / {puzzle.blocks.length}
            </div>
          </div>
          <ol className="space-y-1.5">
            <AnimatePresence initial={false}>
              {solution.map((b) => (
                <motion.li
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ paddingLeft: b.indent * 14 }}
                >
                  <div className="flex items-center gap-2 group">
                    <span className="font-mono text-xs text-fg whitespace-pre flex-1 bg-bg-subtle/40 rounded-md px-2 py-1 border border-border/60">
                      {renderBlockWithBlank(b, blanks[b.id] || "", (v) =>
                        setBlanks((m) => ({ ...m, [b.id]: v })),
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBlock(b)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-fg-subtle hover:text-warning"
                      aria-label="Remove block"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
            {solution.length === 0 && (
              <li className="text-[11px] italic text-fg-subtle text-center py-10">
                Click pieces on the left to build the shape.
              </li>
            )}
          </ol>
        </div>
      </div>

      {/* Worked trace — concrete numbers stepping through the algorithm */}
      {puzzle.trace && <TraceStepper trace={puzzle.trace} />}

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={check}
            disabled={solution.length === 0}
          >
            <Check className="h-4 w-4" /> Check shape
          </Button>
          {hints.length > 0 && (
            <Button
              variant="secondary"
              onClick={takeHint}
              disabled={hintLevel >= hints.length}
            >
              <Lightbulb className="h-4 w-4" />
              {hintLevel === 0
                ? "Show me a nudge"
                : hintLevel >= hints.length
                  ? "All rungs revealed"
                  : `Rung ${hintLevel + 1} of ${hints.length}`}
            </Button>
          )}
          <Button variant="secondary" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Start over
          </Button>
          <div className="text-[11px] text-fg-subtle ml-auto">
            {attempts > 0 && `${attempts} attempt${attempts === 1 ? "" : "s"}`}
            {hintLevel > 0 && (
              <span className={attempts > 0 ? "ml-2" : ""}>
                {attempts > 0 && "· "}
                <span className="text-accent">{hintLevel} rung{hintLevel === 1 ? "" : "s"}</span>
              </span>
            )}
          </div>
        </div>
        {status !== "solved" && (
          <p className="text-[11px] text-fg-subtle italic">
            Hints are part of the path, not a penalty. Every rung still
            restores tiles — it's about moving forward, always.
          </p>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence mode="wait">
        {status === "wrong" && feedback && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-fg"
          >
            <div className="flex items-start gap-2">
              <span className="text-warning font-medium shrink-0">Close —</span>
              <span className="text-fg-muted leading-relaxed">
                <RichFeedback text={feedback} />
              </span>
            </div>
            {hints.length > 0 && hintLevel < hints.length && (
              <button
                type="button"
                onClick={takeHint}
                className="mt-2 text-[11px] text-accent hover:underline inline-flex items-center gap-1"
              >
                <Lightbulb className="h-3 w-3" /> Take a hint — no judgment
              </button>
            )}
          </motion.div>
        )}
        {status === "solved" && (
          <motion.div
            key="solved"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-fg"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <div>
                <div className="text-success font-medium">
                  {solveHeadline(attempts, hintLevel)}
                </div>
                <div className="text-fg-muted mt-0.5 italic">
                  {feedback}
                </div>
                <div className="text-[11px] text-fg-subtle mt-2">
                  {hintLevel === 0 && attempts === 1
                    ? "Three tiles of the canvas will restore."
                    : hintLevel <= 2
                      ? "Two tiles will restore. Hints still count."
                      : "One tile will restore. You kept going — that's what matters."}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function solveHeadline(attempts: number, hintLevel: number): string {
  if (attempts === 1 && hintLevel === 0) return "Clean rebuild.";
  if (hintLevel <= 1) return "Solved, clean shape.";
  if (hintLevel <= 3) return "Solved, with a hand on your back.";
  return "Solved together.";
}

/**
 * Parse a feedback string with backticks like "Try `seen = {}` here" and
 * render the backticked chunks as inline code. Avoids showing literal
 * backticks to the user — which looked like a bug in the old version.
 */
function RichFeedback({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="inline-block rounded-md bg-bg/60 border border-border px-1.5 py-0.5 text-[11px] font-mono text-fg mx-0.5 align-baseline"
          >
            {part}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/**
 * Pick the most educational structural message for the current solution.
 * We prefer a check whose block is actually misplaced relative to its
 * `mustBeBefore` / `mustBeAfter` anchor — that's a concrete, fixable issue.
 */
function findStructuralMessage(
  checks: StructuralCheck[],
  solution: CodeBlock[],
  canonical: string[],
): string | null {
  const positions = new Map<string, number>();
  solution.forEach((b, i) => positions.set(b.id, i));

  for (const check of checks) {
    const pos = positions.get(check.blockId);
    if (pos === undefined) continue;
    if (check.mustBeBefore !== undefined) {
      const otherPos = positions.get(check.mustBeBefore);
      if (otherPos !== undefined && pos >= otherPos) {
        return check.issue;
      }
    }
    if (check.mustBeAfter !== undefined) {
      const otherPos = positions.get(check.mustBeAfter);
      if (otherPos !== undefined && pos <= otherPos) {
        return check.issue;
      }
    }
  }
  return null;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").replace(/['"]/g, '"').trim();
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

/**
 * Walks the user through a concrete input, frame by frame, showing variable
 * values on each step. The stepper is optional on every puzzle — patterns
 * that don't benefit from tracing (e.g. pure definition puzzles) just skip it.
 *
 * Playback: manual step forward/back, or tap Auto to cycle. We never auto-play
 * on mount — surprise motion is obnoxious.
 */
export function TraceStepper({ trace }: { trace: TraceExample }) {
  const [frame, setFrame] = useState(0);
  const [auto, setAuto] = useState(false);
  const total = trace.frames.length;
  const current = trace.frames[frame];

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setFrame((f) => {
        if (f + 1 >= total) {
          setAuto(false);
          return f;
        }
        return f + 1;
      });
    }, 1100);
    return () => clearInterval(id);
  }, [auto, total]);

  const varEntries = Object.entries(current.vars);

  return (
    <div className="rounded-2xl border border-border bg-bg-subtle/30 p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-fg-subtle">
            Walk it through with real numbers
          </div>
          <div className="mt-0.5 text-xs text-fg">
            <span className="text-fg-muted">Input:</span>{" "}
            <code className="font-mono text-fg">{trace.input}</code>
            <span className="text-fg-subtle">  →  </span>
            <span className="text-fg-muted">Output:</span>{" "}
            <code className="font-mono text-fg">{trace.output}</code>
          </div>
        </div>
        <div className="text-[10px] text-fg-subtle font-mono">
          step {frame + 1} / {total}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
        {/* Variable panel */}
        <div className="rounded-xl border border-border bg-bg-elevated/60 p-4 min-h-[120px]">
          {varEntries.length === 0 ? (
            <div className="text-[11px] italic text-fg-subtle">
              no locals yet
            </div>
          ) : (
            <ul className="space-y-1.5">
              {varEntries.map(([k, v]) => (
                <motion.li
                  layout
                  key={k}
                  className="flex items-center gap-2 text-xs font-mono"
                >
                  <span className="text-fg-subtle">{k}</span>
                  <span className="text-fg-subtle">=</span>
                  <motion.span
                    key={`${k}:${v}`}
                    initial={{ backgroundColor: "rgba(110, 200, 255, 0.18)" }}
                    animate={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
                    transition={{ duration: 0.9 }}
                    className="rounded px-1.5 py-0.5 text-fg"
                  >
                    {v}
                  </motion.span>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {/* Controls */}
        <div className="flex md:flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setFrame((f) => Math.max(0, f - 1))}
            disabled={frame === 0}
            className="h-9 w-9 rounded-lg border border-border bg-bg-elevated text-fg-muted disabled:opacity-40 hover:text-fg hover:border-brand flex items-center justify-center"
            aria-label="Previous step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (frame + 1 >= total) {
                setFrame(0);
                setAuto(false);
              } else {
                setFrame((f) => Math.min(total - 1, f + 1));
              }
            }}
            className="h-9 w-9 rounded-lg border border-brand bg-brand-soft/40 text-fg flex items-center justify-center"
            aria-label="Next step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (frame + 1 >= total) setFrame(0);
              setAuto((a) => !a);
            }}
            className={cn(
              "h-9 w-9 rounded-lg border flex items-center justify-center transition-colors",
              auto
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-bg-elevated text-fg-muted hover:text-fg",
            )}
            aria-label="Auto play"
          >
            <Play className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Commentary for current frame */}
      <AnimatePresence mode="wait">
        <motion.p
          key={frame}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="mt-3 text-xs text-fg-muted leading-relaxed"
        >
          <RichFeedback text={current.note} />
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function renderBlockWithBlank(
  block: CodeBlock,
  value: string,
  onChange: (v: string) => void,
) {
  if (!block.blank) return block.code;
  const idx = block.code.indexOf(block.blank.answer);
  if (idx === -1) return block.code;
  const before = block.code.slice(0, idx);
  const after = block.code.slice(idx + block.blank.answer.length);
  return (
    <>
      <span>{before}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={block.blank.placeholder || "…"}
        className="inline-block bg-brand-soft/30 border border-brand/40 rounded px-1.5 py-0 text-[11px] font-mono text-fg outline-none focus:border-brand min-w-[60px]"
        style={{ width: Math.max(60, (value.length + 2) * 7) }}
      />
      <span>{after}</span>
    </>
  );
}

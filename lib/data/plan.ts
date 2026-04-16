import type { DayPlan, PlanLength } from "@/lib/types";
import { PROBLEMS } from "./problems";
import { hasPuzzle } from "./puzzles";

/**
 * Adaptive pacing: the 30-day plan is the canonical source. For 60 and 90
 * we stretch each focus window so patterns get more breathing room, more
 * review, and more reconstruction — not more raw volume.
 *
 * Stretch factor:
 *   30  → ×1.0
 *   60  → ×2.0 (half the daily load, double the review density)
 *   90  → ×3.0 (weekly rest/mastery days plus deeper review)
 */
const CORE_30: { pattern: string; theme: string }[] = [
  { pattern: "arrays-hashing", theme: "Hash-first thinking" },
  { pattern: "arrays-hashing", theme: "Canonical keys" },
  { pattern: "arrays-hashing", theme: "Counting tricks" },
  { pattern: "arrays-hashing", theme: "Prefix / suffix passes" },
  { pattern: "two-pointers", theme: "Converging pointers" },
  { pattern: "two-pointers", theme: "Fix-and-sweep" },
  { pattern: "sliding-window", theme: "Variable-size window" },
  { pattern: "sliding-window", theme: "Invariant-driven shrink" },
  { pattern: "stack", theme: "LIFO memory" },
  { pattern: "stack", theme: "Monotonic stacks" },
  { pattern: "binary-search", theme: "Template mastery" },
  { pattern: "binary-search", theme: "Rotated arrays" },
  { pattern: "linked-list", theme: "Rewiring pointers" },
  { pattern: "linked-list", theme: "Fast / slow" },
  { pattern: "trees", theme: "Recursion shape" },
  { pattern: "trees", theme: "Level order BFS" },
  { pattern: "trees", theme: "Bounds & invariants" },
  { pattern: "heap", theme: "Top-K with heapq" },
  { pattern: "heap", theme: "Heap of tuples" },
  { pattern: "backtracking", theme: "Pick / skip" },
  { pattern: "backtracking", theme: "Start-index dedupe" },
  { pattern: "graphs", theme: "Grid flood fill" },
  { pattern: "graphs", theme: "Memoized DFS" },
  { pattern: "graphs", theme: "Multi-source BFS" },
  { pattern: "dp-1d", theme: "Recurrence first" },
  { pattern: "dp-1d", theme: "LIS family" },
  { pattern: "intervals", theme: "Sort & sweep" },
  { pattern: "arrays-hashing", theme: "Review week — hashing" },
  { pattern: "trees", theme: "Review week — trees" },
  { pattern: "graphs", theme: "Review week — graphs" },
];

/**
 * Expand the 30-slot core arc into `length` days.
 * Each core slot becomes `stretch` calendar days. Within a slot:
 *   - the first day introduces the new problems
 *   - follow-up days are review / reconstruction / rest
 */
function expandArc(length: PlanLength): { pattern: string; theme: string; kind: "new" | "review" | "rest" }[] {
  const stretch = Math.round(length / 30);
  const out: { pattern: string; theme: string; kind: "new" | "review" | "rest" }[] = [];
  CORE_30.forEach((slot) => {
    for (let i = 0; i < stretch; i++) {
      if (i === 0) {
        out.push({ ...slot, kind: "new" });
      } else if (i === stretch - 1 && stretch >= 3) {
        out.push({ ...slot, theme: `${slot.theme} · mastery`, kind: "rest" });
      } else {
        out.push({ ...slot, theme: `${slot.theme} · deepen`, kind: "review" });
      }
    }
  });
  return out.slice(0, length);
}

/**
 * Pick up to `target` problems from a pattern. Tries to include a mix of
 * Easy / Medium / Hard so each day has variety. Prefers problems with an
 * authored puzzle, falls back to any unused problem in the pattern.
 * `takenSoFar` tracks which problems have already been assigned earlier
 * in the arc so we don't repeat.
 */
function pickProblemsForPattern(
  patternId: string,
  takenSoFar: Set<string>,
  target: number,
): string[] {
  const pool = PROBLEMS.filter(
    (p) => p.patternId === patternId && !takenSoFar.has(p.id),
  );
  const withPuzzle = pool.filter((p) => hasPuzzle(p.id));
  const others = pool.filter((p) => !withPuzzle.includes(p));
  const ranked = [...withPuzzle, ...others];

  const picked: string[] = [];
  const pickFirstOfDifficulty = (d: "Easy" | "Medium" | "Hard") => {
    const match = ranked.find(
      (p) => p.difficulty === d && !picked.includes(p.id),
    );
    if (match) picked.push(match.id);
  };

  pickFirstOfDifficulty("Easy");
  pickFirstOfDifficulty("Medium");
  if (target >= 3) pickFirstOfDifficulty("Medium");
  if (target >= 4) pickFirstOfDifficulty("Hard");

  for (const p of ranked) {
    if (picked.length >= target) break;
    if (!picked.includes(p.id)) picked.push(p.id);
  }
  return picked;
}

export function buildPlan(length: PlanLength): DayPlan[] {
  const arc = expandArc(length);
  const taken = new Set<string>();

  // Problems per new day scales with plan length. 30-day is the "serious
  // sprint" — 4 problems/day means ~120 of the 131-problem curriculum get
  // covered across 30 new days. 60 and 90 day plans space things out.
  const problemsPerNewDay = length === 30 ? 4 : length === 60 ? 3 : 2;

  return arc.map((slot, idx) => {
    const day = idx + 1;
    const isNewDay = slot.kind === "new";

    const newProblems = isNewDay
      ? pickProblemsForPattern(slot.pattern, taken, problemsPerNewDay)
      : [];
    newProblems.forEach((id) => taken.add(id));

    // Reviews: pull from nearby earlier days
    const reviewLookback = length === 30 ? [1, 3, 7] : length === 60 ? [2, 5, 11] : [3, 7, 14];
    const reviewSources = reviewLookback
      .map((d) => day - d)
      .filter((d) => d >= 1)
      .flatMap((d) => {
        const candidateSlot = arc[d - 1];
        if (!candidateSlot || candidateSlot.kind !== "new") return [];
        // Surface the easy from that past day as a review nudge.
        return PROBLEMS.filter(
          (p) => p.patternId === candidateSlot.pattern && hasPuzzle(p.id),
        )
          .slice(0, 1)
          .map((p) => p.id);
      });

    return {
      day,
      patternFocus: slot.pattern,
      newProblems,
      reviewProblems: reviewSources,
      reconstruct: [],
      theme: slot.theme,
      kind: slot.kind,
    };
  });
}

// Default export for legacy consumers — 30-day plan.
export const PLAN: DayPlan[] = buildPlan(30);
export const PLAN_BY_DAY: Record<number, DayPlan> = Object.fromEntries(
  PLAN.map((p) => [p.day, p]),
);

import { SQL_PROBLEMS } from "@/lib/data/sql";
import type { SQLProblem } from "@/lib/types";

/**
 * SQL day planner — decides whether a given day is a "new problem" day or a
 * "review" day, and which problem the user should face.
 *
 * Why we need this: the curriculum has a fixed pool of SQL problems (~50),
 * but users pick 30/60/90 day plans. Naive modulo mapping repeats problems
 * before all have been introduced. Instead:
 *
 * - 30-day plan: compress the 50 problems into 30 days (first 30 problems).
 * - 60-day plan: 50 new-problem days + 10 review days, evenly interleaved.
 * - 90-day plan: 50 new-problem days + 40 review days (nearly every other day).
 *
 * Review days don't pick via modulo — they consult the SRS queue so the
 * problem the user is most likely to have forgotten surfaces first. If the
 * SRS queue is empty (e.g. user jumped to day 40 without solving anything
 * prior), we fall back to cycling through already-introduced problems.
 */

export type SqlDaySlot =
  | { kind: "new"; problem: SQLProblem; newIndex: number }
  | { kind: "review"; problem: SQLProblem; reviewIndex: number };

/**
 * Compute the slot for a given day. `srsDue` is the ordered list of problem
 * ids the store considers due for review (oldest-first). `solvedIds` is the
 * set of problems the user has ever touched — used as a fallback pool when
 * nothing is strictly due yet.
 */
export function sqlDaySlot(
  day: number,
  planLength: number,
  srsDue: string[],
  solvedIds: string[],
): SqlDaySlot | null {
  if (SQL_PROBLEMS.length === 0) return null;
  const totalProblems = SQL_PROBLEMS.length;
  const clampedDay = Math.max(1, Math.min(day, planLength));

  // Plan shorter than or equal to the problem pool: compress.
  if (planLength <= totalProblems) {
    const idx = Math.floor(((clampedDay - 1) * totalProblems) / planLength);
    const problem = SQL_PROBLEMS[Math.min(idx, totalProblems - 1)];
    return { kind: "new", problem, newIndex: idx };
  }

  // Plan longer than the pool: reserve `extra` slots for review, interleave.
  const extra = planLength - totalProblems;
  // After every `cadence`th day we insert a review. cadence >= 2 so we
  // don't review on back-to-back days unless we truly have to.
  const cadence = Math.max(
    2,
    Math.floor((totalProblems + extra) / Math.max(1, extra)),
  );
  const isReviewDay = clampedDay > 1 && clampedDay % cadence === 0;

  if (isReviewDay) {
    const reviewIndex = Math.floor(clampedDay / cadence) - 1;
    // Pick from SRS queue first; fall back to cycling already-introduced
    // problems. If neither, fall back to SQL_PROBLEMS cycled deterministically.
    const pickFrom =
      srsDue.length > 0
        ? srsDue
        : solvedIds.length > 0
          ? solvedIds
          : SQL_PROBLEMS.map((p) => p.id);
    const chosenId = pickFrom[reviewIndex % pickFrom.length];
    const problem =
      SQL_PROBLEMS.find((p) => p.id === chosenId) ?? SQL_PROBLEMS[0];
    return { kind: "review", problem, reviewIndex };
  }

  // New-problem day — count how many review days have been inserted before
  // this day, then index into SQL_PROBLEMS with the remainder.
  const reviewsBefore = Math.floor((clampedDay - 1) / cadence);
  const newIndex = Math.min(
    totalProblems - 1,
    clampedDay - 1 - reviewsBefore,
  );
  return { kind: "new", problem: SQL_PROBLEMS[newIndex], newIndex };
}

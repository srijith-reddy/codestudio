import type {
  CodeBlock,
  CodePuzzle,
  PuzzleHint,
  SQLProblem,
  StructuralCheck,
} from "@/lib/types";
import { SQL_PROBLEMS } from "@/lib/data/sql";

/**
 * SQL puzzles are derived from each problem's authored `finalCode` + `hints`
 * rather than hand-authored block-by-block. SQL queries split cleanly along
 * clause keywords, which makes the derivation reliable — and it means every
 * one of the 50+ SQL 50 problems gets a blocks-first puzzle for free.
 *
 * The split rule: any line that starts with a canonical SQL clause keyword
 * at column 0 begins a new block. Indented / continuation lines fold into
 * the prior block. That keeps multi-line SELECT projections, chained
 * JOIN … ON … AND … fragments, and CTE bodies as single blocks — which is
 * how a human would read them anyway.
 *
 * Structural checks enforce the one unbreakable SQL rule: clause ordering.
 * SELECT < FROM < JOIN < WHERE < GROUP BY < HAVING < ORDER BY < LIMIT.
 * (CTEs with WITH are always first and don't need a check because the user
 * can't put them after another clause without it being obviously wrong.)
 */

// Clauses the splitter recognises as top-level. Order matters for the
// structural-check ordering; it's the canonical SQL execution order.
const CLAUSE_PATTERNS: { re: RegExp; key: string; rank: number }[] = [
  { re: /^WITH\b/i, key: "WITH", rank: 0 },
  { re: /^SELECT\b/i, key: "SELECT", rank: 1 },
  { re: /^FROM\b/i, key: "FROM", rank: 2 },
  { re: /^(INNER|LEFT|RIGHT|FULL|CROSS)\s+JOIN\b/i, key: "JOIN", rank: 3 },
  { re: /^JOIN\b/i, key: "JOIN", rank: 3 },
  { re: /^WHERE\b/i, key: "WHERE", rank: 4 },
  { re: /^GROUP\s+BY\b/i, key: "GROUP BY", rank: 5 },
  { re: /^HAVING\b/i, key: "HAVING", rank: 6 },
  { re: /^(UNION|INTERSECT|EXCEPT)\b/i, key: "UNION", rank: 7 },
  { re: /^ORDER\s+BY\b/i, key: "ORDER BY", rank: 8 },
  { re: /^LIMIT\b/i, key: "LIMIT", rank: 9 },
  { re: /^OFFSET\b/i, key: "OFFSET", rank: 10 },
];

function clauseOf(line: string): { key: string; rank: number } | null {
  // A "top-level" clause line has no leading whitespace.
  if (/^\s/.test(line)) return null;
  for (const p of CLAUSE_PATTERNS) {
    if (p.re.test(line)) return { key: p.key, rank: p.rank };
  }
  return null;
}

interface RawBlock {
  key: string;
  rank: number;
  lines: string[];
}

function splitIntoClauseBlocks(finalCode: string): RawBlock[] {
  // Strip a trailing semicolon; it's noise for the puzzle.
  const cleaned = finalCode.replace(/;\s*$/, "");
  const lines = cleaned.split("\n");
  const blocks: RawBlock[] = [];
  let current: RawBlock | null = null;
  for (const raw of lines) {
    if (raw.trim().length === 0) continue;
    const clause = clauseOf(raw);
    if (clause) {
      if (current) blocks.push(current);
      current = { key: clause.key, rank: clause.rank, lines: [raw] };
    } else if (current) {
      current.lines.push(raw);
    } else {
      // No current block yet but we hit a continuation line — treat it as
      // a standalone block so nothing is dropped. Shouldn't happen with
      // well-formed SQL.
      current = { key: "?", rank: -1, lines: [raw] };
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

/**
 * Derive progressive hints from the problem's own hint list. If the problem
 * has fewer than 3 hints we pad the front with a plain-English goal.
 */
function deriveHints(problem: SQLProblem): PuzzleHint[] {
  const rungs: PuzzleHint[] = [];
  // L1: plain-English goal, always pulled from the problem's learning
  // objective so the hint ladder opens with a "what you're building" frame.
  rungs.push({
    level: 1,
    label: "The goal",
    body: problem.learningObjective,
    carryForward: problem.rememberThis,
  });
  // L2: the problem's approach — the "shape" hint.
  rungs.push({
    level: 2,
    label: "The shape",
    body: problem.approach,
  });
  // L3+: the problem's own hint list, capped at 3 more rungs.
  problem.hints.slice(0, 3).forEach((h, i) => {
    rungs.push({
      level: (Math.min(5, i + 3) as 3 | 4 | 5),
      label: i === 0 ? "First move" : i === 1 ? "Next piece" : "Near-complete",
      body: h,
    });
  });
  return rungs;
}

/**
 * Emit structural checks enforcing canonical SQL clause ordering. Every
 * adjacent pair of (lower-rank, higher-rank) blocks gets a `mustBeBefore`
 * check so a user who drops ORDER BY before WHERE gets an educational
 * message instead of a generic "wrong".
 */
function deriveStructuralChecks(
  blocks: { id: string; key: string; rank: number }[],
): StructuralCheck[] {
  const checks: StructuralCheck[] = [];
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i];
      const b = blocks[j];
      if (a.rank < 0 || b.rank < 0) continue;
      if (a.rank < b.rank) {
        checks.push({
          blockId: a.id,
          mustBeBefore: b.id,
          issue: `${a.key} must come before ${b.key}. SQL execution order is WITH → SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.`,
        });
      }
    }
  }
  return checks;
}

export function buildSqlPuzzle(problem: SQLProblem): CodePuzzle {
  const raw = splitIntoClauseBlocks(problem.finalCode);
  // If the splitter produced fewer than 2 blocks, the query was a single-
  // clause one-liner and a block puzzle wouldn't teach anything. Wrap the
  // whole query as one block so the user still sees it structured.
  const effective = raw.length >= 2 ? raw : [{ key: "QUERY", rank: 0, lines: finalCodeLines(problem.finalCode) }];

  const blocks: CodeBlock[] = effective.map((rb, i) => ({
    id: `b${i + 1}`,
    code: rb.lines.join("\n"),
    indent: 0,
  }));
  const rankedForChecks = effective.map((rb, i) => ({
    id: `b${i + 1}`,
    key: rb.key,
    rank: rb.rank,
  }));

  return {
    id: `sql-puzzle-${problem.id}`,
    patternId: problem.categoryId,
    problemId: problem.id,
    variant: "core",
    title: problem.title,
    prompt:
      "Arrange the SQL clauses into the right execution order. Every line belongs somewhere.",
    intent: problem.approach,
    language: "sql",
    blocks,
    remember: problem.rememberThis,
    hints: deriveHints(problem),
    structuralChecks: deriveStructuralChecks(rankedForChecks),
  };
}

function finalCodeLines(code: string): string[] {
  return code
    .replace(/;\s*$/, "")
    .split("\n")
    .filter((l) => l.trim().length > 0);
}

/**
 * Precomputed lookup — every SQL problem gets a puzzle. Built once at module
 * load, same pattern as PROBLEM_MAP / PUZZLE_BY_PROBLEM on the DSA side.
 */
export const SQL_PUZZLES: CodePuzzle[] = SQL_PROBLEMS.map(buildSqlPuzzle);

export const SQL_PUZZLE_BY_PROBLEM: Record<string, CodePuzzle> =
  Object.fromEntries(SQL_PUZZLES.map((p) => [p.problemId, p]));

export function sqlPuzzleFor(problemId: string): CodePuzzle | undefined {
  return SQL_PUZZLE_BY_PROBLEM[problemId];
}

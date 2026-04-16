export type Difficulty = "Easy" | "Medium" | "Hard";
export type InclusionType = "core" | "bonus" | "skipped";

export type MemoryStatus =
  | "new"
  | "tried"
  | "solved_with_help"
  | "solved_alone"
  | "needs_revision"
  | "mastered";

/**
 * A single annotated line of skeleton code. Used by the primer to walk through
 * the pattern line-by-line in plain English. Indentation is encoded per-line
 * so we can render it without messing with whitespace-sensitive strings.
 */
export interface SkeletonLine {
  code: string;
  explain: string;
  indent?: number;
}

export interface Pattern {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  triggers: string[];
  coreIdea: string;
  skeletonCode: string;
  /**
   * Optional line-by-line walkthrough of the skeleton. When present, the
   * primer renders each line alongside a plain-English meaning instead of
   * a prose blob. Added for users who find raw Python syntax daunting.
   */
  skeletonLines?: SkeletonLine[];
  helperSyntax: string[];
  commonMistakes: string[];
  difficultyFocus: Difficulty[];
  masteryThreshold: number;
  accent: string; // tailwind class for accent color
  icon: string; // lucide icon name
  order: number;
}

/**
 * One frame in a worked number trace. Renders as a table row: current
 * variables on the left, a one-line commentary on the right. The stepper
 * moves forward/back through frames so the user can watch the algorithm
 * chew through a concrete input.
 */
export interface TraceFrame {
  vars: Record<string, string>;
  note: string;
  highlightLine?: number;
}

export interface TraceExample {
  input: string;
  output: string;
  frames: TraceFrame[];
}

export interface Problem {
  id: string;
  title: string;
  patternId: string;
  difficulty: Difficulty;
  inclusion: InclusionType;
  estimatedMinutes: number;
  learningObjective: string;
  whyItMatters: string;
  bruteForce: string;
  optimalInsight: string;
  helperSyntax: string[];
  hints: string[];
  pitfalls: string[];
  complexity: { time: string; space: string };
  finalCode: string;
  recallQuestions: string[];
  dayAssignment: number;
  sourceReference?: string;
  rememberThis: string;
  /** Optional worked trace: concrete input stepped through frame-by-frame. */
  trace?: TraceExample;
}

export interface ReconstructChallenge {
  id: string;
  patternId: string;
  title: string;
  description: string;
  skeletonHint: string;
  idealCode: string;
  hintLadder: string[];
}

export interface ProgressRecord {
  status: MemoryStatus;
  lastSeen: number | null;
  nextReview: number | null;
  masteryPoints: number;
  confidence: number; // 0..5
  attempts: number;
  solvedWithoutHelp: number;
  solvedWithHelp: number;
  streakCount: number;
}

export interface DayPlan {
  day: number;
  patternFocus: string;
  newProblems: string[];
  reviewProblems: string[];
  reconstruct: string[];
  theme: string;
  kind: "new" | "review" | "rest";
}

export interface SQLCategory {
  id: string;
  name: string;
  tagline: string;
  coreIdea: string;
  keySyntax: string[];
  commonMistakes: string[];
  accent: string;
  icon: string;
  order: number;
}

export interface SQLProblem {
  id: string;
  title: string;
  categoryId: string;
  difficulty: Difficulty;
  learningObjective: string;
  whyItMatters: string;
  schemaHint: string;
  approach: string;
  hints: string[];
  pitfalls: string[];
  finalCode: string;
  rememberThis: string;
  sourceReference?: string;
}

export type PlanLength = 30 | 60 | 90;
export type TrackId = "dsa" | "sql";
export type TracksEnabled = "dsa" | "sql";

export interface UserPrefs {
  targetDays: number;
  planLength: PlanLength;
  tracks: TracksEnabled;
  tone: "calm" | "focused" | "competitive";
  theme: "dark" | "light";
  onboarded: boolean;
}

/**
 * A single guided mission step. The Today flow walks through these in order.
 * Each step has a unique key per day so we can record completion.
 */
/**
 * The mission is three beats, not six:
 *   warmup — orient + line-by-line primer, all in one compact card
 *   solve  — the merged Puzzle + Apply: blocks-only, problem-bound, live painting
 *   echo   — auto-generated reflection + painting reveal, one card
 */
export type MissionStepKind = "warmup" | "solve" | "echo";

export interface MissionStepDef {
  kind: MissionStepKind;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

/**
 * Code puzzle = block-based assembly. The user arranges shuffled blocks into
 * the right order, optionally with blanks to fill in.
 *
 * A pattern can have multiple puzzles: the canonical "core" shape, a "twist"
 * variant (e.g. sliding window with a frequency map instead of a set), and
 * a "diagnostic" variant that starts almost-solved but with a deliberate
 * mistake the user must catch. Variety is how repetition stays interesting.
 */
export interface CodeBlock {
  id: string;
  code: string;
  indent: number; // 0..n levels of leading indentation (rendered as offset)
  blank?: { answer: string; placeholder?: string };
}

export type PuzzleVariant = "core" | "twist" | "diagnostic";

/**
 * Progressive hint. The ladder moves from plain-English goal to near-complete
 * reveal. Each rung costs something small (art tiles, not XP) so hints stay
 * a welcome tool, not a shameful shortcut.
 */
export interface PuzzleHint {
  level: 1 | 2 | 3 | 4 | 5;
  label: string; // short display name, e.g. "The goal", "First move"
  body: string;  // full hint copy
  /**
   * A one-sentence "carry this forward" note — the meta-lesson the user
   * should internalise so they don't need this hint next time. Rendered
   * as a subtle italicised footer on the hint card. Optional; omit for
   * low-level mechanical hints where the body is already a takeaway.
   */
  carryForward?: string;
  /**
   * Optional structural effect:
   *  - `placeBlocks`: block IDs to auto-place into the solution slot in
   *    their canonical positions (used by L3 and L5).
   *  - `highlightBlock`: a block ID to glow in the pool (L3).
   */
  placeBlocks?: string[];
  highlightBlock?: string;
}

/**
 * Per-block structural anchor. When the user's solution is wrong, the puzzle
 * checker uses these to produce an educational message instead of "try
 * again": e.g. "The `seen` dict needs to be initialized before the loop."
 */
export interface StructuralCheck {
  blockId: string;
  mustBeBefore?: string; // block id that must appear later
  mustBeAfter?: string;  // block id that must appear earlier
  mustBeAtIndent?: number;
  issue: string; // human-readable explanation
}

export interface CodePuzzle {
  id: string;
  patternId: string;
  /**
   * The specific problem this puzzle implements. Puzzles are problem-specific
   * — one canonical block layout per problem — because reference
   * implementations differ too much within a single pattern to share.
   */
  problemId: string;
  variant: PuzzleVariant;
  title: string;
  prompt: string;
  intent?: string; // one-line "what you're building and why" for the card header
  language: "python" | "sql";
  blocks: CodeBlock[]; // canonical order — UI shuffles for the user
  remember: string;
  hints?: PuzzleHint[];
  structuralChecks?: StructuralCheck[];
  /** Optional worked trace shown alongside the puzzle. */
  trace?: TraceExample;
}

/**
 * Per-day mission progress. Stored under `missionProgress[dateKey]`.
 */
export interface MissionDayProgress {
  day: number;
  completedSteps: MissionStepKind[];
  startedAt: number;
  finishedAt?: number;
}

/**
 * A single entry in the user's personal playbook. These grow out of the
 * Reflect step and become a self-authored interview-prep card deck over the
 * course of the arc.
 */
export interface PlaybookEntry {
  id: string;
  patternId: string;
  problemId?: string;
  day: number;
  rememberLine: string; // required — the one-line takeaway
  clue?: string;        // "what clue in the problem pointed to this pattern"
  pitfall?: string;     // "the thing I almost slipped on"
  confidence: 1 | 2 | 3 | 4 | 5;
  createdAt: number;
}

/**
 * Result of lightweight rebuild validation. We compare the user's typed
 * skeleton against the pattern's canonical skeleton using fuzzy line match —
 * structure-aware, forgiving of whitespace, and deliberately non-punitive.
 */
export interface RebuildValidation {
  presentKeys: string[];
  missingKeys: string[];
  orderOk: boolean;
  score: number; // 0..1
  summary: string; // e.g. "4 of 6 structural elements captured"
}

export interface OnboardingExtras {
  /** Number of days to skip. Returning users who already know the first N patterns. */
  startDayOffset: number;
  /** Pattern ids the user marks as already familiar — pre-unlocked in progress. */
  familiarPatterns: string[];
}

/**
 * Per-problem solve scoring. Recorded once `handleSolveOutcome` fires for a
 * problem on the Solve step. Tracks the metrics that feed the local score:
 * wall-clock time, hint ladder usage, and back-navigation penalties.
 */
export interface SolveScoreRecord {
  problemId: string;
  pointsEarned: number;
  timeMs: number;
  hintsUsed: number;
  backNavs: number;
  clean: boolean;
  recordedAt: number;
}

export interface DayScoreRecord {
  day: number;
  dateKey: string;
  totalPoints: number;
  perProblem: Record<string, SolveScoreRecord>;
}

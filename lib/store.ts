"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DayScoreRecord,
  MemoryStatus,
  MissionDayProgress,
  MissionStepKind,
  PlaybookEntry,
  ProgressRecord,
  SolveScoreRecord,
  TrackId,
  UserPrefs,
} from "@/lib/types";
import { buildPlan } from "@/lib/data/plan";
import { PROBLEMS, PROBLEMS_BY_PATTERN } from "@/lib/data/problems";
import type { Artwork } from "@/lib/data/artwork";

const DAY_MS = 86_400_000;

const DEFAULT_PROGRESS: ProgressRecord = {
  status: "new",
  lastSeen: null,
  nextReview: null,
  masteryPoints: 0,
  confidence: 0,
  attempts: 0,
  solvedWithoutHelp: 0,
  solvedWithHelp: 0,
  streakCount: 0,
};

interface AppState {
  // prefs / onboarding
  prefs: UserPrefs;
  setPrefs: (p: Partial<UserPrefs>) => void;
  completeOnboarding: () => void;

  // which track the user is currently viewing (for nav context)
  activeTrack: TrackId;
  setActiveTrack: (t: TrackId) => void;

  // day tracking
  startTimestamp: number; // first day = day 1
  currentDay: () => number;

  // mission flow (new cohesive daily experience)
  missionProgress: Record<string, MissionDayProgress>; // dateKey -> progress
  completeMissionStep: (step: MissionStepKind) => void;
  currentMissionStep: () => MissionStepKind;
  missionCompletion: () => number; // 0..100 for today

  // code puzzle progress — keyed by problemId (1:1 with puzzles)
  puzzleProgress: Record<string, ProgressRecord>;
  markPuzzle: (problemId: string, clean: boolean, hintsUsed?: number) => void;

  // artwork gallery — legacy cumulative counter (kept for gallery math)
  artProgress: { tilesRevealed: number; currentArtwork: string };
  revealTiles: (n: number) => void;

  // per-problem tile reveal state — each problem owns ONE painting and
  // fills it from 0 → 60 as the user solves that problem.
  problemArtProgress: Record<string, number>;

  // runtime-fetched gallery additions (Met Museum API). These merge with the
  // seed catalogue on the progress page so the wall keeps growing as the
  // user unlocks more of it. `artworkForProblem` stays on seed data for
  // stability — each problem keeps the same painting forever.
  dynamicArtworks: Artwork[];
  lastMetFetch: number | null;
  mergeDynamicArtworks: (works: Artwork[]) => void;

  // personal playbook — reflection notes collected at the end of each mission
  playbook: PlaybookEntry[];
  addPlaybookEntry: (entry: Omit<PlaybookEntry, "id" | "createdAt">) => void;
  removePlaybookEntry: (id: string) => void;

  // returning-user onboarding extras
  startDayOffset: number;
  familiarPatterns: string[];
  setStartDayOffset: (offset: number) => void;
  setFamiliarPatterns: (ids: string[]) => void;

  // progress
  problemProgress: Record<string, ProgressRecord>;
  sqlProgress: Record<string, ProgressRecord>;

  // xp / streak
  xp: number;
  level: () => number;
  streak: number;
  lastActiveDate: string | null;
  tickActivity: () => void;

  // today tasks (completed in a given calendar day)
  completedToday: Record<string, string[]>; // dateKey -> taskIds

  // actions
  markProblem: (id: string, status: MemoryStatus) => void;
  markSql: (id: string, status: MemoryStatus) => void;

  // local scoring (no backend — pure personal-best tracking)
  dayScores: Record<string, DayScoreRecord>;
  recordSolveScore: (args: {
    problemId: string;
    day: number;
    timeMs: number;
    hintsUsed: number;
    backNavs: number;
    clean: boolean;
  }) => void;
  todayScore: () => DayScoreRecord | null;

  // derived helpers
  patternMastery: (patternId: string) => number;
  dueForReview: () => string[];
  sqlDueForReview: () => string[];
  resetAll: () => void;
}

/**
 * Compute points for a single solve. Calibrated so a clean, quick, hint-free
 * solve nets ~150, a hinted solve nets ~80, and a messy backtracked solve
 * still earns ~30. Floor at 0 so the number is never discouraging.
 */
export function computeSolvePoints(args: {
  timeMs: number;
  hintsUsed: number;
  backNavs: number;
  clean: boolean;
}): number {
  const { timeMs, hintsUsed, backNavs, clean } = args;
  const base = clean ? 100 : 60;
  const minutes = timeMs / 60_000;
  const timeBonus = Math.max(0, Math.round(50 - Math.max(0, minutes - 2) * 5));
  const hintPenalty = hintsUsed * 10;
  const navPenalty = backNavs * 5;
  return Math.max(0, base + timeBonus - hintPenalty - navPenalty);
}

const MASTERY_DELTA: Record<MemoryStatus, number> = {
  new: 0,
  tried: 5,
  solved_with_help: 10,
  solved_alone: 25,
  needs_revision: -5,
  mastered: 40,
};

const XP_DELTA: Record<MemoryStatus, number> = {
  new: 0,
  tried: 5,
  solved_with_help: 15,
  solved_alone: 30,
  needs_revision: 5,
  mastered: 50,
};

// SRS intervals (days) keyed by status.
const NEXT_INTERVAL: Record<MemoryStatus, number> = {
  new: 1,
  tried: 1,
  solved_with_help: 2,
  solved_alone: 5,
  needs_revision: 1,
  mastered: 12,
};

const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      prefs: {
        targetDays: 30,
        planLength: 30,
        tracks: "dsa",
        tone: "calm",
        theme: "dark",
        onboarded: false,
      },
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
      completeOnboarding: () => {
        const { familiarPatterns, problemProgress, prefs } = get();
        // Warm-start: seed problemProgress for every problem in a familiar
        // pattern so it reflects ~50% mastery and drops out of "not started"
        // buckets. Still schedules a refresher in 3 days — we're saying
        // "you know this, but let's keep it sharp", not "you've mastered it".
        const now = Date.now();
        const seeded = { ...problemProgress };
        for (const patternId of familiarPatterns) {
          const list = PROBLEMS_BY_PATTERN[patternId] || [];
          for (const prob of list) {
            if (seeded[prob.id]) continue;
            seeded[prob.id] = {
              status: "solved_alone",
              lastSeen: now,
              nextReview: now + 3 * DAY_MS,
              masteryPoints: 50,
              confidence: 3,
              attempts: 1,
              solvedWithoutHelp: 1,
              solvedWithHelp: 0,
              streakCount: 1,
            };
          }
        }
        // If the user picked SQL-only, land them on the SQL track.
        const activeTrack: TrackId = prefs.tracks === "sql" ? "sql" : "dsa";
        set((s) => ({
          prefs: { ...s.prefs, onboarded: true },
          startTimestamp: s.startTimestamp || Date.now(),
          problemProgress: seeded,
          activeTrack,
        }));
      },

      activeTrack: "dsa",
      setActiveTrack: (t) => set({ activeTrack: t }),

      startTimestamp: 0,
      currentDay: () => {
        const start = get().startTimestamp || Date.now();
        const planLength = get().prefs.planLength || 30;
        const offset = get().startDayOffset || 0;
        const raw = Math.floor((Date.now() - start) / DAY_MS) + 1 + offset;
        return Math.max(1, Math.min(raw, planLength));
      },

      missionProgress: {},
      completeMissionStep: (step) => {
        const today = todayKey();
        const day = get().currentDay();
        const existing = get().missionProgress[today] || {
          day,
          completedSteps: [],
          startedAt: Date.now(),
        };
        if (existing.completedSteps.includes(step)) return;
        const completedSteps = [...existing.completedSteps, step];
        const allSteps: MissionStepKind[] = ["warmup", "solve", "echo"];
        const finished = allSteps.every((s) => completedSteps.includes(s));
        const next: MissionDayProgress = {
          ...existing,
          day,
          completedSteps,
          finishedAt: finished ? Date.now() : existing.finishedAt,
        };
        set((s) => ({
          missionProgress: { ...s.missionProgress, [today]: next },
          xp: s.xp + 6,
        }));
        get().tickActivity();
      },
      currentMissionStep: () => {
        const today = todayKey();
        const existing = get().missionProgress[today];
        const allSteps: MissionStepKind[] = ["warmup", "solve", "echo"];
        if (!existing) return "warmup";
        return (
          allSteps.find((s) => !existing.completedSteps.includes(s)) || "echo"
        );
      },
      missionCompletion: () => {
        const today = todayKey();
        const existing = get().missionProgress[today];
        if (!existing) return 0;
        return Math.round((existing.completedSteps.length / 3) * 100);
      },

      puzzleProgress: {},
      problemArtProgress: {},

      dynamicArtworks: [],
      lastMetFetch: null,
      mergeDynamicArtworks: (works) =>
        set((s) => {
          const existingIds = new Set(s.dynamicArtworks.map((a) => a.id));
          const fresh = works.filter((a) => !existingIds.has(a.id));
          return {
            dynamicArtworks: [...s.dynamicArtworks, ...fresh],
            lastMetFetch: Date.now(),
          };
        }),
      /**
       * Record a puzzle attempt. `problemId` is the problem whose canonical
       * puzzle was solved — puzzles are 1:1 with problems, so this also
       * keys puzzleProgress.
       *
       * Per-problem painting fills to 60 tiles on clean solve, 40 with 1-2
       * hints, 25 with 3+ hints. Each problem = one painting. The cumulative
       * `artProgress.tilesRevealed` is kept in sync so the legacy gallery
       * math still works.
       */
      markPuzzle: (problemId, clean, hintsUsed = 0) => {
        const rec = get().puzzleProgress[problemId] || { ...DEFAULT_PROGRESS };
        const solved = clean || hintsUsed > 0 || rec.attempts > 0;
        const status: MemoryStatus = clean
          ? "solved_alone"
          : solved
            ? "solved_with_help"
            : "needs_revision";
        const TILES_PER_PROBLEM = 60;
        const currentProblemTiles = get().problemArtProgress[problemId] || 0;
        const targetTiles = clean
          ? TILES_PER_PROBLEM
          : hintsUsed <= 2
            ? 40
            : 25;
        const newProblemTiles = Math.max(currentProblemTiles, targetTiles);
        const tileDelta = newProblemTiles - currentProblemTiles;
        const xpGain = clean ? 18 : hintsUsed <= 2 ? 12 : 8;
        const now = Date.now();
        const next: ProgressRecord = {
          ...rec,
          status,
          lastSeen: now,
          nextReview: now + NEXT_INTERVAL[status] * DAY_MS,
          attempts: rec.attempts + 1,
          solvedWithoutHelp: rec.solvedWithoutHelp + (clean ? 1 : 0),
          solvedWithHelp: rec.solvedWithHelp + (!clean && solved ? 1 : 0),
          masteryPoints: Math.max(
            0,
            rec.masteryPoints + (clean ? 18 : hintsUsed <= 2 ? 10 : 6),
          ),
          streakCount: clean ? rec.streakCount + 1 : 0,
        };
        set((s) => ({
          puzzleProgress: { ...s.puzzleProgress, [problemId]: next },
          problemArtProgress: {
            ...s.problemArtProgress,
            [problemId]: newProblemTiles,
          },
          xp: s.xp + xpGain,
          artProgress: {
            ...s.artProgress,
            tilesRevealed: s.artProgress.tilesRevealed + tileDelta,
          },
        }));
        get().tickActivity();
      },

      artProgress: { tilesRevealed: 0, currentArtwork: "starry-night" },
      revealTiles: (n) =>
        set((s) => ({
          artProgress: {
            ...s.artProgress,
            tilesRevealed: s.artProgress.tilesRevealed + n,
          },
        })),

      playbook: [],
      addPlaybookEntry: (entry) =>
        set((s) => ({
          playbook: [
            ...s.playbook,
            {
              ...entry,
              id: `pb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              createdAt: Date.now(),
            },
          ],
        })),
      removePlaybookEntry: (id) =>
        set((s) => ({ playbook: s.playbook.filter((e) => e.id !== id) })),

      startDayOffset: 0,
      familiarPatterns: [],
      setStartDayOffset: (offset) => set({ startDayOffset: offset }),
      setFamiliarPatterns: (ids) => set({ familiarPatterns: ids }),

      problemProgress: {},
      sqlProgress: {},

      xp: 0,
      level: () => Math.floor(Math.sqrt(get().xp / 25)) + 1,
      streak: 0,
      lastActiveDate: null,

      completedToday: {},

      tickActivity: () => {
        const today = todayKey();
        const last = get().lastActiveDate;
        if (last === today) return;
        let streak = get().streak;
        if (!last) {
          streak = 1;
        } else {
          const diff = Math.floor(
            (Date.parse(today) - Date.parse(last)) / DAY_MS,
          );
          if (diff === 1) streak += 1;
          else if (diff > 1) streak = 1;
        }
        set({ streak, lastActiveDate: today });
      },

      markProblem: (id, status) => {
        const rec = get().problemProgress[id] || { ...DEFAULT_PROGRESS };
        const now = Date.now();
        const next: ProgressRecord = {
          ...rec,
          status,
          lastSeen: now,
          nextReview: now + NEXT_INTERVAL[status] * DAY_MS,
          attempts: rec.attempts + 1,
          solvedWithoutHelp:
            rec.solvedWithoutHelp +
            (status === "solved_alone" || status === "mastered" ? 1 : 0),
          solvedWithHelp:
            rec.solvedWithHelp + (status === "solved_with_help" ? 1 : 0),
          masteryPoints: Math.max(0, rec.masteryPoints + MASTERY_DELTA[status]),
          streakCount:
            status === "solved_alone" || status === "mastered"
              ? rec.streakCount + 1
              : 0,
        };
        const today = todayKey();
        const done = new Set(get().completedToday[today] || []);
        done.add("problem:" + id);
        set((s) => ({
          problemProgress: { ...s.problemProgress, [id]: next },
          xp: s.xp + XP_DELTA[status],
          completedToday: { ...s.completedToday, [today]: Array.from(done) },
        }));
        get().tickActivity();
      },

      markSql: (id, status) => {
        const rec = get().sqlProgress[id] || { ...DEFAULT_PROGRESS };
        const now = Date.now();
        const next: ProgressRecord = {
          ...rec,
          status,
          lastSeen: now,
          nextReview: now + NEXT_INTERVAL[status] * DAY_MS,
          attempts: rec.attempts + 1,
          solvedWithoutHelp:
            rec.solvedWithoutHelp +
            (status === "solved_alone" || status === "mastered" ? 1 : 0),
          solvedWithHelp:
            rec.solvedWithHelp + (status === "solved_with_help" ? 1 : 0),
          masteryPoints: Math.max(0, rec.masteryPoints + MASTERY_DELTA[status]),
          streakCount:
            status === "solved_alone" || status === "mastered"
              ? rec.streakCount + 1
              : 0,
        };
        // Tile reveal — SQL feeds the same shared gallery as DSA.
        // Same mental model as markPuzzle: monotonic per-problem target,
        // only the delta feeds the cumulative counter.
        const sqlKey = `sql:${id}`;
        const currentTiles = get().problemArtProgress[sqlKey] || 0;
        const targetTiles =
          status === "solved_alone" || status === "mastered"
            ? 60
            : status === "solved_with_help"
              ? 40
              : status === "tried"
                ? 15
                : 0;
        const newTiles = Math.max(currentTiles, targetTiles);
        const tileDelta = newTiles - currentTiles;
        const today = todayKey();
        const done = new Set(get().completedToday[today] || []);
        done.add("sql:" + id);
        set((s) => ({
          sqlProgress: { ...s.sqlProgress, [id]: next },
          problemArtProgress: {
            ...s.problemArtProgress,
            [sqlKey]: newTiles,
          },
          artProgress: {
            ...s.artProgress,
            tilesRevealed: s.artProgress.tilesRevealed + tileDelta,
          },
          xp: s.xp + XP_DELTA[status],
          completedToday: { ...s.completedToday, [today]: Array.from(done) },
        }));
        get().tickActivity();
      },

      dayScores: {},
      recordSolveScore: ({
        problemId,
        day,
        timeMs,
        hintsUsed,
        backNavs,
        clean,
      }) => {
        const dateKey = todayKey();
        const pointsEarned = computeSolvePoints({
          timeMs,
          hintsUsed,
          backNavs,
          clean,
        });
        const rec: SolveScoreRecord = {
          problemId,
          pointsEarned,
          timeMs,
          hintsUsed,
          backNavs,
          clean,
          recordedAt: Date.now(),
        };
        set((s) => {
          const existing = s.dayScores[dateKey] || {
            day,
            dateKey,
            totalPoints: 0,
            perProblem: {},
          };
          // If this problem was already scored today, overwrite with the new
          // result and recompute the day's total from scratch — no double-
          // counting when the user resolves a puzzle a second time.
          const perProblem = { ...existing.perProblem, [problemId]: rec };
          const totalPoints = Object.values(perProblem).reduce(
            (acc, r) => acc + r.pointsEarned,
            0,
          );
          return {
            dayScores: {
              ...s.dayScores,
              [dateKey]: { day, dateKey, totalPoints, perProblem },
            },
          };
        });
      },
      todayScore: () => {
        const k = todayKey();
        return get().dayScores[k] || null;
      },

      patternMastery: (patternId) => {
        const problemIds = PROBLEMS.filter((p) => p.patternId === patternId).map(
          (p) => p.id,
        );
        if (problemIds.length === 0) return 0;
        const total = problemIds.reduce((acc, id) => {
          const rec = get().problemProgress[id];
          if (!rec) return acc;
          return acc + Math.min(100, rec.masteryPoints);
        }, 0);
        return Math.round(total / (problemIds.length * 100) * 100);
      },

      dueForReview: () => {
        const now = Date.now();
        const out: string[] = [];
        for (const [id, rec] of Object.entries(get().problemProgress)) {
          if (rec.nextReview && rec.nextReview <= now && rec.status !== "mastered") {
            out.push(id);
          }
        }
        return out;
      },

      // SQL equivalent — same SRS semantics (Ebbinghaus-ish intervals via
      // NEXT_INTERVAL in markSql), sorted by oldest-overdue first so the
      // UI naturally surfaces the most-forgotten problems.
      sqlDueForReview: () => {
        const now = Date.now();
        const items: { id: string; nextReview: number }[] = [];
        for (const [id, rec] of Object.entries(get().sqlProgress)) {
          if (
            rec.nextReview &&
            rec.nextReview <= now &&
            rec.status !== "mastered"
          ) {
            items.push({ id, nextReview: rec.nextReview });
          }
        }
        items.sort((a, b) => a.nextReview - b.nextReview);
        return items.map((i) => i.id);
      },

      resetAll: () =>
        set({
          problemProgress: {},
          sqlProgress: {},
          puzzleProgress: {},
          problemArtProgress: {},
          missionProgress: {},
          artProgress: { tilesRevealed: 0, currentArtwork: "starry-night" },
          dynamicArtworks: [],
          lastMetFetch: null,
          playbook: [],
          startDayOffset: 0,
          familiarPatterns: [],
          xp: 0,
          streak: 0,
          lastActiveDate: null,
          completedToday: {},
          dayScores: {},
          startTimestamp: 0,
          activeTrack: "dsa",
          prefs: { ...get().prefs, onboarded: false },
        }),
    }),
    {
      name: "patternforge-state-v4",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? (undefined as unknown as Storage)
          : localStorage,
      ),
    },
  ),
);

// Re-export the raw data so components don't have to dual-import.
// PLAN now adapts to the user's chosen plan length.
export { buildPlan, PROBLEMS };

/**
 * Subscribe to prefs.planLength so components can read the adapted PLAN
 * directly. Use getAdaptedPlan() wherever the old PLAN was used.
 */
export const getAdaptedPlan = () => {
  const length = useApp.getState().prefs.planLength || 30;
  return buildPlan(length);
};

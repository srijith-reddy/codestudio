# CodeStudio

A calm, guided coding-mastery studio. One unhurried daily session — a primer, a block puzzle, and a short reflection — that trades grind for pattern recall. Every solve paints a tile onto an evolving gallery of artworks. No accounts, no server, no analytics; everything lives in your browser.

## Quickstart

```bash
npm install
npm run dev     # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

No environment variables are required. State persists in `localStorage` under the `patternforge-state-v1` key.

## Tracks

Pick one track at onboarding — you can switch in Settings later. Nav, data, and artwork painting are scoped per track.

- **DSA** — 17 canonical Python patterns, 131 hand-authored problems, 131 block-assembly puzzles with a five-rung hint ladder and structural checks.
- **SQL** — the LeetCode SQL 50 roadmap grouped into 7 categories (Select, Joins, Aggregates, Sorting & Grouping, Advanced Select & Joins, Subqueries, Advanced String Functions / Regex / Clause). Puzzles are derived per-clause from authored final queries so every problem has one for free.

Plan length is 30, 60, or 90 days. Returning users can skip ahead and mark patterns as already familiar.

## The daily mission

Three beats per day, same shape for both tracks:

1. **Warm up** — the one-idea core, the recall trigger, and the day's query or function revealed line by line with inline commentary.
2. **Solve** — a blocks-first puzzle (drag clauses / code lines into order, fill the blanks). A progressive five-rung hint ladder debits art tiles, never XP. Structural checks produce pedagogical errors ("the `seen` dict needs to exist before the loop") instead of "try again". Live painting tiles preview as you work.
3. **Echo** — one auto-saved line goes to the Playbook, the solve scores (time / hints / back-navigations), the painting reveals its new tiles, and tomorrow's pattern is teased.

Days that fall past the catalog become spaced-review days, pulled oldest-overdue first from the SRS queue.

## Key systems

- **Spaced repetition.** Each solve schedules a `nextReview` on a memory-strength curve. Overdue problems surface as review chips on Today and as a full Review queue.
- **Playbook.** Every Echo auto-captures one takeaway per problem (`rememberThis` + first pitfall + a derived confidence 1–5). The Playbook page groups your own notes by pattern — read it before an interview.
- **Painting gallery.** Each problem owns one artwork (60 tiles). Solving fills tiles; review can top up. The Progress page browses the full wall. Artworks ship seeded and can be augmented live from the Met Museum API.
- **Ask the curriculum.** A floating assistant answers only from hand-authored fields (`optimalInsight`, `hints`, `pitfalls`, `rememberThis`, …). No LLM, no network, no hallucination surface. Works in both DSA and SQL contexts via a thin adapter.
- **Scoring.** A local, non-competitive score per day from solve time, hint rungs used, and back-navigations. Personal-best only — no leaderboard.
- **Tone modes.** `calm` / `focused` / `competitive` swap the coach's copy throughout the mission without changing the flow.

Notably absent: shame-flavored streaks, leaderboards, any network calls beyond the optional Met API fetch.

## Routes

```
/                 Today (DSA)                 /sql                 Today (SQL)
/library          DSA pattern library          /sql/library        SQL category library
/patterns/[id]    Per-pattern detail           /sql/[category]     Per-category detail
/problems/[id]    Per-problem detail           /sql/problems/[id]  Per-SQL-problem detail
/playbook         Your captured notes          /sql/progress       SQL painting gallery
/progress         DSA painting gallery         /review             Pattern review queue
/settings         Plan length, track, tone, theme, reset
```

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS with custom tokens · Zustand with `persist` · Framer Motion · Lucide · hand-rolled SVG artworks.

## Project layout

```
app/               Next.js routes — DSA at the root, SQL under /sql
components/        mission-flow, today-view, app-shell, assistant,
                   code-blocks (puzzle engine), artwork-canvas, ui/
lib/
  data/            patterns, problems (+ extras), puzzles, sql, sql-puzzles,
                   plan, sql-plan, artwork, coach (tone copy)
  assistant.ts     curriculum-grounded question router
  store.ts         Zustand store (prefs, progress, mission, playbook, gallery, scoring)
  rebuild-check.ts forgiving anchor-based skeleton validator
  types.ts         single source of types
public/            static assets
```

## Deployment

Connected to Vercel via GitHub integration — push to `main` and production deploys automatically. Project: `srijith-reddy/codestudio` → Vercel `codestudio` (aliased to `codestudio-bice.vercel.app`).

## Why

Most DSA tools optimize for volume. Volume alone doesn't convert to recall under pressure. CodeStudio is pattern-first, gallery-toned, and designed to feel like a studio you return to — not a tracker you bounce off.

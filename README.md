# CodeStudio

CodeStudio is a calm, guided coding mastery studio designed for people who want to build real pattern recall instead of grinding endless problem lists. It turns primers, puzzles, curated problems, rebuilds, reflection, and an evolving artwork into one unhurried daily session.

## What CodeStudio Does

- guides users through a single seven-step daily mission
- teaches Python DSA patterns (and optionally SQL) on a 30 / 60 / 90-day arc
- delivers short editorial primers with trigger phrases and common mistakes
- runs an interactive block puzzle for hands-on pattern assembly
- inlines a curated LeetCode problem so users never lose their place
- gives structural, pedagogical feedback instead of generic right/wrong
- supports a five-rung progressive hint ladder without penalising help
- captures one honest line per day into a personal Playbook
- restores a gallery of abstract paintings as the retention loop

## Product Direction

This repository is built around a calm, premium learning experience rather than a gamified grinder.

The current app is:

- anti-shame and anti-grind
- pattern-first instead of volume-first
- gallery-toned instead of leaderboard-toned
- designed to feel like a studio, not a tracker

## Key Flows

### Today

The landing experience focuses on:

- presenting one guided mission for the day
- routing fresh users into onboarding
- keeping every step of the session on a single surface

### Onboarding

Users can:

- choose a 30, 60, or 90-day plan
- skip ahead with an "I've done some of this before" entry
- mark patterns they already know as lightweight refreshers
- set tone, daily minutes, and theme preferences

### Mission

Users move through a seven-step flow:

- Orient — why today's pattern matters and the recall trigger
- Primer — core idea, helper syntax, and common mistakes
- Puzzle — interactive block assembly with hint ladder and variants
- Problem — the inlined LeetCode problem with brute force, optimal insight, and hints
- Rebuild — retype the pattern skeleton from memory against a forgiving validator
- Reflect — write one line, plus optional clue and pitfall, into the Playbook
- Reward — restore a tile of the atelier painting

### Library

- browse patterns, drills, reconstruction, and SQL
- revisit anything from the canonical arc at any time
- reach legacy routes (`/patterns`, `/problems/[id]`, `/sql`, `/review`) without nav clutter

### Playbook

- read your own interview notebook, grouped by pattern
- review clues and pitfalls written in your own voice
- prep before an interview from one personal surface

### Progress

- review the painting gallery as the retention loop
- check the review queue and mastery map
- watch tiles age back into practice instead of locking in

### Settings

- change plan length mid-arc
- adjust mode, tone, theme, and daily minutes
- reset state when starting fresh

## Puzzle And Playbook

CodeStudio includes structural learning layers that make the experience feel pedagogical rather than punitive.

That means it can:

- give pattern-specific structural feedback ("your `while` loop needs to run before the return")
- offer Core, Twist, and Diagnostic puzzle variants per pattern
- award tiles even on heavily-assisted solves
- accumulate the Playbook automatically from daily Reflect entries

What it does not do:

- track streaks with shame or red flags
- rank users on a leaderboard
- send any data to a server or analytics pipeline

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS with custom design tokens
- Zustand with `persist` (localStorage)
- Framer Motion
- Lucide React
- Hand-rolled SVG paintings

## Repository Structure

```text
app/                Next.js App Router routes (today, library, playbook, progress, settings)
components/        mission flow, app shell, artwork canvas, assistant, UI primitives
lib/               store, types, gallery, rebuild checker, assistant logic, pattern data
public/            static assets
```

## Local Development

```bash
npm install
npm run dev
```

The app opens on `http://localhost:3000`.

## Environment

CodeStudio has no required environment variables. All state lives in the browser under the localStorage key `patternforge-state-v1`. There is no backend, no account, and no analytics.

## Current Status

What is real today:

- the seven-step mission flow
- 30 / 60 / 90-day arc with returning-user entry
- interactive puzzle with hint ladder and structural feedback
- inlined curated problems with brute force, insight, and hints
- rebuild validator with forgiving anchor checks
- Playbook capture from daily Reflect entries
- atelier painting restoration as the progress surface
- Library, Playbook, Progress, and Settings routes

What still depends on future work:

- broader pattern coverage across the canonical arc
- deeper SQL track parity with the DSA track
- more puzzle variants per pattern (Core, Twist, Diagnostic)
- richer mastery-map and review-queue surfaces
- mobile polish beyond the dedicated step rail

## Why This Repo Exists

Most DSA tools optimise for volume — more problems, more drills, more cards — and most of that volume never converts into recall under interview pressure.

CodeStudio exists to make pattern mastery feel calm, personal, and durable by combining a guided daily mission with structural feedback and a Playbook written in the user's own voice.

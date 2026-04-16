"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { MissionFlow } from "@/components/mission-flow";
import { PATTERNS } from "@/lib/data/patterns";
import type { PlanLength, TracksEnabled } from "@/lib/types";

/**
 * TodayView is now the single mission entry-point. Unonboarded users see a
 * premium onboarding card; everyone else sees the cohesive mission flow.
 *
 * Track-aware routing: SQL-track users who land on `/` (the DSA home) get
 * redirected to `/sql`. That's the only cross-track nav in the app — every
 * other path is scoped to the user's chosen track via the sidebar.
 */
export function TodayView() {
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const prefs = useApp((s) => s.prefs);
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  const setPrefs = useApp((s) => s.setPrefs);

  useEffect(() => setHydrated(true), []);

  // Onboarded SQL users never see the DSA mission — push them home.
  useEffect(() => {
    if (!hydrated) return;
    if (prefs.onboarded && prefs.tracks === "sql") {
      router.replace("/sql");
    }
  }, [hydrated, prefs.onboarded, prefs.tracks, router]);

  if (!hydrated) {
    return <div className="h-64 rounded-3xl animate-pulse bg-bg-subtle" />;
  }

  if (!prefs.onboarded) {
    return <OnboardingCard onStart={completeOnboarding} setPrefs={setPrefs} />;
  }

  // SQL user briefly lands here before the redirect above fires.
  if (prefs.tracks === "sql") {
    return <div className="h-64 rounded-3xl animate-pulse bg-bg-subtle" />;
  }

  return <MissionFlow />;
}

function OnboardingCard({
  onStart,
  setPrefs,
}: {
  onStart: () => void;
  setPrefs: (p: any) => void;
}) {
  const setStartDayOffset = useApp((s) => s.setStartDayOffset);
  const setFamiliarPatterns = useApp((s) => s.setFamiliarPatterns);
  const [planLength, setPlanLength] = useState<PlanLength>(30);
  const [tracks, setTracks] = useState<TracksEnabled>("dsa");
  const [returningOpen, setReturningOpen] = useState(false);
  const [dayOffset, setDayOffset] = useState(0);
  const [familiar, setFamiliar] = useState<string[]>([]);

  const toggleFamiliar = (id: string) => {
    setFamiliar((f) =>
      f.includes(id) ? f.filter((x) => x !== id) : [...f, id],
    );
  };

  const handleStart = () => {
    setPrefs({
      planLength,
      targetDays: planLength,
      tracks,
    });
    setStartDayOffset(dayOffset);
    setFamiliarPatterns(familiar);
    onStart();
  };

  const rhythm =
    planLength === 30
      ? "Focused and intense."
      : planLength === 60
        ? "Balanced and retentive. Half the daily load, twice the review."
        : "Calm and mastery-oriented. Weekly rest/mastery days baked in.";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-bg-elevated">
      <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
      <div className="relative p-8 md:p-12 max-w-2xl">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> Welcome to CodeStudio
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-display font-semibold tracking-tight">
          Pick your arc. We'll pace the rest.
        </h1>
        <p className="mt-3 text-sm text-fg-muted">
          One guided session per day. No tab-hopping, no grind. Every solve
          unlocks a tile in your painting gallery.
        </p>

        <div className="mt-8 space-y-6">
          <Section
            label="Plan length"
            hint="You can change this any time in settings."
          >
            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 90].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPlanLength(n as PlanLength)}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition-all",
                    planLength === n
                      ? "border-brand bg-brand-soft/40"
                      : "border-border bg-bg-elevated hover:border-border-strong",
                  )}
                >
                  <div className="text-2xl font-display font-semibold">
                    {n}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-fg-subtle">
                    days
                  </div>
                  <div className="mt-1 text-[11px] text-fg-muted leading-snug">
                    {n === 30
                      ? "Sprint"
                      : n === 60
                        ? "Balanced"
                        : "Mastery"}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-fg-subtle italic">{rhythm}</p>
          </Section>

          <Section
            label="Starting track"
            hint="Pick one to start — you can enable the other from Settings anytime. Both tracks share one streak, one XP bar, and one painting gallery."
          >
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    value: "dsa",
                    label: "DSA",
                    sub: "Patterns + puzzles",
                  },
                  {
                    value: "sql",
                    label: "SQL 50",
                    sub: "Query fluency",
                  },
                ] as { value: TracksEnabled; label: string; sub: string }[]
              ).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTracks(t.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition-all",
                    tracks === t.value
                      ? "border-brand bg-brand-soft/40"
                      : "border-border bg-bg-elevated hover:border-border-strong",
                  )}
                >
                  <div className="text-sm font-display font-semibold">
                    {t.label}
                  </div>
                  <div className="mt-1 text-[11px] text-fg-muted leading-snug">
                    {t.sub}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          <div className="rounded-2xl border border-border bg-bg-subtle/60">
            <button
              type="button"
              onClick={() => setReturningOpen((o) => !o)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div>
                <div className="text-sm font-medium text-fg">
                  I&apos;ve done some of this before
                </div>
                <div className="text-[11px] text-fg-muted mt-0.5">
                  Skip ahead a few days and mark patterns you already know.
                  You can still revisit them later.
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-fg-muted transition-transform",
                  returningOpen && "rotate-180",
                )}
              />
            </button>
            {returningOpen && (
              <div className="border-t border-border p-4 space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] uppercase tracking-widest text-fg-muted">
                      Start on day
                    </div>
                    <div className="text-sm font-display font-semibold">
                      {dayOffset + 1}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, planLength - 1)}
                    value={dayOffset}
                    onChange={(e) => setDayOffset(Number(e.target.value))}
                    className="mt-2 w-full accent-brand"
                  />
                  <div className="flex justify-between text-[10px] text-fg-subtle mt-1">
                    <span>Day 1 · fresh start</span>
                    <span>Day {planLength}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-widest text-fg-muted mb-2">
                    Patterns I already know
                  </div>
                  <p className="text-[11px] text-fg-subtle mb-3">
                    We&apos;ll still schedule lightweight refreshers for these
                    — but won&apos;t treat them like first-time material.
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                    {PATTERNS.map((p) => {
                      const active = familiar.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleFamiliar(p.id)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs transition-all",
                            active
                              ? "border-brand bg-brand-soft text-fg"
                              : "border-border bg-bg-elevated text-fg-muted hover:border-border-strong",
                          )}
                        >
                          {active ? "✓ " : ""}
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                  {familiar.length > 0 && (
                    <div className="mt-2 text-[11px] text-fg-subtle">
                      {familiar.length} pattern
                      {familiar.length === 1 ? "" : "s"} marked as familiar.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <Button onClick={handleStart} size="lg">
            {dayOffset > 0
              ? `Jump to day ${dayOffset + 1}`
              : `Start my ${planLength} days`}{" "}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <span className="text-xs text-fg-subtle">
            Progress lives locally. Nothing leaves your browser.
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-fg-muted mb-2">
        {label}
      </div>
      {children}
      {hint && <p className="mt-2 text-[11px] text-fg-subtle">{hint}</p>}
    </div>
  );
}


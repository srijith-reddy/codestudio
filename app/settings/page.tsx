"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { PlanLength, TracksEnabled } from "@/lib/types";

export default function SettingsPage() {
  const [hydrated, setHydrated] = useState(false);
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  const resetAll = useApp((s) => s.resetAll);

  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <div className="text-xs uppercase tracking-widest text-fg-muted">
          Settings
        </div>
        <h1 className="mt-2 text-3xl font-display font-semibold tracking-tight">
          Shape the experience
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          Pacing, tone, and the little knobs. Everything lives locally.
        </p>
      </header>

      <Card className="p-6 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-fg-muted mb-2">
            Plan length
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[30, 60, 90].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() =>
                  setPrefs({ planLength: n as PlanLength, targetDays: n })
                }
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition-all",
                  prefs.planLength === n
                    ? "border-brand bg-brand-soft/40"
                    : "border-border bg-bg-elevated hover:border-border-strong",
                )}
              >
                <div className="text-xl font-display font-semibold">
                  {n}
                  <span className="text-[10px] uppercase tracking-widest text-fg-subtle font-sans ml-1">
                    days
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-fg-muted">
                  {n === 30 ? "Sprint" : n === 60 ? "Balanced" : "Mastery"}
                </div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-fg-subtle italic">
            Switching mid-arc adjusts your daily pacing. Mastery days stay
            intact; only the stretch factor changes.
          </p>
        </div>

        <Toggle
          label="Theme"
          value={prefs.theme}
          options={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
          onChange={(v) => setPrefs({ theme: v as "dark" | "light" })}
        />
        <Toggle
          label="Coach tone"
          value={prefs.tone}
          options={[
            { value: "calm", label: "Calm" },
            { value: "focused", label: "Focused" },
            { value: "competitive", label: "Competitive-lite" },
          ]}
          onChange={(v) => setPrefs({ tone: v as any })}
        />
        <Toggle
          label="Starting track"
          value={prefs.tracks}
          options={[
            { value: "dsa", label: "DSA" },
            { value: "sql", label: "SQL" },
          ]}
          onChange={(v) => setPrefs({ tracks: v as TracksEnabled })}
        />
      </Card>

      <Card className="p-6">
        <div className="text-xs uppercase tracking-widest text-fg-muted">
          Danger zone
        </div>
        <p className="mt-2 text-sm text-fg-muted">
          Reset all local progress — streak, XP, mastery, mission state, and
          revealed artwork tiles. This is irreversible.
        </p>
        <div className="mt-4">
          <Button variant="danger" onClick={() => resetAll()}>
            Reset everything
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Toggle({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-fg-muted mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm transition-all",
              o.value === value
                ? "border-brand bg-brand-soft text-fg"
                : "border-border bg-bg-elevated text-fg-muted hover:border-border-strong",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

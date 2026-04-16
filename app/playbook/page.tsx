"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  NotebookPen,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { PATTERN_MAP } from "@/lib/data/patterns";
import type { PlaybookEntry } from "@/lib/types";

/**
 * Playbook — the user's own interview notebook.
 *
 * Every reflection at the end of a mission lands here. Entries are grouped
 * by pattern so a user can study their own phrasing for, say, sliding window
 * on the morning of an interview. Deliberately light on chrome: this is a
 * reading surface, not a dashboard.
 */
export default function PlaybookPage() {
  const playbook = useApp((s) => s.playbook);
  const removeEntry = useApp((s) => s.removePlaybookEntry);
  const [filter, setFilter] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, PlaybookEntry[]>();
    for (const entry of playbook) {
      const list = map.get(entry.patternId) || [];
      list.push(entry);
      map.set(entry.patternId, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => b.createdAt - a.createdAt);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      const oa = PATTERN_MAP[a]?.order ?? 99;
      const ob = PATTERN_MAP[b]?.order ?? 99;
      return oa - ob;
    });
  }, [playbook]);

  const visible = filter
    ? grouped.filter(([patternId]) => patternId === filter)
    : grouped;

  const totalEntries = playbook.length;

  if (totalEntries === 0) {
    return <EmptyPlaybook />;
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="text-xs uppercase tracking-widest text-fg-muted flex items-center gap-2">
          <NotebookPen className="h-3.5 w-3.5" /> Personal playbook
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
          Your interview notebook.
        </h1>
        <p className="text-sm text-fg-muted max-w-2xl leading-relaxed">
          Every reflection you&apos;ve written lives here, in your own words.
          On interview mornings, skim this — not tutorials — to get back into
          the zone. It grows one honest line at a time.
        </p>
        <div className="flex items-center gap-3 pt-1 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5" /> {totalEntries}{" "}
            {totalEntries === 1 ? "entry" : "entries"}
          </span>
          <span>·</span>
          <span>
            {grouped.length} {grouped.length === 1 ? "pattern" : "patterns"}
          </span>
        </div>
      </header>

      {grouped.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === null}
            onClick={() => setFilter(null)}
            label={`All · ${totalEntries}`}
          />
          {grouped.map(([patternId, entries]) => {
            const pattern = PATTERN_MAP[patternId];
            if (!pattern) return null;
            return (
              <FilterChip
                key={patternId}
                active={filter === patternId}
                onClick={() =>
                  setFilter(filter === patternId ? null : patternId)
                }
                label={`${pattern.name} · ${entries.length}`}
              />
            );
          })}
        </div>
      )}

      <div className="space-y-10">
        <AnimatePresence initial={false}>
          {visible.map(([patternId, entries]) => {
            const pattern = PATTERN_MAP[patternId];
            return (
              <motion.section
                key={patternId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="flex items-end justify-between gap-4 border-b border-border pb-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-fg-muted">
                      Pattern
                    </div>
                    <h2 className="text-xl font-display font-semibold tracking-tight mt-0.5">
                      {pattern?.name ?? patternId}
                    </h2>
                    {pattern?.tagline && (
                      <p className="text-xs text-fg-muted mt-1 max-w-lg">
                        {pattern.tagline}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/patterns/${patternId}`}
                    className="text-xs text-fg-muted hover:text-fg inline-flex items-center gap-1"
                  >
                    Revisit pattern <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entries.map((entry) => (
                    <PlaybookCard
                      key={entry.id}
                      entry={entry}
                      onDelete={() => removeEntry(entry.id)}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </AnimatePresence>
      </div>

      <footer className="rounded-2xl border border-border bg-bg-subtle px-5 py-4 text-sm text-fg-muted flex items-start gap-3">
        <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
        <div className="leading-relaxed">
          New reflections land here automatically at the end of each mission.
          Nothing is graded. The point isn&apos;t to be impressive — it&apos;s
          to capture the sentence that will unlock this pattern for you at 2am
          before an onsite.
        </div>
      </footer>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-3 py-1 text-xs border transition-colors " +
        (active
          ? "bg-fg text-bg border-fg"
          : "bg-bg-subtle text-fg-muted border-border hover:border-border-strong hover:text-fg")
      }
    >
      {label}
    </button>
  );
}

function PlaybookCard({
  entry,
  onDelete,
}: {
  entry: PlaybookEntry;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const date = new Date(entry.createdAt);
  const dateLabel = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div layout>
      <Card className="p-5 h-full group relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-fg-muted">
            <Badge tone="neutral">Day {entry.day}</Badge>
            <span>{dateLabel}</span>
          </div>
          <ConfidenceDots value={entry.confidence} />
        </div>

        <blockquote className="text-base leading-relaxed font-display text-fg">
          &ldquo;{entry.rememberLine}&rdquo;
        </blockquote>

        {(entry.clue || entry.pitfall) && (
          <div className="space-y-2 text-xs text-fg-muted border-t border-border pt-3">
            {entry.clue && (
              <div>
                <span className="uppercase tracking-widest text-[10px] text-fg-muted/80">
                  Clue ·{" "}
                </span>
                <span className="text-fg">{entry.clue}</span>
              </div>
            )}
            {entry.pitfall && (
              <div>
                <span className="uppercase tracking-widest text-[10px] text-fg-muted/80">
                  Watch out ·{" "}
                </span>
                <span className="text-fg">{entry.pitfall}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          {entry.problemId ? (
            <Link
              href={`/problems/${entry.problemId}`}
              className="text-[11px] text-fg-muted hover:text-fg inline-flex items-center gap-1"
            >
              Revisit problem <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <span />
          )}

          {confirming ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="text-[11px] text-fg-muted hover:text-fg"
              >
                Cancel
              </button>
              <Button
                size="sm"
                variant="danger"
                onClick={onDelete}
                className="h-7 px-2 text-[11px]"
              >
                Delete
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-fg-muted hover:text-danger p-1"
              aria-label="Delete entry"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function ConfidenceDots({ value }: { value: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Confidence ${value} of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={
            "h-1.5 w-1.5 rounded-full " +
            (n <= value ? "bg-accent" : "bg-border")
          }
        />
      ))}
    </div>
  );
}

function EmptyPlaybook() {
  return (
    <div className="max-w-2xl mx-auto pt-6 space-y-8">
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-widest text-fg-muted flex items-center gap-2">
          <NotebookPen className="h-3.5 w-3.5" /> Personal playbook
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
          This will become your own interview notebook.
        </h1>
        <p className="text-sm text-fg-muted leading-relaxed">
          At the end of every mission, you&apos;ll write one honest line about
          what you want to remember. Those lines land here — grouped by
          pattern, in your own voice. Nothing is scored. Nothing is shared.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-fg">
          <BookOpen className="h-4 w-4 text-accent" />
          How it works
        </div>
        <ol className="text-sm text-fg-muted space-y-2 list-decimal list-inside leading-relaxed">
          <li>Run a mission on Today.</li>
          <li>
            At the <em>Reflect</em> step, capture the sentence that unlocked
            the pattern for you.
          </li>
          <li>
            Come back here the morning of an interview and read your own
            words.
          </li>
        </ol>
        <div className="pt-2">
          <Link href="/">
            <Button size="sm">
              Start today&apos;s mission <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </Card>

      <p className="text-xs text-fg-muted/80 italic text-center">
        A playbook with three real lines beats a course with a thousand.
      </p>
    </div>
  );
}

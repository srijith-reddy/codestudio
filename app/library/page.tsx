"use client";

import Link from "next/link";
import {
  ArrowRight,
  Layers,
  NotebookPen,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PATTERNS } from "@/lib/data/patterns";
import { PROBLEMS } from "@/lib/data/problems";

/**
 * Library = reference mode. Not the primary daily UX. The Mission flow on
 * Today is where day-to-day work happens; Library is where you browse,
 * revisit, or go deeper on demand.
 */
export default function LibraryPage() {
  const playbookCount = useApp((s) => s.playbook.length);
  const sections = [
    {
      href: "/patterns",
      title: "Pattern library",
      description: `${PATTERNS.length} core patterns. Skeletons, triggers, helpers, curated problems.`,
      icon: Layers,
      count: `${PROBLEMS.length} problems`,
    },
    {
      href: "/playbook",
      title: "Personal playbook",
      description:
        "Your own interview notebook. Every reflection you write at the end of a mission lands here.",
      icon: NotebookPen,
      count:
        playbookCount === 0
          ? "empty so far"
          : `${playbookCount} ${playbookCount === 1 ? "entry" : "entries"}`,
    },
  ];

  return (
    <div className="space-y-10">
      <header>
        <div className="text-xs uppercase tracking-widest text-fg-muted">
          Library
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tight">
          Reference & deep dives.
        </h1>
        <p className="mt-2 text-sm text-fg-muted max-w-2xl">
          Your daily work lives in{" "}
          <Link href="/" className="text-fg underline">
            Today's mission
          </Link>
          . The Library is for browsing patterns, re-reading skeletons, or
          skipping ahead.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href}>
              <Card className="p-6 h-full hover:border-border-strong transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-bg-subtle border border-border flex items-center justify-center">
                      <Icon className="h-4 w-4 text-fg-muted" />
                    </div>
                    <div>
                      <div className="text-lg font-display font-semibold">
                        {s.title}
                      </div>
                      <div className="text-sm text-fg-muted">
                        {s.description}
                      </div>
                    </div>
                  </div>
                  <Badge tone="neutral">{s.count}</Badge>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm text-fg-muted group-hover:text-fg transition-colors">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

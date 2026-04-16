"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Flag, Lightbulb } from "lucide-react";
import { PATTERN_MAP } from "@/lib/data/patterns";
import { PROBLEMS_BY_PATTERN } from "@/lib/data/problems";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function PatternDetailPage() {
  const params = useParams<{ id: string }>();
  const pattern = params.id ? PATTERN_MAP[params.id] : undefined;
  const [hydrated, setHydrated] = useState(false);
  const patternMastery = useApp((s) => s.patternMastery);
  const problemProgress = useApp((s) => s.problemProgress);

  useEffect(() => setHydrated(true), []);

  if (!pattern) return notFound();

  const problems = PROBLEMS_BY_PATTERN[pattern.id] || [];
  const mastery = hydrated ? patternMastery(pattern.id) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-fg-subtle">
        <Link href="/patterns" className="hover:text-fg">
          Patterns
        </Link>
        <span>/</span>
        <span>{pattern.name}</span>
      </div>

      {/* Hero */}
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border p-8 md:p-10 bg-bg-elevated",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-70",
            pattern.accent,
          )}
          aria-hidden
        />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-widest text-fg-muted">
            Pattern {String(pattern.order).padStart(2, "0")}
          </div>
          <h1 className="mt-2 text-4xl md:text-5xl font-display font-semibold tracking-tight">
            {pattern.name}
          </h1>
          <p className="mt-2 text-base text-fg-muted max-w-2xl">{pattern.summary}</p>

          <div className="mt-6 max-w-sm">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-fg-subtle mb-1.5">
              <span>Mastery</span>
              <span>{mastery}%</span>
            </div>
            <Progress value={mastery} />
          </div>
        </div>
      </section>

      {/* Triggers + core idea */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <Flag className="h-3.5 w-3.5" /> Trigger phrases
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {pattern.triggers.map((t) => (
              <Badge key={t} tone="brand">
                {t}
              </Badge>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <Lightbulb className="h-3.5 w-3.5" /> Core idea
          </div>
          <p className="mt-3 text-sm text-fg-muted leading-relaxed">
            {pattern.coreIdea}
          </p>
        </Card>
      </div>

      {/* Skeleton code */}
      <Card className="p-6">
        <div className="text-xs uppercase tracking-widest text-fg-muted">
          Python skeleton
        </div>
        <pre className="mt-4 code rounded-xl border border-border bg-bg-subtle p-4 overflow-x-auto scrollbar-thin">
{pattern.skeletonCode}
        </pre>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-fg-subtle mb-2">
              Helpers used
            </div>
            <ul className="space-y-1.5">
              {pattern.helperSyntax.map((h) => (
                <li key={h} className="code text-fg-muted">
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-fg-subtle mb-2">
              Common mistakes
            </div>
            <ul className="space-y-1.5">
              {pattern.commonMistakes.map((m) => (
                <li key={m} className="text-sm text-fg-muted flex gap-2">
                  <span className="text-danger">✗</span> {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Curated problems */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-fg-muted">
              Curated problems
            </div>
            <h2 className="text-2xl font-display font-semibold">
              Easy & Medium first
            </h2>
          </div>
          <Badge tone="neutral">{problems.length}</Badge>
        </div>
        <div className="space-y-2">
          {problems.map((p) => {
            const rec = problemProgress[p.id];
            const done =
              rec?.status === "solved_alone" || rec?.status === "mastered";
            return (
              <Link
                key={p.id}
                href={`/problems/${p.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-bg-elevated px-5 py-4 hover:border-border-strong transition-all"
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-border" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-fg-subtle">
                    {p.learningObjective}
                  </div>
                </div>
                <Badge
                  tone={
                    p.difficulty === "Easy"
                      ? "success"
                      : p.difficulty === "Medium"
                        ? "warning"
                        : "danger"
                  }
                >
                  {p.difficulty}
                </Badge>
                <ArrowRight className="h-4 w-4 text-fg-subtle group-hover:text-fg transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}

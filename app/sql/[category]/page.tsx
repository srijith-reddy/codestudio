"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowRight, Lightbulb, AlertTriangle, Code2 } from "lucide-react";
import {
  SQL_CATEGORY_MAP,
  SQL_PROBLEMS_BY_CATEGORY,
} from "@/lib/data/sql";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SqlCategoryPage() {
  const params = useParams<{ category: string }>();
  const category = params.category ? SQL_CATEGORY_MAP[params.category] : undefined;
  if (!category) return notFound();
  const problems = SQL_PROBLEMS_BY_CATEGORY[category.id] || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-fg-subtle">
        <Link href="/sql/library" className="hover:text-fg">
          SQL Library
        </Link>
        <span>/</span>
        <span>{category.name}</span>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-border bg-bg-elevated p-8 md:p-10">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
            category.accent,
          )}
          aria-hidden
        />
        <div className="relative">
          <div className="text-xs uppercase tracking-widest text-fg-muted">
            Category {String(category.order).padStart(2, "0")}
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tight">
            {category.name}
          </h1>
          <p className="mt-2 text-sm text-fg-muted">{category.tagline}</p>
          <p className="mt-4 text-sm text-fg-muted max-w-2xl leading-relaxed">
            {category.coreIdea}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <Code2 className="h-3.5 w-3.5" /> Key syntax
          </div>
          <ul className="mt-3 space-y-1.5">
            {category.keySyntax.map((k) => (
              <li key={k} className="text-sm">
                <code className="code text-fg">{k}</code>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted">
            <AlertTriangle className="h-3.5 w-3.5" /> Common mistakes
          </div>
          <ul className="mt-3 space-y-1.5">
            {category.commonMistakes.map((m) => (
              <li key={m} className="text-sm text-fg-muted flex gap-2">
                <span className="text-warning">!</span> {m}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-fg-muted mb-3">
          <Lightbulb className="h-3.5 w-3.5" /> Problems
        </div>
        <div className="space-y-3">
          {problems.map((p) => (
            <Link key={p.id} href={`/sql/problems/${p.id}`}>
              <Card className="p-5 hover:border-border-strong transition-all flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{p.title}</div>
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
                  </div>
                  <div className="mt-1 text-xs text-fg-muted line-clamp-1">
                    {p.learningObjective}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-fg-subtle shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

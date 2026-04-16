"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import { PATTERN_MAP, PATTERNS } from "@/lib/data/patterns";
import { PROBLEM_MAP } from "@/lib/data/problems";
import { SQL_CATEGORY_MAP, SQL_PROBLEMS } from "@/lib/data/sql";
import {
  ARTWORKS,
  ARTWORK_ORDER,
  commonsImageUrl,
  distributeTiles,
  totalTiles,
  type Artwork,
} from "@/lib/data/artwork";
import { fetchDiverseBatch } from "@/lib/gallery/fetch-met";
import { cn } from "@/lib/utils";

export default function ProgressPage() {
  const [hydrated, setHydrated] = useState(false);
  const [fetchingMet, setFetchingMet] = useState(false);
  const xp = useApp((s) => s.xp);
  const level = useApp((s) => s.level());
  const streak = useApp((s) => s.streak);
  const missionProgress = useApp((s) => s.missionProgress);
  const puzzleProgress = useApp((s) => s.puzzleProgress);
  const artProgress = useApp((s) => s.artProgress);
  const dueForReview = useApp((s) => s.dueForReview);
  const sqlDueForReview = useApp((s) => s.sqlDueForReview);
  const sqlProgress = useApp((s) => s.sqlProgress);
  const patternMastery = useApp((s) => s.patternMastery);
  const problemProgress = useApp((s) => s.problemProgress);
  const dayScores = useApp((s) => s.dayScores);
  const dynamicArtworks = useApp((s) => s.dynamicArtworks);
  const lastMetFetch = useApp((s) => s.lastMetFetch);
  const mergeDynamicArtworks = useApp((s) => s.mergeDynamicArtworks);

  useEffect(() => setHydrated(true), []);

  // Merged catalog: seed paintings first (stable order, 1:1 problem mapping),
  // then runtime-fetched Met Museum pieces. The progress gallery iterates
  // this merged list so the wall keeps growing as fetches come in.
  const effectiveCatalog = useMemo<Artwork[]>(() => {
    const seed = ARTWORK_ORDER.map((id) => ARTWORKS[id]);
    if (!hydrated) return seed;
    return [...seed, ...dynamicArtworks];
  }, [hydrated, dynamicArtworks]);

  // Auto-fetch from the Met API when the gallery needs more paintings.
  // Conditions: hydrated, not already fetching, and either
  //   (a) we have no dynamic paintings yet and the user has real progress
  //       (xp > 0 — i.e. they've engaged, no point burning API on a cold visit)
  //   (b) the user has unlocked >80% of whatever catalog we currently have
  //       and the last fetch was >24h ago (so cycling keeps the wall fresh).
  useEffect(() => {
    if (!hydrated || fetchingMet) return;
    const unlockedPct =
      artProgress.tilesRevealed /
      Math.max(1, totalTiles(effectiveCatalog));
    const firstTimeEngaged = dynamicArtworks.length === 0 && xp > 0;
    const dayMs = 24 * 60 * 60 * 1000;
    const staleEnough = !lastMetFetch || Date.now() - lastMetFetch > dayMs;
    const nearingEnd = unlockedPct > 0.8 && staleEnough;
    if (!firstTimeEngaged && !nearingEnd) return;
    setFetchingMet(true);
    fetchDiverseBatch(10, 4)
      .then((works) => {
        if (works.length > 0) mergeDynamicArtworks(works);
      })
      .catch(() => {
        // Network hiccup — silent. The seed catalog still renders fine.
      })
      .finally(() => setFetchingMet(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Wrap in useMemo so dueForReview() doesn't run on every render
  const due = useMemo(() => (hydrated ? dueForReview() : []), [hydrated, dueForReview, problemProgress]);
  const sqlDue = useMemo(
    () => (hydrated ? sqlDueForReview() : []),
    [hydrated, sqlDueForReview, sqlProgress],
  );

  const missionDays = useMemo(
    () => (hydrated ? Object.values(missionProgress).filter((m) => m.finishedAt).length : 0),
    [hydrated, missionProgress],
  );

  const puzzlesClean = useMemo(
    () =>
      hydrated
        ? Object.values(puzzleProgress).filter(
            (p) => p.status === "solved_alone" || p.status === "mastered",
          ).length
        : 0,
    [hydrated, puzzleProgress],
  );

  const totalTilesCount = useMemo(
    () => totalTiles(effectiveCatalog),
    [effectiveCatalog],
  );
  const tilesRevealed = hydrated ? artProgress.tilesRevealed : 0;
  const galleryPct = Math.min(100, Math.round((tilesRevealed / totalTilesCount) * 100));
  const tileDistribution = useMemo(
    () => (hydrated ? distributeTiles(tilesRevealed, effectiveCatalog) : {}),
    [hydrated, tilesRevealed, effectiveCatalog],
  );

  const patternsWithProgress = useMemo(() => {
    if (!hydrated) return [] as { id: string; mastery: number }[];
    return PATTERNS.map((p) => ({ id: p.id, mastery: patternMastery(p.id) }));
  }, [hydrated, patternMastery, problemProgress]);

  const weakPatterns = useMemo(
    () =>
      patternsWithProgress
        .filter((p) => p.mastery > 0 && p.mastery < 50)
        .sort((a, b) => a.mastery - b.mastery)
        .slice(0, 4),
    [patternsWithProgress],
  );

  const strongPatterns = useMemo(
    () =>
      patternsWithProgress
        .filter((p) => p.mastery >= 70)
        .sort((a, b) => b.mastery - a.mastery)
        .slice(0, 4),
    [patternsWithProgress],
  );

  const scoreHistory = useMemo(() => {
    if (!hydrated) return [];
    return Object.values(dayScores)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .slice(-14);
  }, [hydrated, dayScores]);

  const personalBest = useMemo(() => {
    if (scoreHistory.length === 0) return null;
    return scoreHistory.reduce(
      (best, s) => (s.totalPoints > best.totalPoints ? s : best),
      scoreHistory[0],
    );
  }, [scoreHistory]);

  const lifetimePoints = useMemo(
    () => scoreHistory.reduce((acc, s) => acc + s.totalPoints, 0),
    [scoreHistory],
  );

  const maxHistoryPoints = useMemo(
    () => Math.max(1, ...scoreHistory.map((s) => s.totalPoints)),
    [scoreHistory],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
          <Activity className="h-3 w-3" /> Progress
        </div>
        <h1 className="mt-2 font-display text-2xl md:text-3xl text-fg">
          How you&rsquo;re doing.
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Complete a daily mission to unlock painting tiles. Solve a problem without hints to unlock two.
        </p>
      </header>

      {/* Stats — 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Trophy} label="Level" value={hydrated ? level : "—"} sub={`${hydrated ? xp : 0} XP total`} />
        <StatCard icon={Flame}  label="Streak" value={hydrated ? `${streak}d` : "—"} sub="days in a row" />
        <StatCard icon={CheckCircle2} label="Days done" value={missionDays} sub="missions finished" />
        <StatCard icon={BookOpen} label="Paintings" value={`${galleryPct}%`} sub={`${tilesRevealed} / ${totalTilesCount} tiles`} />
      </div>

      {/* Score history */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">Score history</div>
            <h2 className="mt-1 font-display text-xl text-fg">
              {scoreHistory.length === 0
                ? "Finish your first solve to see scores here."
                : "Your last 14 days."}
            </h2>
          </div>
          {personalBest && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">Best day</div>
              <div className="mt-0.5 font-display text-2xl text-brand tabular-nums">
                {personalBest.totalPoints}
              </div>
              <div className="text-[10px] text-zinc-600">{personalBest.dateKey}</div>
            </div>
          )}
        </div>

        {scoreHistory.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <Zap className="h-3.5 w-3.5 text-brand" />
                <span className="tabular-nums text-fg">{lifetimePoints}</span>
                <span>
                  total points · {scoreHistory.length} day{scoreHistory.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
                + no hints · − hints used · − going back
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-28">
              {scoreHistory.map((s) => {
                const pct = Math.round((s.totalPoints / maxHistoryPoints) * 100);
                const isBest = personalBest?.dateKey === s.dateKey;
                return (
                  <div
                    key={s.dateKey}
                    className="flex-1 flex flex-col items-center gap-1.5 min-w-0"
                    title={`${s.dateKey} · ${s.totalPoints} pts`}
                  >
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t-sm transition-colors ${
                          isBest ? "bg-gradient-to-t from-brand to-brand/50" : "bg-zinc-700"
                        }`}
                        style={{ height: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-zinc-600 font-mono tabular-nums">
                      {s.dateKey.slice(5)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </section>

      {/* Painting gallery — pure CSS tiles, no external image requests */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">Painting gallery</div>
            <h2 className="mt-1 font-display text-xl text-fg">
              {tilesRevealed === 0
                ? "Solve problems to reveal the paintings."
                : `${galleryPct}% revealed across ${effectiveCatalog.length} paintings.`}
            </h2>
            {fetchingMet && (
              <div className="mt-1 text-[11px] text-zinc-500">
                Fetching more paintings from the Met Museum…
              </div>
            )}
          </div>
          <div className="text-[11px] text-zinc-600 font-mono text-right shrink-0">
            {tilesRevealed} / {totalTilesCount}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {effectiveCatalog.map((art) => {
            const count = tileDistribution[art.id] ?? 0;
            const cap = art.cols * art.rows;
            const pct = Math.round((count / cap) * 100);
            return (
              <div key={art.id} className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
                {/* Pure CSS tile grid — no network requests */}
                <TileGrid art={art} tilesRevealed={count} />
                <div className="px-4 py-3 border-t border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-display text-fg truncate">{art.title}</div>
                      <div className="text-[11px] text-zinc-600 truncate">{art.artist}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-display text-lg text-brand tabular-nums">{pct}%</div>
                      <div className="text-[10px] text-zinc-600 font-mono">{count}/{cap}</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2.5 h-1 w-full rounded-full bg-bg-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Review queue — combined DSA + SQL, SRS-ordered by oldest-overdue */}
      <section className="space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">Due for review</div>
          <h2 className="mt-1 font-display text-xl text-fg">
            {due.length + sqlDue.length === 0
              ? "Nothing due right now."
              : `${due.length + sqlDue.length} problem${due.length + sqlDue.length === 1 ? "" : "s"} to practice again`}
          </h2>
        </div>
        {due.length + sqlDue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {due.slice(0, 4).map((id) => {
              const p = PROBLEM_MAP[id];
              if (!p) return null;
              return (
                <Link key={`dsa:${id}`} href={`/problems/${id}`}>
                  <Card className="p-4 border-l-2 border-l-brand hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-fg truncate">{p.title}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          DSA · {PATTERN_MAP[p.patternId]?.name}
                        </div>
                      </div>
                      <Badge tone="neutral">{p.difficulty}</Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
            {sqlDue.slice(0, 4).map((id) => {
              const p = SQL_PROBLEMS.find((sp) => sp.id === id);
              if (!p) return null;
              return (
                <Link key={`sql:${id}`} href={`/sql/problems/${id}`}>
                  <Card className="p-4 border-l-2 border-l-accent hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-fg truncate">{p.title}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          SQL · {SQL_CATEGORY_MAP[p.categoryId]?.name}
                        </div>
                      </div>
                      <Badge tone="neutral">{p.difficulty}</Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Problems show up here the day after you solve them. Come back each day to keep them fresh in memory.
          </p>
        )}
      </section>

      {/* Pattern mastery */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-zinc-600" />
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Needs work</div>
          </div>
          {weakPatterns.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No weak spots yet. Keep solving and they&rsquo;ll show up here.
            </p>
          ) : (
            <div className="space-y-3">
              {weakPatterns.map((p) => {
                const pat = PATTERN_MAP[p.id];
                return (
                  <Link key={p.id} href={`/patterns/${p.id}`} className="block group">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300 group-hover:text-fg transition-colors">{pat?.name}</span>
                      <span className="text-zinc-600 font-mono text-[11px]">{p.mastery}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-bg-subtle overflow-hidden">
                      <div className="h-full rounded-full bg-zinc-600" style={{ width: `${p.mastery}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-brand" />
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Strongest</div>
          </div>
          {strongPatterns.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nothing above 70% yet. Keep going — it gets there.
            </p>
          ) : (
            <div className="space-y-3">
              {strongPatterns.map((p) => {
                const pat = PATTERN_MAP[p.id];
                return (
                  <Link key={p.id} href={`/patterns/${p.id}`} className="block group">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-200 group-hover:text-fg transition-colors">{pat?.name}</span>
                      <span className="text-brand font-mono text-[11px]">{p.mastery}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-bg-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-brand/60"
                        style={{ width: `${p.mastery}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      {/* Footer */}
      <div className="text-xs text-zinc-600 flex items-center gap-2 pb-4">
        <span>
          Clean solves: <span className="text-fg">{puzzlesClean}</span>
        </span>
        <span>·</span>
        <Link href="/" className="inline-flex items-center gap-1 hover:text-fg transition-colors">
          Back to today <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

/** Gallery tile grid — renders the real painting behind a tile mask.
 *  Unrevealed tiles dim the painting; revealed tiles clear out. Borderless so
 *  the grid lines don't cut across the image. */
function TileGrid({ art, tilesRevealed }: { art: Artwork; tilesRevealed: number }) {
  const total = art.cols * art.rows;
  const revealed = Math.min(total, Math.max(0, tilesRevealed));
  const [imgFailed, setImgFailed] = useState(false);
  const src = art.imageUrl ?? commonsImageUrl(art.commonsFile, 800);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: art.background,
        aspectRatio: `${art.cols} / ${Math.ceil(art.rows / 1.5)}`,
      }}
    >
      {!imgFailed && (
        <img
          src={src}
          alt={`${art.title} — ${art.artist}`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      )}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${art.cols}, 1fr)`,
          gridTemplateRows: `repeat(${art.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={i >= revealed ? "bg-bg/85" : ""}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-2 font-display text-3xl text-fg">{value}</div>
      <div className="text-[11px] text-zinc-600 mt-0.5">{sub}</div>
    </Card>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  ARTWORKS,
  commonsImageUrl,
  type Artwork,
} from "@/lib/data/artwork";
import { cn } from "@/lib/utils";

/**
 * Renders a real public-domain painting (loaded from Wikimedia Commons via
 * the stable Special:FilePath redirector) behind a tile mask. Tiles reveal
 * in a boustrophedon reading order so the progression sweeps back and forth
 * like a brush stroke.
 *
 * If the image fails to load (e.g. user is offline, Wikimedia 404s on a
 * filename typo), we gracefully fall back to the gradient background plus
 * a small caption so the canvas never renders broken. This is the whole
 * reason we keep a background gradient per painting in the data file.
 */
export function ArtworkCanvas({
  artworkId,
  tilesRevealed,
  className,
  height = 220,
  imageWidth = 1200,
}: {
  artworkId: string;
  tilesRevealed: number;
  className?: string;
  height?: number;
  /** Width param passed to Commons when requesting the thumbnail. */
  imageWidth?: number;
}) {
  const art = ARTWORKS[artworkId];
  const [imgFailed, setImgFailed] = useState(false);

  // Precompute a per-tile reveal rank once per painting. revealOrder used to
  // run per render, and each tile did an O(n) `indexOf` lookup — 60 tiles
  // meant 3600 indexOf calls per render, and the tile-by-tile setInterval
  // during Echo triggered ~60 renders in a row per canvas. That was the
  // scroll-lag source. Now: one O(n) build, tile lookups are O(1).
  const revealRank = useMemo(() => {
    if (!art) return null;
    const total = art.cols * art.rows;
    const rank = new Int16Array(total);
    let k = 0;
    for (let r = 0; r < art.rows; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < art.cols; c++) rank[r * art.cols + c] = k++;
      } else {
        for (let c = art.cols - 1; c >= 0; c--)
          rank[r * art.cols + c] = k++;
      }
    }
    return rank;
  }, [art]);

  if (!art || !revealRank) return null;
  const totalTiles = art.cols * art.rows;
  const clamped = Math.max(0, Math.min(totalTiles, tilesRevealed));
  // Runtime-fetched paintings carry a direct `imageUrl`; seed paintings use
  // their Commons filename. Prefer the direct URL when present.
  const src = art.imageUrl ?? commonsImageUrl(art.commonsFile, imageWidth);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border",
        className,
      )}
      style={{ background: art.background, height }}
    >
      {/* Underlying painting — real image from Wikimedia Commons.
          `referrerPolicy="no-referrer"` avoids any referer-based blocks;
          Wikimedia's CDN allows anonymous hotlinking at reasonable scale. */}
      {!imgFailed && (
        <img
          src={src}
          alt={`${art.title} — ${art.artist}`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      )}

      {/* Tile mask layer — plain divs with CSS transitions. 60 motion.divs
          per canvas was causing scroll jank when multiple canvases animated
          simultaneously. CSS `opacity` transitions are GPU-composited and
          cost effectively nothing per tile. */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${art.cols}, 1fr)`,
          gridTemplateRows: `repeat(${art.rows}, 1fr)`,
          willChange: "contents",
        }}
      >
        {Array.from({ length: totalTiles }).map((_, i) => {
          const revealIndex = revealRank[i];
          const revealed = revealIndex < clamped;
          return (
            <div
              key={i}
              className="bg-bg/85"
              style={{
                opacity: revealed ? 0 : 1,
                transition: "opacity 550ms cubic-bezier(0.22, 1, 0.36, 1)",
                transitionDelay: revealed ? `${(revealIndex % 6) * 30}ms` : "0ms",
              }}
            />
          );
        })}
      </div>

      {/* Caption — always legible against the gradient veil at bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-white/60 truncate">
              {art.artist} · {art.year}
            </div>
            <div className="text-sm font-display font-semibold text-white/95 truncate">
              {art.title}
            </div>
            <div className="text-[10px] text-white/50 italic truncate">
              {art.culture}
            </div>
          </div>
          <div className="text-[11px] text-white/70 font-mono shrink-0">
            {clamped} / {totalTiles}
          </div>
        </div>
      </div>
    </div>
  );
}


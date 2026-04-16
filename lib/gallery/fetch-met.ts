/**
 * Runtime-fetched paintings from the Metropolitan Museum of Art Collection API.
 *
 * Why runtime instead of build-time:
 *   - No API key, no rate limit headaches at build time.
 *   - Lets the gallery grow *after* the app is deployed — as the user works
 *     through the seed catalogue, we fetch more so the wall never goes empty.
 *   - Cultural diversity is a hard requirement. The Met's department system
 *     gives us a clean way to rotate across continents and centuries.
 *
 * Diversity strategy: we rotate through six departments covering different
 * cultures and regions, requesting roughly equal slices from each. Without
 * this, a naive `q=painting` search returns overwhelmingly European works.
 *
 *   5  · Arts of Africa, Oceania, and the Americas
 *   6  · Asian Art (China, Japan, Korea, India, SE Asia)
 *   10 · Egyptian Art
 *   11 · European Paintings
 *   14 · Islamic Art
 *   17 · Medieval Art
 *
 * Only public-domain works with a `primaryImage` are kept — the API returns
 * many records that are metadata-only or still under copyright, so we filter.
 *
 * Network behaviour: the caller (progress page) throttles this so we don't
 * hammer the Met API on every render — fetch once per day, persisted via
 * the Zustand store.
 */

import type { Artwork } from "@/lib/data/artwork";

const BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

const DIVERSE_DEPTS: { id: number; label: string; gradient: string }[] = [
  {
    id: 5,
    label: "Africa · Oceania · Americas",
    gradient:
      "radial-gradient(ellipse at center, #5A2A14 0%, #1a0a05 70%, #0a0504 100%)",
  },
  {
    id: 6,
    label: "Asia",
    gradient:
      "radial-gradient(ellipse at center, #2A1A0F 0%, #120a05 70%, #05020a 100%)",
  },
  {
    id: 10,
    label: "Ancient Egypt",
    gradient:
      "radial-gradient(ellipse at center, #6A4A14 0%, #2a1a05 70%, #0a0504 100%)",
  },
  {
    id: 11,
    label: "European Paintings",
    gradient:
      "radial-gradient(ellipse at center, #1B2A55 0%, #0a1230 70%, #050818 100%)",
  },
  {
    id: 14,
    label: "Islamic World",
    gradient:
      "radial-gradient(ellipse at center, #1F4033 0%, #0a1a14 70%, #05100a 100%)",
  },
  {
    id: 17,
    label: "Medieval Europe",
    gradient:
      "radial-gradient(ellipse at center, #3A1F0A 0%, #140a05 70%, #080505 100%)",
  },
];

interface MetObject {
  objectID: number;
  isPublicDomain: boolean;
  primaryImage: string;
  primaryImageSmall: string;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  culture: string;
  department: string;
  classification: string;
}

interface SearchResponse {
  total: number;
  objectIDs: number[] | null;
}

async function searchDept(deptId: number): Promise<number[]> {
  const url = `${BASE}/search?departmentId=${deptId}&hasImages=true&q=painting`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as SearchResponse;
    return data.objectIDs ?? [];
  } catch {
    return [];
  }
}

async function fetchObject(id: number): Promise<MetObject | null> {
  try {
    const res = await fetch(`${BASE}/objects/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as MetObject;
  } catch {
    return null;
  }
}

/** Fisher-Yates shuffle so each visit pulls different objects per dept. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function toArtwork(
  obj: MetObject,
  dept: (typeof DIVERSE_DEPTS)[number],
): Artwork | null {
  if (!obj.isPublicDomain) return null;
  const url = obj.primaryImageSmall || obj.primaryImage;
  if (!url) return null;
  if (!obj.title) return null;
  const cultureParts = [obj.culture, dept.label].filter(Boolean);
  return {
    id: `met-${obj.objectID}`,
    title: obj.title,
    artist: obj.artistDisplayName || "Unknown artist",
    year: obj.objectDate || "—",
    culture: cultureParts.join(" · "),
    cols: 10,
    rows: 6,
    commonsFile: "",
    imageUrl: url,
    background: dept.gradient,
    description: obj.classification || obj.department || "",
  };
}

/**
 * Fetch a culturally diverse batch of paintings from the Met Museum API.
 *
 * @param perDept  How many confirmed public-domain paintings to collect per
 *                 department before moving on. 10 per dept × 6 depts ≈ 60.
 * @param oversample  Multiplier on candidates to try per dept — many Met
 *                    records lack a public-domain image, so we overshoot.
 */
export async function fetchDiverseBatch(
  perDept = 10,
  oversample = 4,
): Promise<Artwork[]> {
  const results: Artwork[] = [];
  const existing = new Set<string>();

  // Fetch each department's search results in parallel — this is the cheap
  // hop. The expensive hop is per-object, which we do sequentially per dept
  // so we can stop early once we have enough public-domain hits.
  const searches = await Promise.all(
    DIVERSE_DEPTS.map((d) => searchDept(d.id)),
  );

  for (let i = 0; i < DIVERSE_DEPTS.length; i++) {
    const dept = DIVERSE_DEPTS[i];
    const ids = shuffle(searches[i]).slice(0, perDept * oversample);
    let collected = 0;
    for (const id of ids) {
      if (collected >= perDept) break;
      const obj = await fetchObject(id);
      if (!obj) continue;
      const art = toArtwork(obj, dept);
      if (!art) continue;
      if (existing.has(art.id)) continue;
      existing.add(art.id);
      results.push(art);
      collected++;
    }
  }

  return results;
}

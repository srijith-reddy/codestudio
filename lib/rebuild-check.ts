import type { RebuildValidation } from "@/lib/types";

/**
 * Lightweight, non-punitive skeleton validator.
 *
 * Philosophy: the rebuild step is honor-system in spirit. This check exists
 * to give the user a meaningful nudge ("you captured 4 of 6 structural
 * elements — the recursion base case is missing") without turning into a
 * compiler. It should praise what's there before mentioning what's missing.
 *
 * How it works:
 *  1. Extract anchor lines from the canonical skeleton (drop blanks and
 *     import-only lines, keep everything structural).
 *  2. Normalize both the canonical anchors and the user's text (lowercase,
 *     collapse whitespace, strip comments).
 *  3. For each canonical anchor, check whether any user line contains at
 *     least 60% of its non-trivial tokens. That's "present".
 *  4. Compute a present-order index so we can detect reordering.
 */
export function validateRebuild(
  user: string,
  canonical: string,
): RebuildValidation {
  const keys = extractKeys(canonical);
  const userLines = normalizeLines(user);

  const present: string[] = [];
  const missing: string[] = [];
  const presentOrderIdx: number[] = [];

  keys.forEach((key, keyIdx) => {
    const tokens = tokenize(key);
    if (tokens.length === 0) return;
    const hit = userLines.findIndex((line) => {
      const lineTokens = new Set(tokenize(line));
      const matched = tokens.filter((t) => lineTokens.has(t)).length;
      return matched / tokens.length >= 0.6;
    });
    if (hit >= 0) {
      present.push(key);
      presentOrderIdx.push(keyIdx);
    } else {
      missing.push(key);
    }
  });

  const orderOk = presentOrderIdx.every(
    (v, i, arr) => i === 0 || v >= arr[i - 1],
  );
  const score = keys.length === 0 ? 1 : present.length / keys.length;

  const summary = buildSummary(present.length, keys.length, orderOk);

  return {
    presentKeys: present,
    missingKeys: missing,
    orderOk,
    score,
    summary,
  };
}

function buildSummary(present: number, total: number, orderOk: boolean): string {
  if (total === 0) return "No structural anchors to check.";
  if (present === total && orderOk) {
    return `All ${total} structural anchors captured. Beautiful.`;
  }
  if (present === total && !orderOk) {
    return `You have every piece — but the order is a little scrambled.`;
  }
  return `${present} of ${total} structural elements captured${orderOk ? "" : " · order is slightly off"}.`;
}

function extractKeys(canonical: string): string[] {
  return canonical
    .split("\n")
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(
      (line) =>
        line.length > 2 &&
        !line.startsWith("from ") &&
        !line.startsWith("import ") &&
        !line.startsWith("class ") &&
        !line.startsWith('"""'),
    );
}

function normalizeLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(Boolean);
}

function tokenize(line: string): string[] {
  return line
    .toLowerCase()
    .replace(/[(){}[\],:]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !/^\d+$/.test(t));
}

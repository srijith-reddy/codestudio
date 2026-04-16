import type { Pattern, Problem, CodePuzzle } from "@/lib/types";

/**
 * No-LLM assistant. Every answer is pulled verbatim from the hand-authored
 * curriculum data (problems.ts, patterns.ts, puzzles.ts). We route the user's
 * question to the right field via keyword matching, then return that field's
 * content plus a citation pointer. If nothing matches, we list what we CAN
 * answer so the scope is explicit.
 *
 * This deliberately avoids generative AI — the trust model is "if it came
 * out of the assistant, it was authored by a human in the curriculum data".
 */

export type AssistantAnswerKind =
  | "insight"
  | "brute"
  | "hint"
  | "pitfall"
  | "complexity"
  | "code"
  | "remember"
  | "why"
  | "syntax"
  | "quiz"
  | "source"
  | "trigger"
  | "core"
  | "skeleton"
  | "fallback";

export interface AssistantBlock {
  /** Short label shown above the block. */
  label: string;
  /** Body content — may be a paragraph, bullet list, or code. */
  body: string;
  /** If the body should render as code. */
  code?: boolean;
  /** Optional bullet list instead of a prose body. */
  bullets?: string[];
}

export interface AssistantAnswer {
  kind: AssistantAnswerKind;
  title: string;
  blocks: AssistantBlock[];
  source: {
    label: string;
    href?: string;
  };
}

export interface AssistantContext {
  problem?: Problem;
  pattern?: Pattern;
  puzzle?: CodePuzzle;
}

/**
 * Suggested questions surfaced as chips in the UI. Each maps to an exact
 * answer kind so the user always has a one-click path into the corpus.
 */
export const SUGGESTED_QUESTIONS: { label: string; query: string }[] = [
  { label: "Why this approach?", query: "why this approach" },
  { label: "I'm stuck — hint me", query: "give me a hint" },
  { label: "What are the pitfalls?", query: "common pitfalls" },
  { label: "What's the complexity?", query: "time and space complexity" },
  { label: "Show the final code", query: "show final code" },
  { label: "When do I reach for this pattern?", query: "when to use this pattern" },
  { label: "What's the brute-force?", query: "brute force" },
  { label: "Quiz me on this", query: "quiz me" },
];

const KEYWORD_ROUTES: {
  kind: AssistantAnswerKind;
  patterns: RegExp[];
}[] = [
  {
    kind: "insight",
    patterns: [
      /\b(why|insight|intuition|idea|approach|strategy|key)\b/i,
      /\b(how does .* work|what'?s the trick)\b/i,
    ],
  },
  {
    kind: "brute",
    patterns: [/\b(brute|naive|slow|obvious|n\^?2|dumb)\b/i],
  },
  {
    kind: "hint",
    patterns: [/\b(hint|stuck|help|nudge|clue|guide)\b/i],
  },
  {
    kind: "pitfall",
    patterns: [
      /\b(pitfall|gotcha|trap|mistake|wrong|mess up|tricky|edge case|careful)\b/i,
    ],
  },
  {
    kind: "complexity",
    patterns: [
      /\b(complex|big ?o|time|space|runtime|memory|fast|slow)\b/i,
    ],
  },
  {
    kind: "code",
    patterns: [
      /\b(code|answer|solution|final|show|full|reveal)\b/i,
    ],
  },
  {
    kind: "remember",
    patterns: [
      /\b(remember|takeaway|keeper|one[- ]?liner|summarize|tl;dr)\b/i,
    ],
  },
  {
    kind: "why",
    patterns: [
      /\b(why.*(matter|important)|interview|real world|practical)\b/i,
    ],
  },
  {
    kind: "syntax",
    patterns: [
      /\b(syntax|helper|method|function|builtin|python|library|import)\b/i,
    ],
  },
  {
    kind: "quiz",
    patterns: [/\b(quiz|test me|ask me|recall|check my)\b/i],
  },
  {
    kind: "source",
    patterns: [/\b(source|neetcode|link|read more|reference|docs)\b/i],
  },
  {
    kind: "trigger",
    patterns: [
      /\b(trigger|cue|when (to|do).*(use|reach)|signal|sign|recogn[iy])/i,
    ],
  },
  {
    kind: "core",
    patterns: [/\b(core|pattern idea|shape|big picture|what is .* pattern)\b/i],
  },
  {
    kind: "skeleton",
    patterns: [/\b(skeleton|template|scaffold|outline)\b/i],
  },
];

function routeQuestion(question: string): AssistantAnswerKind {
  const q = question.trim().toLowerCase();
  if (!q) return "fallback";
  for (const route of KEYWORD_ROUTES) {
    if (route.patterns.some((re) => re.test(q))) return route.kind;
  }
  return "fallback";
}

function listBlock(label: string, items: string[]): AssistantBlock {
  return { label, body: "", bullets: items.filter(Boolean) };
}

function textBlock(label: string, body: string): AssistantBlock {
  return { label, body };
}

function codeBlock(label: string, body: string): AssistantBlock {
  return { label, body, code: true };
}

function sourceFor(ctx: AssistantContext): AssistantAnswer["source"] {
  if (ctx.problem?.sourceReference) {
    return {
      label: `Authored for "${ctx.problem.title}" · NeetCode-style curriculum`,
      href: ctx.problem.sourceReference,
    };
  }
  if (ctx.pattern) {
    return { label: `Authored for the ${ctx.pattern.name} pattern` };
  }
  return { label: "Authored curriculum" };
}

function fallbackAnswer(ctx: AssistantContext): AssistantAnswer {
  const lines = [
    "Why this approach works",
    "Brute-force starting point",
    "Progressive hints (when you're stuck)",
    "Common pitfalls and edge cases",
    "Time and space complexity",
    "The final reference code",
    "The one-line takeaway",
    "When to reach for this pattern",
    "Python syntax helpers",
    "Recall quiz questions",
    "Where to read more",
  ];
  return {
    kind: "fallback",
    title: "I can only answer from the authored curriculum.",
    blocks: [
      textBlock(
        "Scope",
        "Try one of the suggested questions below. I pull every answer straight from the hand-authored problem and pattern notes — nothing is generated on the fly, which means no hallucinations, but also no off-topic chatter.",
      ),
      listBlock("What I can answer about this problem", lines),
    ],
    source: sourceFor(ctx),
  };
}

/**
 * Main entry point. Given a question and the current context, return an
 * answer grounded in curriculum data only.
 */
export function answerQuestion(
  question: string,
  ctx: AssistantContext,
): AssistantAnswer {
  const kind = routeQuestion(question);
  const { problem, pattern, puzzle } = ctx;

  switch (kind) {
    case "insight": {
      if (!problem) break;
      return {
        kind,
        title: `Why this works — ${problem.title}`,
        blocks: [
          textBlock("The insight", problem.optimalInsight),
          ...(puzzle?.intent
            ? [textBlock("What you're building", puzzle.intent)]
            : []),
        ],
        source: sourceFor(ctx),
      };
    }
    case "brute": {
      if (!problem) break;
      return {
        kind,
        title: `The naive way — ${problem.title}`,
        blocks: [
          textBlock("Brute-force starting point", problem.bruteForce),
          textBlock(
            "Why we move past it",
            problem.optimalInsight,
          ),
        ],
        source: sourceFor(ctx),
      };
    }
    case "hint": {
      if (!problem) break;
      return {
        kind,
        title: `Progressive hints — ${problem.title}`,
        blocks: [listBlock("Hint ladder", problem.hints)],
        source: sourceFor(ctx),
      };
    }
    case "pitfall": {
      if (!problem && !pattern) break;
      const problemPits = problem?.pitfalls ?? [];
      const patternMists = pattern?.commonMistakes ?? [];
      const merged = [...problemPits];
      for (const m of patternMists) {
        if (!merged.some((p) => p.toLowerCase() === m.toLowerCase())) {
          merged.push(m);
        }
      }
      return {
        kind,
        title: problem
          ? `Watch out for — ${problem.title}`
          : `Common mistakes — ${pattern?.name}`,
        blocks: [listBlock("Pitfalls", merged)],
        source: sourceFor(ctx),
      };
    }
    case "complexity": {
      if (!problem) break;
      return {
        kind,
        title: `Complexity — ${problem.title}`,
        blocks: [
          textBlock(
            "Time",
            problem.complexity.time,
          ),
          textBlock(
            "Space",
            problem.complexity.space,
          ),
        ],
        source: sourceFor(ctx),
      };
    }
    case "code": {
      if (!problem) break;
      return {
        kind,
        title: `Reference code — ${problem.title}`,
        blocks: [
          textBlock(
            "Heads up",
            "Peeking at the full code short-circuits the pattern-building loop. Try the hint ladder first if you haven't.",
          ),
          codeBlock("Final code", problem.finalCode),
        ],
        source: sourceFor(ctx),
      };
    }
    case "remember": {
      if (!problem) break;
      return {
        kind,
        title: `The keeper — ${problem.title}`,
        blocks: [textBlock("Remember this", problem.rememberThis)],
        source: sourceFor(ctx),
      };
    }
    case "why": {
      if (!problem) break;
      return {
        kind,
        title: `Why it matters — ${problem.title}`,
        blocks: [textBlock("In interviews and real code", problem.whyItMatters)],
        source: sourceFor(ctx),
      };
    }
    case "syntax": {
      const probHelpers = problem?.helperSyntax ?? [];
      const patHelpers = pattern?.helperSyntax ?? [];
      const merged = [...probHelpers];
      for (const h of patHelpers) {
        if (!merged.some((x) => x.toLowerCase() === h.toLowerCase())) {
          merged.push(h);
        }
      }
      if (merged.length === 0) break;
      return {
        kind,
        title: `Python helpers — ${problem?.title ?? pattern?.name ?? ""}`,
        blocks: [listBlock("Syntax you'll reach for", merged)],
        source: sourceFor(ctx),
      };
    }
    case "quiz": {
      if (!problem) break;
      return {
        kind,
        title: `Quiz yourself — ${problem.title}`,
        blocks: [
          listBlock("Recall questions", problem.recallQuestions),
          textBlock(
            "How to use these",
            "Answer out loud or in your head before peeking. If you stumble, re-read the insight and try again.",
          ),
        ],
        source: sourceFor(ctx),
      };
    }
    case "source": {
      if (!problem?.sourceReference) break;
      return {
        kind,
        title: `Source — ${problem.title}`,
        blocks: [
          textBlock(
            "Where to read more",
            `This problem was authored following the NeetCode-style curriculum. The canonical reference lives at the link below.`,
          ),
          textBlock("Link", problem.sourceReference),
        ],
        source: sourceFor(ctx),
      };
    }
    case "trigger": {
      if (!pattern) break;
      return {
        kind,
        title: `When to reach for ${pattern.name}`,
        blocks: [
          listBlock("Triggers you'll hear in the problem", pattern.triggers),
          textBlock("Core idea", pattern.coreIdea),
        ],
        source: sourceFor(ctx),
      };
    }
    case "core": {
      if (!pattern) break;
      return {
        kind,
        title: `The ${pattern.name} pattern`,
        blocks: [
          textBlock("Core idea", pattern.coreIdea),
          textBlock("Summary", pattern.summary),
        ],
        source: sourceFor(ctx),
      };
    }
    case "skeleton": {
      if (!pattern) break;
      return {
        kind,
        title: `Skeleton — ${pattern.name}`,
        blocks: [codeBlock("Template", pattern.skeletonCode)],
        source: sourceFor(ctx),
      };
    }
    default:
      break;
  }

  return fallbackAnswer(ctx);
}

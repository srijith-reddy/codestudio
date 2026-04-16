"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  answerQuestion,
  SUGGESTED_QUESTIONS,
  type AssistantAnswer,
  type AssistantContext,
} from "@/lib/assistant";

interface Turn {
  id: string;
  question: string;
  answer: AssistantAnswer;
}

/**
 * Curriculum Assistant — a floating help button that answers questions
 * using only the hand-authored problem/pattern/puzzle data. No LLM, no
 * network, no hallucination surface. If it wasn't authored into the
 * curriculum, the assistant won't say it.
 */
export function CurriculumAssistant({
  context,
  suggestedQuestions = SUGGESTED_QUESTIONS,
  launcherLabel = "Ask the curriculum",
}: {
  context: AssistantContext;
  suggestedQuestions?: { label: string; query: string }[];
  launcherLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // When the scoped problem changes, clear the conversation — answers are
  // problem-specific so carrying them forward would be misleading.
  useEffect(() => {
    setTurns([]);
  }, [context.problem?.id]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, turns.length]);

  const scopeLabel = useMemo(() => {
    if (context.problem) return context.problem.title;
    if (context.pattern) return context.pattern.name;
    return "the curriculum";
  }, [context.problem, context.pattern]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) return;
    const ans = answerQuestion(q, context);
    setTurns((prev) => [
      ...prev,
      {
        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        question: q,
        answer: ans,
      },
    ]);
    setDraft("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open curriculum assistant"
        className="fixed bottom-6 right-6 z-40 h-11 px-5 rounded-full bg-brand text-brand-fg shadow-lg shadow-brand/25 hover:bg-brand/90 hover:scale-[1.03] transition-all duration-150 inline-flex items-center gap-2 text-sm font-semibold"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{launcherLabel}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-[#111114] border-l border-white/[0.08] flex flex-col"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/[0.08] flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand">
                    <BookOpen className="h-3 w-3" />
                    Curriculum only · no AI
                  </div>
                  <h2 className="mt-1 font-display text-base truncate text-fg">
                    Ask about {scopeLabel}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-zinc-500 leading-relaxed">
                    Every answer is pulled verbatim from the hand-authored
                    problem notes. Nothing is generated.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 h-8 w-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-fg transition-colors"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Conversation scroll */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin"
              >
                {turns.length === 0 && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-dashed border-border p-4 text-[12px] text-fg-muted leading-relaxed">
                      <Sparkles className="h-3.5 w-3.5 text-accent inline mr-1.5" />
                      Tap a question below or type your own. If I can't ground
                      the answer in the authored data for this problem, I'll
                      tell you so — I won't guess.
                    </div>
                    <SuggestedChips onPick={ask} items={suggestedQuestions} />
                  </div>
                )}

                {turns.map((t) => (
                  <div key={t.id} className="space-y-3">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-[12px_12px_2px_12px] bg-brand/[0.15] border border-brand/20 px-4 py-2 text-[13px] text-fg">
                        {t.question}
                      </div>
                    </div>
                    <AnswerCard answer={t.answer} />
                  </div>
                ))}

                {turns.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] uppercase tracking-widest text-fg-subtle mb-2">
                      Ask something else
                    </div>
                    <SuggestedChips onPick={ask} items={suggestedQuestions} />
                  </div>
                )}
              </div>

              {/* Composer */}
              <form
                onSubmit={onSubmit}
                className="border-t border-white/[0.07] p-3 bg-bg/40"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="e.g. why does this use a hash map?"
                    className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.10] px-3 py-2 text-sm text-fg outline-none focus:border-brand/60 placeholder:text-zinc-600"
                  />
                  <Button type="submit" size="sm" disabled={!draft.trim()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SuggestedChips({
  onPick,
  items,
}: {
  onPick: (q: string) => void;
  items: { label: string; query: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <button
          key={s.query}
          type="button"
          onClick={() => onPick(s.query)}
          className="rounded-full border border-white/[0.12] hover:border-white/25 bg-transparent hover:bg-white/[0.06] px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function AnswerCard({ answer }: { answer: AssistantAnswer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border-l-2 border-l-brand border border-white/[0.08] bg-bg-elevated overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/[0.07]">
        <div className="text-[10px] uppercase tracking-widest text-zinc-600">
          From the curriculum
        </div>
        <div className="mt-0.5 font-display text-[13px] text-fg">
          {answer.title}
        </div>
      </div>
      <div className="px-4 py-4 space-y-4">
        {answer.blocks.map((b, i) => (
          <div key={i}>
            <div className="text-[10px] uppercase tracking-widest text-brand mb-1.5">
              {b.label}
            </div>
            {b.code ? (
              <pre className="rounded-lg bg-black/40 border border-white/[0.08] p-3 overflow-x-auto text-[11.5px] text-zinc-200 leading-relaxed font-mono whitespace-pre">
                {b.body}
              </pre>
            ) : b.bullets && b.bullets.length > 0 ? (
              <ul className="space-y-1.5">
                {b.bullets.map((bl, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-[12.5px] text-fg leading-relaxed"
                  >
                    <span className="mt-[7px] h-1 w-1 rounded-full bg-brand/70 shrink-0" />
                    <span>{bl}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12.5px] text-fg leading-relaxed whitespace-pre-wrap">
                {b.body}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-white/[0.07] flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[10px] text-zinc-600">{answer.source.label}</span>
        {answer.source.href && (
          <a
            href={answer.source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-fg-muted hover:text-fg inline-flex items-center gap-1"
          >
            Open source <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

import type { UserPrefs } from "@/lib/types";

/**
 * Coach tone — the three voices the user can pick in Settings. Each tone gets
 * its own variant of every user-facing coach line. Call `coachCopy(tone)` once
 * at the top of a component and read fields off the returned object.
 *
 * If you add a new key, add it to all three tone variants. The type guarantees
 * completeness at compile time.
 */
export type Tone = UserPrefs["tone"];

export interface CoachCopy {
  // Mission step headers — shown above each beat
  warmupTagline: string;
  warmupPurpose: string;
  solveTagline: string;
  solvePurpose: string;
  echoTagline: string;
  echoPurpose: string;

  // Post-solve feedback — after a puzzle is completed
  solveCleanToast: string;    // no hints used
  solveHintedToast: string;   // one or more hints used

  // Echo / save confirmations — shown after marking an outcome
  echoSavedSql: string;
  echoSavedReview: string;

  // Closing lines on the Echo beat — tone-varied reflection summary
  closingClean: string;       // perfect run
  closingHinted: string;      // got there with help
  closingStruggled: string;   // needed hints
  closingEmpty: string;       // no puzzle outcome recorded
}

const BANK: Record<Tone, CoachCopy> = {
  calm: {
    warmupTagline: "See how it works",
    warmupPurpose:
      "Read through the pattern line by line in plain English. No pressure — just get the shape in your head.",
    solveTagline: "Build it with blocks",
    solvePurpose:
      "Arrange the blocks in the right order. Take your time. A painting tile unlocks when it clicks.",
    echoTagline: "Lock it in",
    echoPurpose:
      "Your notes are saved automatically. A quiet moment to let today settle before tomorrow.",
    solveCleanToast: "Well done. That's banked.",
    solveHintedToast: "You got there. That's what matters.",
    echoSavedSql:
      "Saved. XP added to your shared track — painting tiles unlocked on the gallery.",
    echoSavedReview:
      "Saved. It'll come back to you when the timing is right.",
    closingClean: "Clean solve, no hints. That's the best you can do.",
    closingHinted: "You got there with a bit of help. That still counts.",
    closingStruggled:
      "You used some hints. Come back tomorrow and try it clean.",
    closingEmpty: "You showed up. That counts.",
  },
  focused: {
    warmupTagline: "Scout the shape",
    warmupPurpose:
      "Pattern primer, line by line. This is the shape you're memorizing — read it with intent.",
    solveTagline: "Assemble the solution",
    solvePurpose:
      "Build the solution from blocks. Correct order unlocks a tile. No wasted moves.",
    echoTagline: "Mark it, move on",
    echoPurpose:
      "One-line takeaway saved. Score recorded. Tomorrow has a target.",
    solveCleanToast: "Clean solve. +XP.",
    solveHintedToast: "Solved with help. Queued for tomorrow's review.",
    echoSavedSql: "Locked. XP added. Review queue updated.",
    echoSavedReview: "Logged. Review queue updated.",
    closingClean: "Clean run, zero hints. Shape is learned.",
    closingHinted: "Solved with a nudge. Mark it for review.",
    closingStruggled: "Hint-heavy today. That's a review target for tomorrow.",
    closingEmpty: "Day logged. Show up again tomorrow.",
  },
  competitive: {
    warmupTagline: "Scope the target",
    warmupPurpose:
      "Scout the pattern. A few minutes to scope it, then you run the play.",
    solveTagline: "Run the play",
    solvePurpose:
      "Blocks → correct order → tile. No hints = clean run. Anything less is a retry.",
    echoTagline: "Log the W",
    echoPurpose:
      "Score in. What got you stuck, what you nailed. Tomorrow has a target — go again.",
    solveCleanToast: "No hints. Top form.",
    solveHintedToast: "Hint used. Still in the game.",
    echoSavedSql: "Logged. XP up, streak holding, tile on the board.",
    echoSavedReview: "Logged. It's on the review list.",
    closingClean: "Perfect run. Zero hints. Top of the leaderboard-of-one.",
    closingHinted: "Won it with help. Still a W. Go clean next time.",
    closingStruggled: "Rough round. Hints saved it. Revenge tomorrow.",
    closingEmpty: "You showed up. The board doesn't care why.",
  },
};

export function coachCopy(tone: Tone | undefined): CoachCopy {
  return BANK[tone ?? "calm"] ?? BANK.calm;
}

"use client";

import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { useCheckedProblems } from "@/hooks/use-checked-problems";
import { useAutoSolved } from "@/contexts/auto-solved";
import { Checkbox } from "@/components/ui/checkbox";
import { PlatformIcon } from "@/components/platform-icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { fetchProblemHints } from "@/app/actions";
import { CODECHEF_TOPIC_HINTS } from "@/lib/codechef-hints";
import { DIFFICULTY_LABEL, DIFFICULTY_BADGE_CLASS } from "@/lib/difficulty";

type Problem = {
  id: string;
  title: string;
  url: string;
  platform: "leetcode" | "codechef";
  externalRef: string;
};

type HintsState = "loading" | { hints: string[] };

export function DifficultySection({
  difficulty,
  problems,
  topicSlug,
}: {
  difficulty: "easy" | "medium" | "hard";
  problems: Problem[];
  topicSlug: string;
}) {
  const { checked, setProblemChecked } = useCheckedProblems();
  const { autoSolvedIds } = useAutoSolved();
  const solved = problems.filter((p) => checked[p.id] || autoSolvedIds.has(p.id)).length;
  const [openProblem, setOpenProblem] = useState<Problem | null>(null);
  const [hintsByProblem, setHintsByProblem] = useState<Record<string, HintsState>>({});

  async function openHints(problem: Problem) {
    setOpenProblem(problem);
    if (hintsByProblem[problem.id]) return;

    if (problem.platform !== "leetcode") {
      const hints = CODECHEF_TOPIC_HINTS[topicSlug] ?? [];
      setHintsByProblem((prev) => ({ ...prev, [problem.id]: { hints } }));
      return;
    }
    setHintsByProblem((prev) => ({ ...prev, [problem.id]: "loading" }));
    const hints = await fetchProblemHints(problem.platform, problem.externalRef);
    setHintsByProblem((prev) => ({ ...prev, [problem.id]: { hints } }));
  }

  const openState = openProblem ? hintsByProblem[openProblem.id] : undefined;

  return (
    <section className="overflow-hidden rounded-lg border border-foreground/[0.06] bg-foreground/[0.01]">
      <header className="flex items-center justify-between border-b border-foreground/[0.06] px-4 py-2.5">
        <span
          className={`rounded border px-2 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_BADGE_CLASS[difficulty]}`}
        >
          {DIFFICULTY_LABEL[difficulty]}
        </span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-1 w-20 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${problems.length ? (solved / problems.length) * 100 : 0}%` }}
            />
          </span>
          <span className="font-mono">
            {solved} / {problems.length}
          </span>
          solved
        </span>
      </header>
      <div className="divide-y divide-foreground/[0.06]">
        {problems.map((problem, i) => {
          const isAuto = autoSolvedIds.has(problem.id);
          const isChecked = isAuto || Boolean(checked[problem.id]);
          return (
            <div key={problem.id} className="flex items-center gap-3 px-4 py-2.5">
              <Checkbox
                checked={isChecked}
                disabled={isAuto}
                aria-label="Mark problem as solved"
                onCheckedChange={(value) => setProblemChecked(problem.id, value === true)}
              />
              <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">{i + 1}</span>
              <a
                href={problem.url}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 truncate text-sm hover:text-foreground hover:underline ${isChecked ? "text-muted-foreground line-through" : ""}`}
              >
                {problem.title}
              </a>
              {isAuto && (
                <span
                  title="Detected from your solved problems on this platform"
                  className="shrink-0 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                >
                  auto
                </span>
              )}
              <PlatformIcon platform={problem.platform} />
              <button
                type="button"
                onClick={() => openHints(problem)}
                aria-label="Show hints"
                className="flex shrink-0 items-center text-muted-foreground hover:text-amber-500"
              >
                <Lightbulb className="size-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Dialog open={openProblem !== null} onOpenChange={(open) => !open && setOpenProblem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{openProblem?.title}</DialogTitle>
            <DialogDescription>
              {openProblem?.platform === "leetcode" ? "LeetCode's official hints" : "General pattern hints"}
            </DialogDescription>
          </DialogHeader>

          {openState === "loading" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading hints…
            </p>
          )}
          {openState && openState !== "loading" && openState.hints.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {openProblem?.platform === "leetcode"
                ? "No official hints for this problem."
                : "CodeChef doesn't provide official hints — this is a CP judge, not an interview-prep site."}
            </p>
          )}
          {openState && openState !== "loading" && openState.hints.length > 0 && (
            <ol className="space-y-3 text-sm">
              {openProblem?.platform === "codechef" && (
                <li className="text-xs italic text-muted-foreground">
                  CodeChef has no official per-problem hints — these are general topic-pattern
                  nudges, not specific to this problem.
                </li>
              )}
              {openState.hints.map((hint, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="shrink-0 font-medium text-muted-foreground">Hint {idx + 1}</span>
                  <span className="text-muted-foreground">{hint}</span>
                </li>
              ))}
            </ol>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

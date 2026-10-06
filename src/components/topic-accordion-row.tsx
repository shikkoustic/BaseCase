"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useCheckedProblems } from "@/hooks/use-checked-problems";
import { useAutoSolved } from "@/contexts/auto-solved";
import { DifficultySection } from "@/components/difficulty-section";
import { LEVEL_LABEL, LEVEL_BADGE_CLASS } from "@/lib/difficulty";

const DIFFICULTY_ORDER = ["easy", "medium", "hard"] as const;

type Problem = {
  id: string;
  title: string;
  url: string;
  platform: "leetcode" | "codechef";
  externalRef: string;
  difficulty: "easy" | "medium" | "hard";
};

export function TopicAccordionRow({
  index,
  topic,
  problems,
}: {
  index: number;
  topic: { id: string; slug: string; name: string; description: string; category: string | null; level: string };
  problems: Problem[];
}) {
  const [open, setOpen] = useState(false);
  const { checked } = useCheckedProblems();
  const { autoSolvedIds } = useAutoSolved();
  const solved = problems.filter((p) => checked[p.id] || autoSolvedIds.has(p.id)).length;
  const total = problems.length;

  return (
    <div className="overflow-hidden rounded-lg border border-foreground/[0.06] bg-foreground/[0.015]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
      >
        <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground/60">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={LEVEL_BADGE_CLASS}>{LEVEL_LABEL[topic.level] ?? topic.level}</span>
        {topic.category && (
          <span className="hidden shrink-0 text-xs text-muted-foreground/70 sm:inline">{topic.category}</span>
        )}
        <span className="min-w-0 flex-1 truncate font-medium">{topic.name}</span>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {solved}/{total}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-6 border-t border-foreground/[0.06] bg-foreground/[0.01] px-4 py-5">
          <div className="flex items-start justify-between gap-4">
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
            <Link
              href={`/topics/${topic.slug}`}
              className="shrink-0 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Open full page
            </Link>
          </div>

          {DIFFICULTY_ORDER.map((difficulty) => {
            const group = problems.filter((p) => p.difficulty === difficulty);
            if (group.length === 0) return null;
            return (
              <DifficultySection
                key={difficulty}
                difficulty={difficulty}
                problems={group}
                topicSlug={topic.slug}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

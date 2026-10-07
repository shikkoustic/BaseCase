"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
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
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
      >
        <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground/60">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={LEVEL_BADGE_CLASS}>{LEVEL_LABEL[topic.level] ?? topic.level}</span>
        {topic.category && (
          <span className="hidden shrink-0 text-xs text-muted-foreground/70 sm:inline">{topic.category}</span>
        )}
        <Link
          href={`/topics/${topic.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 truncate font-medium hover:underline"
        >
          {topic.name}
        </Link>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {solved}/{total}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="space-y-6 border-t border-foreground/[0.06] bg-foreground/[0.01] px-4 py-5">
          <div className="space-y-2">
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
            <Link
              href={`/topics/${topic.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Getting started with {topic.name}
              <ArrowRight className="size-3.5" />
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

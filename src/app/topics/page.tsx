import { db } from "@/db";
import { topics, problems } from "@/db/schema";
import { TopicAccordionRow } from "@/components/topic-accordion-row";
import { TopicCategoryGroupRow } from "@/components/topic-category-group-row";
import { RoadmapStat } from "@/components/roadmap-stat";
import { AutoSolvedProvider } from "@/contexts/auto-solved";
import { buildTopicSlots } from "@/lib/topic-slots";
import { requireUser } from "@/lib/supabase/dal";

export default async function TopicsPage() {
  await requireUser();
  const allTopics = await db.select().from(topics).orderBy(topics.orderIndex);
  const allProblems = await db.select().from(problems);

  const byTopic = new Map<string, typeof allProblems>();
  for (const p of allProblems) {
    byTopic.set(p.topicId, [...(byTopic.get(p.topicId) ?? []), p]);
  }

  const allProblemIds = allProblems.map((p) => p.id);
  const slots = buildTopicSlots(allTopics);

  return (
    <AutoSolvedProvider>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">The roadmap</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Work through topics in order, or jump to whatever you&apos;re weak on. Each
              topic has a short explanation and a curated problem list from LeetCode
              and CodeChef.
            </p>
          </div>
          <div className="w-full sm:w-56">
            <RoadmapStat allProblemIds={allProblemIds} />
          </div>
        </div>

        <div className="mt-8 space-y-2">
          {slots.map((slot, i) => {
            if (slot.kind === "group") {
              return (
                <TopicCategoryGroupRow
                  key={slot.category}
                  index={i}
                  category={slot.category}
                  level={slot.level}
                  subTopics={slot.topics.map((t) => ({
                    id: t.id,
                    slug: t.slug,
                    name: t.name,
                    description: t.description,
                    problems: byTopic.get(t.id) ?? [],
                  }))}
                />
              );
            }
            return (
              <TopicAccordionRow
                key={slot.topic.id}
                index={i}
                topic={slot.topic}
                problems={byTopic.get(slot.topic.id) ?? []}
              />
            );
          })}
        </div>
      </div>
    </AutoSolvedProvider>
  );
}

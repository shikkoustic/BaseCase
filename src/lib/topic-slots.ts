import type { topics } from "@/db/schema";

type Topic = typeof topics.$inferSelect;

// Topics sharing a `category` (e.g. five "Graphs: ..." topics, five
// "DP: ..." topics) collapse into one roadmap slot — everything else is its
// own standalone slot, in seed order either way. Shared by the topics index
// (accordion rows) and the homepage (visual path) so both ever agree on
// what counts as one "stage" of the roadmap.
export type TopicSlot =
  | { kind: "topic"; topic: Topic }
  | { kind: "group"; category: string; level: string; topics: Topic[] };

export function buildTopicSlots(allTopics: Topic[]): TopicSlot[] {
  const slots: TopicSlot[] = [];
  for (const topic of allTopics) {
    const last = slots[slots.length - 1];
    if (topic.category && last?.kind === "group" && last.category === topic.category) {
      last.topics.push(topic);
    } else if (topic.category) {
      slots.push({ kind: "group", category: topic.category, level: topic.level, topics: [topic] });
    } else {
      slots.push({ kind: "topic", topic });
    }
  }
  return slots;
}

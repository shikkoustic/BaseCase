import { db } from "../src/db";
import { topics, problems } from "../src/db/schema";
import { topics as seedTopics } from "./seed-data";
import { problemUrl } from "../src/lib/platforms/urls";
import { eq, notInArray } from "drizzle-orm";

async function main() {
  for (const [topicIndex, topic] of seedTopics.entries()) {
    const [row] = await db
      .insert(topics)
      .values({
        slug: topic.slug,
        name: topic.name,
        description: topic.description,
        category: topic.category ?? null,
        orderIndex: topicIndex,
      })
      .onConflictDoUpdate({
        target: topics.slug,
        set: {
          name: topic.name,
          description: topic.description,
          category: topic.category ?? null,
          orderIndex: topicIndex,
        },
      })
      .returning();

    // Re-seeding a topic replaces its problem list wholesale — simpler than
    // diffing, and this script is only ever run by us, not by users.
    await db.delete(problems).where(eq(problems.topicId, row.id));

    if (topic.problems.length > 0) {
      await db.insert(problems).values(
        topic.problems.map((p, i) => ({
          topicId: row.id,
          platform: p.platform,
          externalRef: p.externalRef,
          title: p.title,
          url: problemUrl(p.platform, p.externalRef),
          difficulty: p.difficulty,
          orderIndex: i,
        })),
      );
    }

    console.log(`Seeded "${topic.name}" (${topic.problems.length} problems)`);
  }

  // Topics renamed/split out of seed-data.ts (e.g. the old single "graphs"
  // slug replaced by "graphs-traversal" etc.) no longer have a matching row
  // here — remove them so the roadmap doesn't show stale duplicates.
  const currentSlugs = seedTopics.map((t) => t.slug);
  const removed = await db
    .delete(topics)
    .where(notInArray(topics.slug, currentSlugs))
    .returning({ slug: topics.slug });
  if (removed.length > 0) {
    console.log(
      `Removed ${removed.length} stale topic(s): ${removed.map((t) => t.slug).join(", ")}`,
    );
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

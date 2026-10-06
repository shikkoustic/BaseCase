// Blog content lives here as structured blocks, not markdown — no markdown
// renderer is installed, and one extra dependency for a handful of posts
// isn't worth it. Same approach as topic-concepts.ts.
export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  readMinutes: number;
  body: BlogBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "cant-think-of-the-solution",
    title: "Can't Think of a Solution, Even Though You Understand It?",
    excerpt:
      "There's no cheat sheet for this one. Here's what solving a thousand problems actually taught me instead.",
    category: "Mindset",
    date: "2026-10-06",
    readMinutes: 4,
    body: [
      {
        type: "paragraph",
        text: "You read a problem. You understand what it's asking. And still — nothing. No idea how to even start. You're stuck, and no amount of staring at the screen is producing a solution.",
      },
      {
        type: "paragraph",
        text: "I want to give you an honest answer, not a comforting one: there's no shortcut out of this. No cheat sheet, no resource, no trick fixes it. The only thing that gets you unstuck, every single time, is practice. More of it. Consistently.",
      },
      {
        type: "paragraph",
        text: "I'm not saying that from theory. About a year ago, when I started DSA, I hit this exact wall constantly — I'd read a problem, understand the explanation afterward, and still have no idea how I was supposed to have thought of it myself. It felt like everyone else had some trick I was missing. They didn't. I just hadn't solved enough problems yet. Today, after working through 1,000+ problems across data structures and algorithms, I can say that confidently: practice is the only thing that actually closes that gap.",
      },
      {
        type: "paragraph",
        text: "That said, there are a few habits that made my practice far more effective — not shortcuts, but ways to get more out of every problem.",
      },
      { type: "heading", text: "Simulate it on paper before you code" },
      {
        type: "paragraph",
        text: "Whenever you sit down with a new problem, don't start by trying to write code or even think abstractly. Take the test case the problem gives you, grab a pen and paper, and walk through it by hand — as if you were a human computer executing the problem's rules step by step.",
      },
      {
        type: "paragraph",
        text: "Something happens when you do this that doesn't happen when you just read the problem: you start noticing things. The structure of the problem, the repeated work, the pattern in how the answer changes as you add one more element — it becomes visible on paper in a way it never is in your head. Most of the \"aha\" moments people wait for while staring at a screen actually show up a few lines into a hand-traced example.",
      },
      { type: "heading", text: "Time-box your thinking" },
      {
        type: "paragraph",
        text: "Give yourself a real limit — 10, maybe 20 minutes — to think through a problem before you look anything up. Not three hours.",
      },
      {
        type: "paragraph",
        text: "This isn't about giving up early. It's about return on time. If you're stuck on one problem for three hours, you've spent three hours on one data point. In that same time, you could have solved five more problems in the same pattern, and each one teaches you something the others didn't — a different edge case, a different way the same idea shows up. That's a far better use of your time than grinding alone against a single wall.",
      },
      {
        type: "paragraph",
        text: "So: think hard for a focused window, and if nothing's coming, look at a hint or the solution, understand why it works, and move to the next problem in that pattern. You'll come back around to problems like it, and next time it won't take three hours.",
      },
      { type: "heading", text: "Be consistent, not heroic" },
      {
        type: "paragraph",
        text: "Set a realistic target — two to four problems a day — and actually hit it every day.",
      },
      {
        type: "paragraph",
        text: "DSA is like going to the gym. Training hard four days a week and then skipping the next three doesn't build anything that lasts. What builds real skill is showing up consistently, doing the reps, and revisiting what you've already solved. Over time — not overnight — that consistency is what turns into mastery.",
      },
      {
        type: "paragraph",
        text: "There's no version of this that skips the reps. Pen, paper, a time limit, and consistency — that's the whole method. The rest is just doing it, again and again, until it stops feeling hard.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

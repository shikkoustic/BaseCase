import Link from "next/link";
import { Newspaper } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { BlogCover } from "@/components/blog-cover";
import { categoryBadgeClass } from "@/lib/blog-category-color";

export const metadata = {
  title: "Blog | DSA Club",
};

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Notes and write-ups on DSA, competitive programming, and building this
        site.
      </p>

      {posts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-foreground/[0.03] py-16 text-center">
          <Newspaper className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No posts yet — check back soon.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col">
              <BlogCover category={post.category} className="aspect-video" />
              <span
                className={`mt-3 w-fit rounded-md border px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(post.category)}`}
              >
                {post.category}
              </span>
              <h2 className="mt-2 font-medium leading-snug group-hover:underline">{post.title}</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(post.date).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {" · "}
                {post.readMinutes} min read
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

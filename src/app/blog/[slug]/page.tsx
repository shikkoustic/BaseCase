import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, BLOG_POSTS } from "@/lib/blog-posts";
import { BlogCover } from "@/components/blog-cover";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  return { title: post ? `${post.title} | BaseCase` : "Blog | BaseCase" };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
      </p>

      <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">{post.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>

      <p className="mt-5 text-sm text-muted-foreground">
        Shikhar Srivastava ·{" "}
        {new Date(post.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}{" "}
        · {post.readMinutes} min read
      </p>

      <BlogCover category={post.category} className="mt-6 aspect-[2/1]" />

      <div className="prose-sm mt-8 space-y-5 leading-relaxed">
        {post.body.map((block, i) =>
          block.type === "heading" ? (
            <h2 key={i} className="pt-2 text-xl font-semibold tracking-tight">
              {block.text}
            </h2>
          ) : (
            <p key={i} className="text-muted-foreground">
              {block.text}
            </p>
          ),
        )}
      </div>

      <Link
        href="/blog"
        className="mt-10 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Blog
      </Link>
    </div>
  );
}

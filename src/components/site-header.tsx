import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/supabase/actions";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo className="size-7" />
          BaseCase
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {signedIn && (
            <>
              <Link href="/topics" className="hover:text-foreground">
                Topics
              </Link>
              <Link href="/contests" className="hover:text-foreground">
                Contests
              </Link>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {signedIn ? (
            <form action={signOutAction}>
              <Button size="sm" variant="outline" type="submit">
                Sign out
              </Button>
            </form>
          ) : (
            <Button size="sm" nativeButton={false} render={<Link href="/sign-in">Sign in</Link>} />
          )}
          {signedIn && <MobileNav />}
        </div>
      </div>
    </header>
  );
}

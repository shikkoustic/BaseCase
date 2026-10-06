"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { GoogleIcon } from "@/components/google-icon";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const authError = searchParams.get("error");

  // Always lands back on the homepage after signing in, regardless of
  // which page (if any) bounced the visitor to /sign-in first.
  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-24 text-center">
      <Logo className="size-10" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Sign in to DSA Club</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your roadmap, dashboard, and contest tracker are saved to your account.
      </p>

      {authError && (
        <p className="mt-4 text-sm text-destructive">
          Something went wrong signing you in. Please try again.
        </p>
      )}

      <Button
        size="lg"
        variant="outline"
        className="mt-8 w-full gap-2"
        onClick={signInWithGoogle}
        disabled={loading}
      >
        <GoogleIcon className="size-4" />
        {loading ? "Redirecting…" : "Continue with Google"}
      </Button>
    </div>
  );
}

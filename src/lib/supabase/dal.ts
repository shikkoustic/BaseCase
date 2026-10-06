import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Proxy (src/proxy.ts) does the optimistic, redirect-before-render check.
// This is the secure check — called directly in every protected Server
// Component/Route Handler, per Next's own guidance not to rely on Proxy
// alone (a matcher change or refactor can silently remove Proxy coverage).
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/sign-in");
  }

  return { id: claims.sub as string, email: claims.email as string | undefined };
}

// Same check for Route Handlers — these are consumed by client-side fetch(),
// so a 401 is more useful to the caller than a redirect response.
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub as string, email: claims.email as string | undefined };
}

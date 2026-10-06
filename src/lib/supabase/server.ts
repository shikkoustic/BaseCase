import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// For Server Components, Server Actions, and Route Handlers — not Proxy,
// which uses its own client (see proxy.ts) since it can write response
// cookies directly.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component, which can't write cookies —
            // fine as long as Proxy is also refreshing the session (it is).
          }
        },
      },
    },
  );
}

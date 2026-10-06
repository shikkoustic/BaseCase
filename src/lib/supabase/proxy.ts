import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Everything else requires a signed-in session — this is the one place that
// list is defined, so it stays in sync with what the site nav shows.
const PUBLIC_PREFIXES = ["/", "/about", "/blog", "/sign-in", "/auth", "/api/cron"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  // Exact-segment match, not a bare startsWith — otherwise a future route
  // like /about-internal would silently inherit /about's public status.
  return PUBLIC_PREFIXES.some((prefix) => prefix !== "/" && (pathname === prefix || pathname.startsWith(`${prefix}/`)));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => supabaseResponse.headers.set(key, value));
        },
      },
    },
  );

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make it very hard to debug issues with users being
  // randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    // Sign-in always lands back on the homepage, not the page that bounced
    // the visitor here — so no "next" param to preserve.
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is, with
  // its cookies intact, or the browser and server can go out of sync and
  // terminate the user's session prematurely.
  return supabaseResponse;
}

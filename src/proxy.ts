import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// `proxy.ts`, not `middleware.ts` — Next.js 16 renamed the convention; the
// behavior is identical. See node_modules/next/dist/docs/.../proxy.md.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Skip static files/images so auth checks don't block CSS/JS/fonts.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

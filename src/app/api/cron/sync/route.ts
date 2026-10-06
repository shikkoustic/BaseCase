import { NextResponse } from "next/server";
import { syncAllKnownCodeChefHandles } from "@/lib/sync";

// Triggered daily by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer ${CRON_SECRET}` on cron-triggered requests.
// Keeps CodeChef's forward-only tracking accurate for every handle anyone
// has ever looked up, even if they don't revisit daily.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  // Without this guard, an unset CRON_SECRET makes the check below compare
  // against the literal string "Bearer undefined" — trivially guessable.
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllKnownCodeChefHandles();
  return NextResponse.json(result);
}

import { NextResponse } from "next/server";
import { getOrCreateVerification, checkVerification } from "@/lib/handle-verification";
import { getAuthenticatedUser } from "@/lib/supabase/dal";

export const dynamic = "force-dynamic";

function parsePlatform(value: string | null): "leetcode" | "codechef" | null {
  return value === "leetcode" || value === "codechef" ? value : null;
}

// GET: fetch (or start) a handle's verification status + one-time code.
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const platform = parsePlatform(searchParams.get("platform"));
  const handle = searchParams.get("handle")?.trim();

  if (!platform || !handle) {
    return NextResponse.json({ error: "platform and handle are required" }, { status: 400 });
  }

  const status = await getOrCreateVerification(user.id, platform, handle);
  return NextResponse.json(status);
}

// POST: re-check the handle's public profile for the pending code.
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const platform = parsePlatform(body?.platform);
  const handle = typeof body?.handle === "string" ? body.handle.trim() : "";

  if (!platform || !handle) {
    return NextResponse.json({ error: "platform and handle are required" }, { status: 400 });
  }

  const status = await checkVerification(user.id, platform, handle);
  return NextResponse.json(status);
}

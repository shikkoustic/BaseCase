import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (copy .env.local.example to .env.local)");
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  // On Vercel, this module is re-evaluated per serverless instance, not once
  // for a long-running process. postgres-js defaults to a pool of up to 10
  // connections — with no cap, every cold-started instance can try to grab
  // up to 10 connections from Supabase's transaction pooler at once, and
  // concurrent instances under real traffic can exhaust the pooler's total
  // connection limit, which shows up as requests randomly hanging. Each
  // invocation only ever needs one connection at a time, so cap it there and
  // let the pooler (not this client) handle fanning out across instances.
  max: 1,
  // Supabase's pooler silently closes idle connections server-side; without
  // these, postgres-js can hand out a dead connection from its pool and the
  // next query hangs until it times out (seen as "read ETIMEDOUT").
  // Recycling proactively avoids ever handing out a connection that old.
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });

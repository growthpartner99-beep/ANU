import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";

/** The one migration this helper applies. Never point it at dev or prod. */
export const INITIAL_MIGRATION = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../supabase/migrations/20261125125000_initial_schema.sql",
);

export const MIGRATION_VERSION = "20261125125000";

export const TABLES = [
  "accounts",
  "projects",
  "widget_configs",
  "knowledge_sources",
  "knowledge_chunks",
  "conversations",
  "messages",
] as const;

export const SERVICE_FUNCTIONS = [
  "create_project(text, text, text)",
  "reserve_knowledge_source(uuid, text, text, text)",
  "consume_message(uuid)",
  "save_chat_turn(uuid, uuid, text, text, text)",
  "match_chunks(uuid, extensions.vector, integer)",
] as const;

/**
 * A pglite database with the small pieces of Supabase the migration expects:
 * the three API roles, auth.jwt() and storage.buckets. This is only a test
 * double; it never connects to a Supabase project.
 */
export async function createSupabasePglite(): Promise<PGlite> {
  const db = new PGlite({ extensions: { vector } });
  await db.waitReady;

  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;

    create schema auth;
    create schema storage;

    grant usage on schema auth, storage to anon, authenticated, service_role;

    create function auth.jwt()
    returns jsonb
    language sql
    stable
    as $$
      select coalesce(
        nullif(current_setting('request.jwt.claims', true), ''),
        '{}'
      )::jsonb;
    $$;

    create table storage.buckets (
      id text primary key,
      name text not null,
      public boolean not null default false,
      file_size_limit bigint,
      allowed_mime_types text[]
    );
  `);

  return db;
}

/** Apply the committed migration SQL verbatim. */
export async function applyInitialMigration(db: PGlite): Promise<string> {
  const sql = await readFile(INITIAL_MIGRATION, "utf8");
  await db.exec(sql);
  return sql;
}

/** Set the Clerk subject that auth.jwt() reports to RLS policies. */
export async function setClaims(db: PGlite, clerkUserId: string): Promise<void> {
  await db.query("select set_config('request.jwt.claims', $1, false)", [
    JSON.stringify({ sub: clerkUserId }),
  ]);
}

export async function clearClaims(db: PGlite): Promise<void> {
  await db.query("select set_config('request.jwt.claims', '', false)");
}

export async function setRole(db: PGlite, role: string): Promise<void> {
  await db.query(`set role ${role}`);
}

export async function resetRole(db: PGlite): Promise<void> {
  await db.query("reset role");
}

/** A 1536-dim cosine test vector with a single 1 at `hotIndex`. */
export function embedding(hotIndex: number): string {
  return `[${Array.from({ length: 1536 }, (_, index) => (index === hotIndex ? "1" : "0")).join(",")}]`;
}

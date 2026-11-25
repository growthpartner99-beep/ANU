import type { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  SERVICE_FUNCTIONS,
  TABLES,
  applyInitialMigration,
  clearClaims,
  createSupabasePglite,
  embedding,
  resetRole,
  setClaims,
  setRole,
} from "./supabase-pglite";

let db: PGlite;
let migrationSql: string;

async function rows<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await db.query(text, params);
  return result.rows as T[];
}

async function seed(): Promise<{
  freeProject: string;
  proProject: string;
  sourceId: string;
  conversationId: string;
}> {
  await setRole(db, "service_role");
  await db.query(`
    insert into public.accounts (clerk_user_id, plan)
    values ('free_owner', 'free'), ('pro_owner', 'pro')
  `);

  const freeProject = (
    await rows<{ id: string }>(
      "select public.create_project('free_owner', 'Free project', 'pk_free') as id",
    )
  )[0]!.id;
  const proProject = (
    await rows<{ id: string }>(
      "select public.create_project('pro_owner', 'Pro project', 'pk_pro') as id",
    )
  )[0]!.id;
  const sourceId = (
    await rows<{ id: string }>(
      "select public.reserve_knowledge_source($1, 'Doc', 'text') as id",
      [freeProject],
    )
  )[0]!.id;
  const conversationId = (
    await rows<{ id: string }>(
      "select public.save_chat_turn($1, null, 'visitor-1', 'Hi', 'Hello') as id",
      [freeProject],
    )
  )[0]!.id;

  await resetRole(db);
  return { freeProject, proProject, sourceId, conversationId };
}

beforeEach(async () => {
  db = await createSupabasePglite();
  migrationSql = await applyInitialMigration(db);
});

afterEach(async () => {
  await db.close();
});

describe("initial migration", () => {
  it("creates the seven documented tables with RLS and a vector index", async () => {
    const tables = await rows<{ table_name: string }>(
      `select table_name from information_schema.tables
       where table_schema = 'public' and table_name = any($1)`,
      [[...TABLES]],
    );
    expect(tables.map((row) => row.table_name).sort()).toEqual([...TABLES].sort());

    const protectedTables = await rows<{ relname: string }>(
      `select relname from pg_class
       where relnamespace = 'public'::regnamespace and relkind = 'r' and relrowsecurity`,
    );
    expect(protectedTables.map((row) => row.relname).sort()).toEqual(
      [...TABLES].sort(),
    );

    const indexes = await rows<{ indexdef: string }>(
      `select indexdef from pg_indexes
       where schemaname = 'public' and tablename = 'knowledge_chunks'`,
    );
    expect(indexes.some((row) => row.indexdef.includes("USING hnsw"))).toBe(true);

    const bucket = (
      await rows<{
        public: boolean;
        file_size_limit: string;
        allowed_mime_types: string[];
      }>(`select public, file_size_limit, allowed_mime_types
          from storage.buckets where id = 'knowledge'`)
    )[0]!;
    expect(bucket.public).toBe(false);
    expect(Number(bucket.file_size_limit)).toBe(10 * 1024 * 1024);
    expect(bucket.allowed_mime_types).toEqual([
      "application/pdf",
      "text/markdown",
      "text/plain",
    ]);
  });

  it("rejects embeddings that are not 1536 dimensional", async () => {
    await setRole(db, "service_role");
    await db.exec(`
      insert into public.accounts (clerk_user_id) values ('free_owner');
      select public.create_project('free_owner', 'P', 'pk_dim');
    `);
    const projectId = (
      await rows<{ id: string }>("select id from public.projects")
    )[0]!.id;
    const sourceId = (
      await rows<{ id: string }>(
        "select public.reserve_knowledge_source($1, 'D', 'text') as id",
        [projectId],
      )
    )[0]!.id;
    await expect(
      db.query(
        `insert into public.knowledge_chunks (project_id, source_id, content, embedding)
         values ($1, $2, 'bad', '[1,0]'::extensions.vector)`,
        [projectId, sourceId],
      ),
    ).rejects.toThrow();
    await resetRole(db);
  });

  it("gives anon no access to any table or function from this migration", async () => {
    for (const table of TABLES) {
      const grants = (
        await rows<{
          select: boolean;
          truncate: boolean;
        }>(
          `select
             has_table_privilege('anon', $1, 'SELECT') as select,
             has_table_privilege('anon', $1, 'TRUNCATE') as truncate`,
          [`public.${table}`],
        )
      )[0]!;
      expect(grants.select, `anon SELECT on ${table}`).toBe(false);
      expect(grants.truncate, `anon TRUNCATE on ${table}`).toBe(false);

      const ownerGrants = (
        await rows<{ truncate: boolean }>(
          `select has_table_privilege('authenticated', $1, 'TRUNCATE') as truncate`,
          [`public.${table}`],
        )
      )[0]!;
      expect(ownerGrants.truncate, `authenticated TRUNCATE on ${table}`).toBe(
        false,
      );
    }

    for (const fn of SERVICE_FUNCTIONS) {
      for (const role of ["anon", "authenticated"]) {
        const result = (
          await rows<{ execute: boolean }>(
            `select has_function_privilege($1, $2, 'EXECUTE') as execute`,
            [role, `public.${fn}`],
          )
        )[0]!;
        expect(result.execute, `${role} EXECUTE on ${fn}`).toBe(false);
      }
    }

    await setRole(db, "anon");
    await expect(db.query("select * from public.projects")).rejects.toThrow(
      /permission denied/i,
    );
    await expect(
      db.query("select public.owner_activity()"),
    ).rejects.toThrow(/permission denied/i);
    await resetRole(db);
  });

  it("scopes owner reads and writes to their own tenant", async () => {
    const { freeProject, proProject, conversationId } = await seed();

    await setClaims(db, "free_owner");
    await setRole(db, "authenticated");

    const projects = await rows<{ id: string }>("select id from public.projects");
    expect(projects.map((row) => row.id)).toEqual([freeProject]);

    const messages = await rows<{ body: string }>("select body from public.messages");
    expect(messages.map((row) => row.body).sort()).toEqual(["Hello", "Hi"]);

    const renamed = await db.query(
      "update public.projects set name = 'hacked' where id = $1",
      [proProject],
    );
    expect(renamed.affectedRows).toBe(0);
    await expect(
      db.query("update public.projects set owner_id = 'pro_owner' where id = $1", [
        freeProject,
      ]),
    ).rejects.toThrow();
    await expect(
      db.query(
        "insert into public.projects (owner_id, name, public_key) values ('free_owner', 'x', 'pk_x')",
      ),
    ).rejects.toThrow(/permission denied/i);

    await resetRole(db);
    await clearClaims(db);

    await setClaims(db, "pro_owner");
    await setRole(db, "authenticated");
    const proProjects = await rows<{ id: string }>(
      "select id from public.projects",
    );
    expect(proProjects.map((row) => row.id)).toEqual([proProject]);
    expect(
      (await rows("select * from public.messages")).length,
    ).toBe(0);
    expect(
      (
        await rows<{ id: string }>(
          "select id from public.conversations where id = $1",
          [conversationId],
        )
      ).length,
    ).toBe(0);

    await resetRole(db);
    await clearClaims(db);
  });

  it("returns only the caller's dashboard numbers from owner_activity", async () => {
    await seed();

    await setClaims(db, "free_owner");
    await setRole(db, "authenticated");
    const activity = (
      await rows<{ owner_activity: Record<string, number> }>(
        "select public.owner_activity() as owner_activity",
      )
    )[0]!.owner_activity;
    expect(activity).toMatchObject({
      projects: 1,
      conversations: 1,
      messages: 2,
      knowledge_sources: 1,
      messages_used: 0,
    });
    await expect(
      db.query("select public.create_project('free_owner', 'another')"),
    ).rejects.toThrow(/permission denied/i);

    await resetRole(db);
    await setClaims(db, "pro_owner");
    await setRole(db, "authenticated");
    const otherActivity = (
      await rows<{ owner_activity: Record<string, number> }>(
        "select public.owner_activity() as owner_activity",
      )
    )[0]!.owner_activity;
    expect(otherActivity).toMatchObject({
      projects: 1,
      conversations: 0,
      messages: 0,
      knowledge_sources: 0,
      messages_used: 0,
    });
    await resetRole(db);
    await clearClaims(db);
  });

  it("reserves EXECUTE on all five service functions for service_role", async () => {
    const { freeProject } = await seed();
    const calls: Array<[string, unknown[]]> = [
      ["select public.create_project('free_owner', 'x')", []],
      [
        "select public.reserve_knowledge_source($1, 'x', 'text')",
        [freeProject],
      ],
      ["select public.consume_message($1)", [freeProject]],
      [
        "select public.save_chat_turn($1, null, 'v', 'q', 'a')",
        [freeProject],
      ],
      ["select public.match_chunks($1, $2::extensions.vector, 5)", [freeProject, embedding(0)]],
    ];

    for (const role of ["anon", "authenticated"]) {
      await setRole(db, role);
      for (const [text, params] of calls) {
        await expect(db.query(text, params)).rejects.toThrow(
          /permission denied/i,
        );
      }
      await resetRole(db);
    }

    await setRole(db, "service_role");
    const consumed = (
      await rows<{ consume_message: boolean }>(
        "select public.consume_message($1) as consume_message",
        [freeProject],
      )
    )[0]!;
    expect(consumed.consume_message).toBe(true);
    await resetRole(db);
  });

  it("enforces plan limits atomically under a row lock", async () => {
    const { freeProject, proProject } = await seed();

    for (const fn of [
      "create_project",
      "reserve_knowledge_source",
      "consume_message",
    ]) {
      const start = migrationSql.indexOf(`create function public.${fn}(`);
      const end = migrationSql.indexOf("create function public.", start + 10);
      const body = migrationSql.slice(start, end === -1 ? undefined : end);
      expect(body, `${fn} must lock the owner row`).toContain("for update of a");
    }

    await setRole(db, "service_role");

    await expect(
      db.query("select public.create_project('free_owner', 'second')"),
    ).rejects.toThrow(/project_limit_reached/);
    for (let index = 0; index < 4; index += 1) {
      await db.query(
        `select public.create_project('pro_owner', 'extra ${index}', $1)`,
        [`pk_extra_${index}`],
      );
    }
    await expect(
      db.query("select public.create_project('pro_owner', 'sixth')"),
    ).rejects.toThrow(/project_limit_reached/);

    for (let index = 0; index < 2; index += 1) {
      await db.query(
        "select public.reserve_knowledge_source($1, $2, 'text')",
        [freeProject, `source ${index}`],
      );
    }
    await expect(
      db.query(
        "select public.reserve_knowledge_source($1, 'fourth', 'text')",
        [freeProject],
      ),
    ).rejects.toThrow(/knowledge_source_limit_reached/);

    for (let index = 0; index < 25; index += 1) {
      await db.query(
        "select public.reserve_knowledge_source($1, $2, 'text')",
        [proProject, `source ${index}`],
      );
    }
    await expect(
      db.query(
        "select public.reserve_knowledge_source($1, 'twenty-sixth', 'text')",
        [proProject],
      ),
    ).rejects.toThrow(/knowledge_source_limit_reached/);

    for (let index = 0; index < 100; index += 1) {
      await db.query("select public.consume_message($1)", [freeProject]);
    }
    await expect(
      db.query("select public.consume_message($1)", [freeProject]),
    ).rejects.toThrow(/message_limit_reached/);

    await db.query(
      `update public.projects
       set messages_used = 1999, period_start = date_trunc('month', now())
       where id = $1`,
      [proProject],
    );
    await db.query("select public.consume_message($1)", [proProject]);
    await expect(
      db.query("select public.consume_message($1)", [proProject]),
    ).rejects.toThrow(/message_limit_reached/);

    await db.query(
      `update public.projects
       set messages_used = 100, period_start = date_trunc('month', now()) - interval '1 month'
       where id = $1`,
      [freeProject],
    );
    await db.query("select public.consume_message($1)", [freeProject]);
    const usage = (
      await rows<{ messages_used: number }>(
        "select messages_used from public.projects where id = $1",
        [freeProject],
      )
    )[0]!;
    expect(usage.messages_used).toBe(1);

    await db.exec("begin");
    await db.query("select public.consume_message($1)", [freeProject]);
    const locked = (
      await rows<{ count: string }>(
        `select count(*)::text as count from pg_locks
         where relation = 'public.accounts'::regclass and granted`,
      )
    )[0]!;
    expect(Number(locked.count)).toBeGreaterThan(0);
    await db.exec("rollback");

    await resetRole(db);
  });

  it("matches only ready chunks in the requested project", async () => {
    const { freeProject, proProject } = await seed();
    await setRole(db, "service_role");

    const otherSource = (
      await rows<{ id: string }>(
        "select public.reserve_knowledge_source($1, 'Other', 'text') as id",
        [proProject],
      )
    )[0]!.id;
    await db.query(
      `insert into public.knowledge_chunks (project_id, source_id, content, embedding)
       values ($1, $2, 'other project', $3::extensions.vector)`,
      [proProject, otherSource, embedding(0)],
    );

    const freeSource = (
      await rows<{ id: string }>(
        "select id from public.knowledge_sources where project_id = $1",
        [freeProject],
      )
    )[0]!.id;
    await db.query(`update public.knowledge_sources set status = 'ready'`);
    await db.query(
      `insert into public.knowledge_chunks (project_id, source_id, content, embedding)
       values ($1, $2, 'far', $3::extensions.vector),
              ($1, $2, 'near', $4::extensions.vector)`,
      [freeProject, freeSource, embedding(400), embedding(0)],
    );

    const matches = await rows<{
      content: string;
      similarity: number;
      source_id: string;
    }>(
      "select * from public.match_chunks($1, $2::extensions.vector, 5)",
      [freeProject, embedding(0)],
    );
    expect(matches.map((row) => row.content)).toEqual(["near", "far"]);
    expect(matches[0]!.similarity).toBeCloseTo(1, 4);
    expect(matches[0]!.source_id).toBe(freeSource);

    const limited = await rows(
      "select * from public.match_chunks($1, $2::extensions.vector, 1)",
      [freeProject, embedding(0)],
    );
    expect(limited.length).toBe(1);
    await resetRole(db);
  });
});

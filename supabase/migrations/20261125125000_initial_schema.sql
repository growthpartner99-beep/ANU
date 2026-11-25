-- Askwell Phase 1: core schema, tenant isolation, server-side limits and Storage bucket.
-- Additive only: this migration creates new objects and never drops or renames anything.
--
-- PLAN_LIMITS below mirror packages/shared/src/plans.ts (P1F-T01). Keep both in sync:
--   free: 1 project, 100 messages/month/project, 3 knowledge sources/project
--   pro:  5 projects, 2000 messages/month/project, 25 knowledge sources/project
--
-- PostgREST aggregates are a project-wide Data API setting: keep them disabled in
-- Supabase. anon has no grants on any object created here; visitors never hold a key.

create schema if not exists extensions;
create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.accounts (
  clerk_user_id text primary key,
  plan text not null default 'free' constraint accounts_plan_check check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references public.accounts (clerk_user_id) on delete cascade,
  name text not null,
  public_key text not null unique,
  messages_used integer not null default 0 constraint projects_messages_used_check check (messages_used >= 0),
  period_start timestamptz not null default date_trunc('month', now()),
  created_at timestamptz not null default now()
);

create table public.widget_configs (
  project_id uuid primary key references public.projects (id) on delete cascade,
  button_color text not null default '#000000',
  position text not null default 'bottom-right'
    constraint widget_configs_position_check check (position in ('bottom-right', 'bottom-left', 'top-right', 'top-left')),
  label text not null default '',
  animation text not null default 'fade'
    constraint widget_configs_animation_check check (animation in ('fade', 'slide', 'scale')),
  header_text text not null default '',
  show_badge boolean not null default true
);

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  type text not null constraint knowledge_sources_type_check check (type in ('text', 'pdf', 'md', 'txt')),
  storage_key text,
  status text not null default 'uploading'
    constraint knowledge_sources_status_check check (status in ('uploading', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now()
);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  source_id uuid not null references public.knowledge_sources (id) on delete cascade,
  content text not null,
  embedding extensions.vector(1536)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null constraint messages_role_check check (role in ('visitor', 'bot')),
  body text not null,
  created_at timestamptz not null default now()
);

create index projects_owner_id_idx on public.projects (owner_id);
create index knowledge_sources_project_id_idx on public.knowledge_sources (project_id);
create index knowledge_chunks_project_id_source_id_idx on public.knowledge_chunks (project_id, source_id);
create index knowledge_chunks_embedding_hnsw_idx
  on public.knowledge_chunks using hnsw (embedding extensions.vector_cosine_ops);
create index conversations_project_id_idx on public.conversations (project_id);
create index messages_conversation_id_idx on public.messages (conversation_id);

alter table public.accounts enable row level security;
alter table public.projects enable row level security;
alter table public.widget_configs enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- ---------------------------------------------------------------------------
-- RLS helpers. SECURITY DEFINER is required so a policy can read ownership
-- without recursing into the policy on the same table. They only ever return
-- ids belonging to the JWT subject and are granted to authenticated alone.
-- ---------------------------------------------------------------------------

create function public.owned_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.projects p
  where p.owner_id = (select auth.jwt() ->> 'sub');
$$;

create function public.owned_conversation_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.id
  from public.conversations c
  where c.project_id in (select public.owned_project_ids());
$$;

-- Dashboard numbers. Runs as the caller: RLS scopes every count to their rows.
create function public.owner_activity()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'projects', (
      select count(*) from public.projects p
      where p.owner_id = (select auth.jwt() ->> 'sub')
    ),
    'conversations', (
      select count(*) from public.conversations c
      where c.project_id in (select public.owned_project_ids())
    ),
    'messages', (
      select count(*) from public.messages m
      where m.conversation_id in (select public.owned_conversation_ids())
    ),
    'knowledge_sources', (
      select count(*) from public.knowledge_sources k
      where k.project_id in (select public.owned_project_ids())
    ),
    'messages_used', (
      select coalesce(sum(p.messages_used), 0) from public.projects p
      where p.owner_id = (select auth.jwt() ->> 'sub')
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- Owner policies. No anon policy exists. Owners only read their own rows; the
-- only write they may make directly is renaming or deleting their own project.
-- ---------------------------------------------------------------------------

create policy accounts_select_own on public.accounts
  for select to authenticated
  using (clerk_user_id = (select auth.jwt() ->> 'sub'));

create policy projects_select_owned on public.projects
  for select to authenticated
  using (id in (select public.owned_project_ids()));

create policy projects_update_owned on public.projects
  for update to authenticated
  using (id in (select public.owned_project_ids()))
  with check (owner_id = (select auth.jwt() ->> 'sub'));

create policy projects_delete_owned on public.projects
  for delete to authenticated
  using (id in (select public.owned_project_ids()));

create policy widget_configs_select_owned on public.widget_configs
  for select to authenticated
  using (project_id in (select public.owned_project_ids()));

create policy knowledge_sources_select_owned on public.knowledge_sources
  for select to authenticated
  using (project_id in (select public.owned_project_ids()));

create policy knowledge_chunks_select_owned on public.knowledge_chunks
  for select to authenticated
  using (project_id in (select public.owned_project_ids()));

create policy conversations_select_owned on public.conversations
  for select to authenticated
  using (project_id in (select public.owned_project_ids()));

create policy messages_select_owned on public.messages
  for select to authenticated
  using (conversation_id in (select public.owned_conversation_ids()));

-- ---------------------------------------------------------------------------
-- Service-role-only functions. Every one is SECURITY INVOKER with an empty
-- search_path: service_role has BYPASSRLS, so invoker rights are enough.
-- The three counting functions lock the account row before reading the count,
-- so concurrent requests for one owner cannot both pass a limit check.
-- Limit errors use the messages below; routes translate them to 402/429.
-- ---------------------------------------------------------------------------

create function public.create_project(
  p_owner_id text,
  p_name text,
  p_public_key text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_plan text;
  v_limit integer;
  v_project_id uuid;
  v_public_key text;
begin
  select a.plan into v_plan
  from public.accounts a
  where a.clerk_user_id = p_owner_id
  for update of a;

  if not found then
    raise exception 'account_not_found';
  end if;

  v_limit := case v_plan when 'pro' then 5 else 1 end; -- PLAN_LIMITS.maxProjects

  if (select count(*) from public.projects p where p.owner_id = p_owner_id) >= v_limit then
    raise exception 'project_limit_reached';
  end if;

  v_public_key := coalesce(
    p_public_key,
    'pk_' || replace(gen_random_uuid()::text, '-', '')
  );

  insert into public.projects (owner_id, name, public_key)
  values (p_owner_id, p_name, v_public_key)
  returning id into v_project_id;

  insert into public.widget_configs (project_id) values (v_project_id);

  return v_project_id;
end;
$$;

create function public.reserve_knowledge_source(
  p_project_id uuid,
  p_title text,
  p_type text,
  p_storage_key text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_plan text;
  v_limit integer;
  v_source_id uuid;
begin
  select a.plan into v_plan
  from public.projects p
  join public.accounts a on a.clerk_user_id = p.owner_id
  where p.id = p_project_id
  for update of a;

  if not found then
    raise exception 'project_not_found';
  end if;

  v_limit := case v_plan when 'pro' then 25 else 3 end; -- PLAN_LIMITS.maxKnowledgeSources

  if (select count(*) from public.knowledge_sources k where k.project_id = p_project_id) >= v_limit then
    raise exception 'knowledge_source_limit_reached';
  end if;

  insert into public.knowledge_sources (project_id, title, type, storage_key, status)
  values (
    p_project_id,
    p_title,
    p_type,
    p_storage_key,
    case when p_storage_key is null then 'processing' else 'uploading' end
  )
  returning id into v_source_id;

  return v_source_id;
end;
$$;

create function public.consume_message(p_project_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_plan text;
  v_used integer;
  v_period_start timestamptz;
  v_limit integer;
begin
  select a.plan, p.messages_used, p.period_start
  into v_plan, v_used, v_period_start
  from public.projects p
  join public.accounts a on a.clerk_user_id = p.owner_id
  where p.id = p_project_id
  for update of a;

  if not found then
    raise exception 'project_not_found';
  end if;

  v_limit := case v_plan when 'pro' then 2000 else 100 end; -- PLAN_LIMITS.maxMessagesPerMonth

  if v_period_start < date_trunc('month', now()) then
    update public.projects
    set messages_used = 0, period_start = date_trunc('month', now())
    where id = p_project_id;
    v_used := 0;
  end if;

  if v_used >= v_limit then
    raise exception 'message_limit_reached';
  end if;

  update public.projects
  set messages_used = messages_used + 1
  where id = p_project_id;

  return true;
end;
$$;

create function public.save_chat_turn(
  p_project_id uuid,
  p_conversation_id uuid,
  p_visitor_id text,
  p_visitor_message text,
  p_bot_message text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_conversation_id uuid;
begin
  if p_conversation_id is null then
    insert into public.conversations (project_id, visitor_id)
    values (p_project_id, p_visitor_id)
    returning id into v_conversation_id;
  else
    select c.id into v_conversation_id
    from public.conversations c
    where c.id = p_conversation_id and c.project_id = p_project_id;

    if not found then
      raise exception 'conversation_not_found';
    end if;
  end if;

  insert into public.messages (conversation_id, role, body)
  values
    (v_conversation_id, 'visitor', p_visitor_message),
    (v_conversation_id, 'bot', p_bot_message);

  return v_conversation_id;
end;
$$;

create function public.match_chunks(
  p_project_id uuid,
  p_query_embedding extensions.vector(1536),
  p_match_count integer default 5
)
returns table (id uuid, source_id uuid, content text, similarity double precision)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id,
    c.source_id,
    c.content,
    1 - (c.embedding OPERATOR(extensions.<=>) p_query_embedding) as similarity
  from public.knowledge_chunks c
  join public.knowledge_sources s on s.id = c.source_id
  where c.project_id = p_project_id
    and s.status = 'ready'
  order by c.embedding OPERATOR(extensions.<=>) p_query_embedding
  limit least(greatest(p_match_count, 1), 20);
$$;

-- ---------------------------------------------------------------------------
-- Grants. Postgres gives EXECUTE on new functions to PUBLIC by default: take
-- it away explicitly. anon gets no grant on any table or function.
-- ---------------------------------------------------------------------------

grant usage on schema extensions to authenticated, service_role;

revoke all on
  public.accounts, public.projects, public.widget_configs,
  public.knowledge_sources, public.knowledge_chunks,
  public.conversations, public.messages
from public, anon, authenticated;

grant select on
  public.accounts, public.projects, public.widget_configs,
  public.knowledge_sources, public.knowledge_chunks,
  public.conversations, public.messages
to authenticated;

grant update (name) on public.projects to authenticated;
grant delete on public.projects to authenticated;

revoke truncate on
  public.accounts, public.projects, public.widget_configs,
  public.knowledge_sources, public.knowledge_chunks,
  public.conversations, public.messages
from anon, authenticated;

grant all on
  public.accounts, public.projects, public.widget_configs,
  public.knowledge_sources, public.knowledge_chunks,
  public.conversations, public.messages
to service_role;

revoke all on function public.owned_project_ids() from public, anon;
grant execute on function public.owned_project_ids() to authenticated;

revoke all on function public.owned_conversation_ids() from public, anon;
grant execute on function public.owned_conversation_ids() to authenticated;

revoke all on function public.owner_activity() from public, anon;
grant execute on function public.owner_activity() to authenticated;

revoke all on function
  public.create_project(text, text, text),
  public.reserve_knowledge_source(uuid, text, text, text),
  public.consume_message(uuid),
  public.save_chat_turn(uuid, uuid, text, text, text),
  public.match_chunks(uuid, extensions.vector, integer)
from public, anon, authenticated;

grant execute on function
  public.create_project(text, text, text),
  public.reserve_knowledge_source(uuid, text, text, text),
  public.consume_message(uuid),
  public.save_chat_turn(uuid, uuid, text, text, text),
  public.match_chunks(uuid, extensions.vector, integer)
to service_role;

-- ---------------------------------------------------------------------------
-- Private Storage bucket. The server creates one-time signed upload URLs;
-- no public URL and no anon/authenticated Storage policy is added.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'knowledge',
  'knowledge',
  false,
  10 * 1024 * 1024, -- MAX_KNOWLEDGE_FILE_BYTES in packages/shared/src/constants.ts
  array['application/pdf', 'text/markdown', 'text/plain']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

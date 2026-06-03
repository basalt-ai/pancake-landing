-- Open roadmap — schema, security, and seed.
--
-- Run this once against your Supabase project (SQL editor or `supabase db push`).
-- Design notes:
--   * Public users get READ-ONLY access to `ideas` via RLS. Every write
--     (create / vote / delete) goes through a Next.js API route using the
--     service-role key, which bypasses RLS. So there are deliberately NO
--     insert/update/delete policies for the anon role.
--   * `votes` is never exposed to the anon role at all — it's an internal
--     dedup table. Vote counts are denormalised onto ideas.vote_count and
--     mutated atomically by the cast_vote / remove_vote functions.

create extension if not exists pgcrypto;

-- ──────────────────────────────────────────────────────────────────────────
-- Tables
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.ideas (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 255),
  description  text not null default '' check (char_length(description) <= 4000),
  tag          text not null check (tag in ('squads', 'core-features', 'integrations')),
  status       text not null default 'open'
                 check (status in ('open', 'planned', 'in-progress', 'shipped', 'wont-do')),
  author_name  text check (author_name is null or char_length(author_name) <= 80),
  vote_count   integer not null default 0 check (vote_count >= 0),
  created_at   timestamptz not null default now()
);

create table if not exists public.votes (
  id           uuid primary key default gen_random_uuid(),
  idea_id      uuid not null references public.ideas(id) on delete cascade,
  voter_token  text not null check (char_length(voter_token) between 8 and 100),
  created_at   timestamptz not null default now(),
  unique (idea_id, voter_token)
);

create index if not exists ideas_tag_idx        on public.ideas (tag);
create index if not exists ideas_status_idx     on public.ideas (status);
create index if not exists ideas_vote_count_idx on public.ideas (vote_count desc);
create index if not exists votes_idea_id_idx    on public.votes (idea_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────────────────

alter table public.ideas enable row level security;
alter table public.votes enable row level security;

-- Public read of ideas only. (Writes happen via service role → bypass RLS.)
drop policy if exists "ideas_public_read" on public.ideas;
create policy "ideas_public_read" on public.ideas
  for select using (true);

-- No policies on votes → anon/authenticated cannot touch it directly.

-- ──────────────────────────────────────────────────────────────────────────
-- Atomic vote mutations (denormalised counter stays consistent)
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.cast_vote(p_idea_id uuid, p_voter_token text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.votes (idea_id, voter_token)
  values (p_idea_id, p_voter_token)
  on conflict (idea_id, voter_token) do nothing;

  if found then
    update public.ideas set vote_count = vote_count + 1 where id = p_idea_id;
  end if;

  select vote_count into v_count from public.ideas where id = p_idea_id;
  return coalesce(v_count, 0);
end;
$$;

create or replace function public.remove_vote(p_idea_id uuid, p_voter_token text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from public.votes
  where idea_id = p_idea_id and voter_token = p_voter_token;

  if found then
    update public.ideas set vote_count = greatest(vote_count - 1, 0) where id = p_idea_id;
  end if;

  select vote_count into v_count from public.ideas where id = p_idea_id;
  return coalesce(v_count, 0);
end;
$$;

-- ──────────────────────────────────────────────────────────────────────────
-- Seed data (matches components/sections/roadmap/roadmap-data.ts)
-- Safe to skip on re-run: only inserts when the table is empty.
-- ──────────────────────────────────────────────────────────────────────────

insert into public.ideas (title, description, tag, status, author_name, vote_count)
select * from (values
  ('UX research squad',
   'A dedicated squad that runs user interviews, synthesises transcripts, and ships a prioritised insights doc every week — so product decisions stop being vibes.',
   'squads', 'planned', 'Camille', 142),
  ('Email agent squad',
   'An always-on squad that triages the shared inbox, drafts replies in your voice, and escalates only the threads that actually need a human.',
   'squads', 'in-progress', 'Tristan', 118),
  ('Two-way Linear sync',
   'Let a squad open, update, and close Linear issues — and reflect status changes back on the roadmap automatically. No more copy-pasting between tools.',
   'integrations', 'planned', NULL, 97),
  ('Voice briefings',
   'A spoken daily standup from your cofounder — what shipped overnight, what''s blocked, what needs a decision — playable from your phone before you open the laptop.',
   'core-features', 'open', 'Guillaume', 86),
  ('Slack thread → action',
   'React to any Slack message with an emoji to hand it to a squad as a task. The agent picks it up, does the work, and replies in-thread when it''s done.',
   'integrations', 'shipped', 'Léa', 73),
  ('Growth squad',
   'Runs paid + organic experiments end to end: writes the variants, ships the landing pages, watches the dashboards, and kills the losers without being asked.',
   'squads', 'open', NULL, 64),
  ('Shared company memory',
   'One memory every squad reads from and writes to — decisions, brand voice, customer facts — so the engineering agent knows what the growth agent just learned.',
   'core-features', 'in-progress', 'François', 58),
  ('Notion knowledge base import',
   'Point Pancake at a Notion workspace and have it ingest the docs into company memory, then keep them in sync as pages change.',
   'integrations', 'open', NULL, 41),
  ('Kanban roadmap view',
   'A board grouped by status (Open → Planned → In progress → Shipped) so anyone can see what the company is building at a glance.',
   'core-features', 'planned', 'Camille', 37),
  ('Downvotes on ideas',
   'Let people downvote ideas they disagree with, not just upvote the ones they like.',
   'core-features', 'wont-do', NULL, 12)
) as seed(title, description, tag, status, author_name, vote_count)
where not exists (select 1 from public.ideas);

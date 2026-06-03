-- Open roadmap — comments.
--
-- Run after 0001. Adds a comments table + a denormalised ideas.comment_count
-- kept in sync by a trigger. Like votes, comments are written/read through the
-- service role in API routes, so there are no anon RLS policies.

-- ──────────────────────────────────────────────────────────────────────────
-- Table
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  idea_id     uuid not null references public.ideas(id) on delete cascade,
  author_name text check (author_name is null or char_length(author_name) <= 80),
  body        text not null check (char_length(body) between 1 and 2000),
  created_at  timestamptz not null default now()
);

create index if not exists comments_idea_id_idx on public.comments (idea_id, created_at);

alter table public.comments enable row level security;
-- No anon policies — all access via the service role (API routes).

-- ──────────────────────────────────────────────────────────────────────────
-- Denormalised comment_count on ideas, maintained by trigger
-- ──────────────────────────────────────────────────────────────────────────

alter table public.ideas
  add column if not exists comment_count integer not null default 0
    check (comment_count >= 0);

create or replace function public.sync_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.ideas set comment_count = comment_count + 1 where id = new.idea_id;
  elsif (tg_op = 'DELETE') then
    update public.ideas set comment_count = greatest(comment_count - 1, 0) where id = old.idea_id;
  end if;
  return null;
end;
$$;

drop trigger if exists comments_count_trg on public.comments;
create trigger comments_count_trg
  after insert or delete on public.comments
  for each row execute function public.sync_comment_count();

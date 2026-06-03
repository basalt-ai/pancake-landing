# Open roadmap — backend setup

The page works with **no backend** (read-only "preview mode" from static seed
data). To enable posting ideas, persisted votes, and admin delete, wire up
Supabase. ~15 minutes, one-time.

## 1. Create the Supabase project

1. Create a new project at https://supabase.com/dashboard (region near your users).
2. Copy from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

## 2. Run the migration

In the Supabase **SQL editor**, paste and run
[`supabase/migrations/0001_roadmap.sql`](../../supabase/migrations/0001_roadmap.sql).
It creates the `ideas` + `votes` tables, RLS (public read only — all writes go
through the service role), the `cast_vote` / `remove_vote` functions, and seeds
the 10 starter ideas.

Then run [`supabase/migrations/0002_comments.sql`](../../supabase/migrations/0002_comments.sql)
— it adds the `comments` table and an `ideas.comment_count` kept in sync by a
trigger. (The board degrades gracefully if 0002 hasn't run yet, but comments
won't work until it has.)

## 3. Set the admin password

Admins enter a shared password to unlock delete — no accounts, no external IdP,
no `infrastructure` changes.

1. Set `ROADMAP_ADMIN_PASSWORD` (below) to a long secret (`openssl rand -hex 16`).
2. On the live board, click **Admin sign in**, enter the password. A signed,
   HttpOnly cookie (valid 7 days) is set and delete buttons appear. **Sign out**
   clears it.

How it's enforced: the login route compares the password (constant-time) and
sets a cookie signed with the password as the HMAC key, so it can't be forged
without the password and JS can't read it. The delete route verifies that cookie
server-side. Login is rate-limited (10 attempts / 10 min per IP).

**Fail-closed:** no password set, or no/invalid/expired cookie ⇒ no admin,
delete denied. Posting and voting work regardless.

## 4. Set environment variables

Copy `.env.local.example` → `.env.local` for local dev, and set the same vars in
**Vercel → Settings → Environment Variables**:

| Var | What |
|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (secret) |
| `ROADMAP_ADMIN_PASSWORD` | shared admin password (secret) |

Redeploy. The board switches from preview mode to live automatically.

## How auth is wired (for future changes)

Everyone reads. Anyone posts (guarded by a honeypot field + per-IP rate
limiting in the API routes). Only a request carrying a valid admin cookie can
delete — enforced server-side in the delete route via `isAdmin()`.

The admin check lives in **one** place: `lib/auth/admin.ts` (`isAdmin` +
`checkAdminPassword`/`mintAdminCookie`). The routes + page call through it, so
swapping the auth model later (e.g. real SSO) touches only that module.

## Security notes

- The `service_role` key is only ever read server-side (`lib/supabase/admin.ts`
  is marked `server-only`). Never put it in a `NEXT_PUBLIC_*` var.
- Rate limiting is in-memory (per serverless instance) — a first-line guardrail,
  not a global limiter. Swap in Upstash/Vercel KV behind `lib/rate-limit.ts` if
  abuse becomes real.

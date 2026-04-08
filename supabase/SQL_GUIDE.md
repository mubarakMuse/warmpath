# SQL guide — Warmpath companies & roles

## Existing state (before this project)

This app had **no** Supabase tables for recruiting. The landing page only logged interest to a local file. There were **no** prior `companies` / `roles` tables or RLS policies in this repo.

## New tables

### `public.companies`

| Column         | Type        | Notes                                      |
|----------------|-------------|--------------------------------------------|
| `id`           | uuid PK     | Default `gen_random_uuid()`                |
| `name`         | text        | Required                                   |
| `slug`         | text        | Unique, URL-safe identifier                |
| `logo_url`     | text        | Optional                                   |
| `linkedin_url` | text        | Optional                                   |
| `website`      | text        | Optional                                   |
| `description`  | text        | Short company blurb                        |
| `access_code`  | text        | Unique; used on `/company/login`           |
| `created_at`   | timestamptz | Default `now()`                            |

### `public.roles`

| Column         | Type        | Notes                                      |
|----------------|-------------|--------------------------------------------|
| `id`           | uuid PK     | Default `gen_random_uuid()`                |
| `company_id`   | uuid FK     | → `companies.id`, `ON DELETE CASCADE`      |
| `title`        | text        | Job title                                  |
| `slug`         | text        | Unique globally (e.g. future `/r/[slug]`)  |
| `description`  | text        | Optional                                   |
| `location`     | text        | Optional                                   |
| `status`       | text        | `draft` \| `active` \| `closed`            |
| `referral_bonus` | text     | Optional; **internal** (admin, company portal, connectors). **Not** on public `/r/[slug]`. |
| `created_at`   | timestamptz | Default `now()`                            |

## Public job page

- **`/r/[slug]`** — Server-rendered page for **active** roles only. Shows company + role details suitable for sharing with candidates. Does **not** include `referral_bonus`.

## Row Level Security (RLS)

- **Enabled** on `companies` and `roles`.
- **No** `CREATE POLICY` for `anon` or `authenticated`.
- Effect: clients using the **anon** or **authenticated** Supabase JWT **cannot** select/insert/update/delete these rows.
- The Next.js server uses **`SUPABASE_SERVICE_ROLE_KEY`** (never exposed to the browser). The **service role bypasses RLS**, so server actions can manage data safely.

The app serves `/r/[slug]` via the **service role** on the server (not the anon key). If you later read jobs from the browser with the anon key, add explicit `SELECT` policies (e.g. only `roles` where `status = 'active'`, and omit `referral_bonus` from client queries).

### `public.connectors`

People (PMs, EMs, etc.) who refer candidates. They sign in at `/connect/login` with `access_code` (same idea as company codes).

| Column         | Type        | Notes                                      |
|----------------|-------------|--------------------------------------------|
| `id`           | uuid PK     | Default `gen_random_uuid()`                |
| `full_name`    | text        | Required                                   |
| `role_title`   | text        | Optional (how they describe themselves)    |
| `email`        | text        | Optional                                   |
| `linkedin_url` | text        | Optional                                   |
| `access_code`  | text        | Unique; used on `/connect/login`           |
| `created_at`   | timestamptz | Default `now()`                            |

RLS enabled, **no** policies — server **service role** only.

### `public.connector_referrals`

One row per referral: a connector submits a **LinkedIn URL** and **fit** text for a specific **role**.

| Column                    | Type        | Notes                                 |
|---------------------------|-------------|---------------------------------------|
| `id`                      | uuid PK     | Default `gen_random_uuid()`           |
| `connector_id`            | uuid FK     | → `connectors.id`, `ON DELETE CASCADE` |
| `role_id`                 | uuid FK     | → `roles.id`, `ON DELETE CASCADE`     |
| `candidate_linkedin_url`  | text        | Required                              |
| `fit_description`         | text        | Required                              |
| `candidate_name`        | text        | Optional                              |
| `candidate_email`         | text        | Optional                              |
| `relationship_type`      | text        | Optional (e.g. colleague, friend, other) |
| `relationship_other`      | text        | Optional; detail when type is `other` |
| `referral_stage`          | text        | Company pipeline: `new`, `reviewing`, `interviewing`, `offer`, `hired`, `rejected` (migration 005) |
| `company_reason_preset`   | text        | Optional canned reason key (see app `REASON_PRESETS`) |
| `company_reason_note`     | text        | Optional free-text from company |
| `company_responded_at`    | timestamptz | Last company update on this referral |
| `created_at`              | timestamptz | Default `now()`                       |

RLS enabled, **no** policies — server **service role** only.

### `public.waitlist`

| Column         | Type        | Notes                                                    |
|----------------|-------------|----------------------------------------------------------|
| `id`           | uuid PK     | Default `gen_random_uuid()`                              |
| `kind`         | text        | `company_interest` \| `connector` (landing vs future)    |
| `company_name` | text        | From landing form (optional context for other kinds)     |
| `email`        | text        | Nullable; use for connector signups later                |
| `created_at`   | timestamptz | Default `now()`                                          |

RLS enabled, **no** policies — inserts only from Next.js **service role** (e.g. `saveCompanyInterest` server action).

## Files to run (order)

1. `migrations/001_companies_roles.sql` — companies + roles + RLS.
2. `migrations/002_waitlist.sql` — waitlist + RLS.
3. `migrations/003_connectors_referrals.sql` — connectors + connector_referrals + RLS.
4. `migrations/004_role_bonus_referral_fields.sql` — `roles.referral_bonus` + optional fields on `connector_referrals`.
5. `migrations/005_referral_company_response.sql` — company stage + reason fields on `connector_referrals`.
6. `seed_demo_companies.sql` — optional Owner + Brighter Tunnel sample rows.

## Environment variables (app)

See root `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional for future client use), `SUPABASE_SERVICE_ROLE_KEY`, `WARMPATH_SESSION_SECRET`, `WARMPATH_ADMIN_PASSWORD`.

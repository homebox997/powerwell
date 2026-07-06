# PowerWell / agedpawwell.com online deployment report

Date: 2026-07-07  
Repository: https://github.com/homebox997/powerwell  
Branch: main  
Commit: 2e9ac7d Deploy Supabase admin RPC integration

## 1. Supabase database

Status: completed and tested.

Target project:
- Project ref: cbbaejwbkenrutmgqikt
- API base URL: https://cbbaejwbkenrutmgqikt.supabase.co
- Region: ap-southeast-1
- Database engine: PostgreSQL 17

Executed SQL files:
- supabase_au_minimal_schema.sql
- supabase_permission_notion_extension.sql
- supabase_public_rpc_wrappers.sql

Key corrections made before import:
- Added missing admin CRUD RPC functions required by `admin/admin.js`.
- Renamed `permission_change_requests.current_role` to `current_admin_role` to avoid PostgreSQL syntax conflict.
- Fixed malformed role-array syntax in the permission and Notion workflow functions.
- Added `public` RPC wrappers so the frontend works without manually exposing the `app_api` schema in Supabase dashboard.

Validated structure:
- Base content tables: `blog_articles`, `disease_articles`, `assessment_submissions`, `community_posts`, `community_comments`, `interface_events`.
- Admin/workflow tables: `admin_users`, `admin_invitations`, `permission_change_requests`, `auth_lockouts`, `admin_operation_logs`, `notion_connections`, `notion_field_mappings`, `notion_sync_jobs`, `notion_review_pool`, `system_events`.
- Primary keys and unique indexes exist.
- Country/created indexes exist on the six base content tables.
- RLS is enabled on all deployed tables.
- Direct client table access remains revoked; frontend calls RPC only.

Online self-test:
- Public form RPC `submit_assessment`: passed.
- Temporary admin auth login: passed.
- Current admin role check: passed as `super_admin`.
- Admin CRUD through RPC:
  - create `blog_articles`: passed.
  - list `blog_articles`: passed.
  - update `blog_articles`: passed.
  - delete `blog_articles`: passed.
- Test assessment row: cleaned.
- Temporary auth/admin test account: cleaned.

## 2. Frontend code and GitHub

Status: completed.

Updated files:
- `admin/config.js`
- `admin/README.md`
- `supabase_permission_notion_extension.sql`
- `supabase_public_rpc_wrappers.sql`

GitHub push:
- Branch: `main`
- Commit: `2e9ac7d`
- Push result: successful.

Admin frontend configuration:
- Supabase URL: configured.
- Supabase anon key: configured in `admin/config.js`.
- RPC schema: `public`.

## 3. Vercel deployment

Status: blocked by authentication.

Findings:
- No Vercel CLI was available in the current shell.
- No `.vercel` project binding exists in `D:\temp\powerwell`.
- Existing Vercel token probe returned `403 invalidToken`.

Required user action:
- Provide a valid Vercel token, or sign in to Vercel and confirm Codex may use that session, or explicitly approve Chrome/browser-based setup with your logged-in Vercel account.

Pending Vercel tasks:
- Link project to GitHub repository `homebox997/powerwell`.
- Deploy branch `main`.
- Configure production domain.
- Enable automatic deployments.
- Add environment variables if Vercel project uses runtime env values.

## 4. Cloudflare domain

Status: not started because step 3 is blocked and the task requires strict order.

Pending Cloudflare tasks:
- Add DNS records for Vercel target.
- Enable HTTPS.
- Configure cache rules.
- Verify `agedpawwell.com` and `www.agedpawwell.com`.

## 5. Final full-chain test

Status: partially completed at Supabase/API layer; production-domain test pending Vercel and Cloudflare.

Completed:
- Supabase table/RPC write path.
- Admin auth and CRUD path.
- Public form database write path.

Pending:
- Official production URL.
- Admin URL under production domain.
- Browser-level CORS/domain verification.
- Cloudflare HTTPS/cache verification.

## Environment variable / secret checklist

Configured locally in frontend:
- `SUPABASE_URL`: represented by `admin/config.js` `supabase.url`.
- `SUPABASE_ANON_KEY`: represented by `admin/config.js` `supabase.anonKey`.
- `SUPABASE_RPC_SCHEMA`: `public`.

Not configured because Vercel is blocked:
- `NEXT_PUBLIC_SUPABASE_URL` or equivalent, if the Vercel project later uses a build system.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or equivalent, if the Vercel project later uses a build system.
- Domain allowlist / Site URL settings for final production URL.

## Current blocker

The deployment cannot honestly be marked complete until Vercel authentication is restored and Cloudflare DNS is configured. Database import and GitHub code push are complete.

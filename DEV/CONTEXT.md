# Current Context

## State

- Product: Obra.flux, a fictional MVP for physical works tracking. It is not an ERP or financial product.
- Next.js 15 / React 19 / TypeScript / Tailwind; Supabase PostgreSQL and Supabase Auth. Main read pages load current Supabase rows through `src/services/project-service.ts`; `src/data/mock-data.ts` was removed.
- `/login` uses email/password with `@supabase/ssr`, cookie session refresh and logout. `src/middleware.ts` requires an authenticated Supabase user for every operational page route and preserves the requested path in `/login?next=...`; `/login` is the sole unauthenticated UI. Protected responses are no-store. Authenticated writes use server endpoints and explicit user checks: create project update, update stage, create/update/resolve issue.
- Dashboard tracks operational progress and upcoming stage/project/important-issue milestones. Documents remain metadata only; attachments/uploads are not active.
- `supabase/migrations/20260930120000_scope_authenticated_operational_writes.sql` narrows policies only. Anonymous SELECT policies and RLS are preserved. No table/column/data change was made.
- Acceptance gate completed 2026-09-30 in local production mode with the maestro-provisioned test account. Login/session refresh/logout and authenticated writes to updates, stages and issues passed; test rows were cleaned by exact ID and the stage was restored. No deployment.

## Commands

- Install: `npm install`
- Local: `npm run dev`
- Checks: `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit`
- Required public variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `.env.local` is Git-ignored. Never use/expose a service-role key.

## Decisions, Constraints And Risks

- Use only fictional data. Do not query, calculate, map or render money fields. Services select explicit physical/operational columns and avoid `project_overview`.
- Do not alter schema or delete data. Existing RLS remains enabled; anon SELECT remains. Authenticated policies now permit SELECT generally, stage UPDATE, issue INSERT/UPDATE, update INSERT; other tables are read-only. Application validates stage/vendor relationships server-side.
- No public signup, SAP, ERP, finance, purchases, fiscal, RH, multi-company, external automation, messaging, full contract workflows or Storage upload.
- The maestro provisioned a fictional Supabase Auth test account manually. Do not create additional users or store credentials.
- Errors/loading/empty UI exists; no automated unit/e2e suite is configured. Consult `VERIFY.md` for exercised checks.

## Next Context

Authenticated writes and login were previously accepted; the private-route implementation is complete and production HTTP/build checks pass. Browser verification of new login/logout/back/expiry and viewport behavior remains pending. See `HANDOFF.md` and `VERIFY.md`; commit/deploy only when the maestro requests it.

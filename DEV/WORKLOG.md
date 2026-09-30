# Worklog

## 2026-09-29 — Maestro setup
- Initialized project contract and durable DEV context.

## 2026-09-30 — Physical works MVP
- Built the responsive project, stage, issue, contractor, update and document experience with fictional examples.
- Verified lint, TypeScript, build, audit and mobile layouts; preserved physical-only product scope.

## 2026-09-30 — Supabase read integration
- Replaced mock-backed primary screens with explicit operational queries from the existing Supabase dataset; removed `src/data/mock-data.ts`.
- Kept financial fields out of queries/UI and documented public read behavior; anonymous update insert was correctly blocked by RLS.
- Verified route navigation, responsive widths, filters, build and no console errors.

## 2026-09-30 — Authenticated operational workflows
- Added SSR Auth (`@supabase/ssr`), `/login`, session refresh, logout, friendly auth errors and protected API routes for updates, stages and issues.
- Added stage editing, issue create/edit/resolve, combined issue filters, operational dashboard counters and stage/delivery/priority milestones. Corrected dashboard mobile overflow.
- Added shared dialog keyboard/focus handling: initial focus, tab loop, Escape close and focus restoration.
- Restricted the existing broad authenticated `ALL` RLS policies to read-only plus only expected INSERT/UPDATE operations; preserved anonymous read policies. Versioned/applied a policy-only migration; no row, table, or column changes.
- Verified: lint, typecheck, production build, npm audit (0 advisories), all primary routes and 390 px widths, stage/issue dialogs, invalid-login feedback, 401 on each visitor write endpoint, no browser page/console errors, `.env.local` ignored, public anon key used as intended and no service-role reference in source/browser assets.
- At the end of that implementation pass, Auth had no test user, so authenticated persistence remained pending. The maestro provisioned one manually and the next acceptance-gate entry below records the completed validation.
- No deploy. Next context: `HANDOFF.md` and `VERIFY.md`.

## 2026-09-30 — Authenticated acceptance gate
- Used the manually provisioned test identity to verify valid and invalid login, safe return context, session after refresh and logout. No password was added to project files, application logs or DEV documentation.
- Verified real writes through the UI: update POST 201 and row persistence; stage PATCH 200 and persisted status/progress/observation; issue POST/PATCH/resolve 201/200/200 and persisted values after refresh.
- Reverted the stage through the UI and removed only the exact fictional test update/issue rows; database queries confirmed cleanup and original stage values.
- Rechecked visitor read (200), all three write denials after logout (401), RLS enabled on all eight operational tables, and the intended policies. No schema or policy changes.
- Rechecked 390 px login, dashboard, project detail, stage dialog, issue create/edit dialog and update form; browser errors empty and no runtime/hydration errors observed.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=low` passed (0 vulnerabilities). No commit or deployment.

## 2026-09-30 — Private application access
- Moved Next middleware into `src/middleware.ts` (the repository uses `src/app`; the root middleware was not included in the production build) and centralized session validation plus safe `next` redirects for all operational routes.
- Made `/login` render without the app shell, kept authenticated identity/logout controls, added no-store cache headers and a BFCache return reload guard. API write handlers remain explicitly session guarded.
- Verified production build, lint, typecheck, unauthenticated HTTP redirects on all requested route families, preserved query/context, no-store headers and a 401 anonymous update write. No DB/RLS changes or deployment.
- Browser validation of valid login, refresh, logout/back, expiry, 390 px and desktop remains pending because browser tooling and an authenticated browser session were unavailable; see `VERIFY.md`.

# Verification

## Latest Run

- Date: 2026-09-30
- Scope: private route access, cache behavior, login shell, and required build gates.
- Runtime: optimized production build served locally using ignored `.env.local`; no deployment.

## Automated Checks

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed; output includes the compiled Next middleware.
- `npm audit` was not rerun in this task; the previous 2026-09-30 acceptance pass reported 0 vulnerabilities.

## HTTP Route Protection

- Without a session, GET `/`, `/projects`, `/projects/00000000-0000-0000-0000-000000000000`, `/issues`, `/contractors`, `/updates`, and `/documents` each returned 307 to `/login?next=<original path>`.
- `/projects?tab=active` preserved its query in `next`; a direct requested project path was preserved.
- Protected redirect responses included `Cache-Control: no-store, no-cache, must-revalidate, private`.
- POST `/api/updates` without a session returned 401 with friendly application text. API handlers still perform explicit Supabase user checks; middleware does not replace write authorization.
- `/login` returned 200 with the existing form and no operational sidebar/menu or “Visitante” label in its HTML. Its response was also no-store.
- The first production run exposed that root `middleware.ts` was ignored while the App Router lives in `src/app`; moving it to `src/middleware.ts` fixed this. The final build lists `ƒ Middleware`.

## Pending Browser Acceptance

- Not exercised in this environment: valid login, login return navigation, refresh session persistence, logout click, browser Back/BFCache, expiry during use, and visual checks at 390 px and desktop.
- `agent-browser` and Chromium are not installed, and no authenticated browser session for the manually provisioned test identity was available. Do not mark these as passed. Existing prior-run login/write/mobile results predate the new private-access behavior and do not cover these checks.

## Security And Scope

- No Supabase RLS changes or database writes were made. RLS remains enabled and no `service_role` key was introduced.
- No credentials, dependencies, deployment, commit, or approved product functionality were changed.

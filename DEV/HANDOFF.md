# Active Handoff

Updated: 2026-09-30 · Active spec: `SPECS/ACTIVE.md` · Verification: `VERIFY.md`

## Snapshot

- Obra.flux is now private at the application layer. `src/middleware.ts` validates the Supabase user and redirects every non-API route (except `/login`) to `/login?next=...`; the active spec records the change from the former public-read visitor model.
- `/login` renders only the existing login form in a clean authentication frame. Authenticated shell identity, local logout, token-expiry navigation, `no-store` headers and BFCache return handling are implemented. Existing API write handlers retain explicit Supabase user checks and anonymous writes return 401.
- Production HTTP verification confirmed 307 redirects with preserved destination for `/`, `/projects`, `/projects/[id]`, `/issues`, `/contractors`, `/updates`, and `/documents`; private redirect responses carry `Cache-Control: no-store, no-cache, must-revalidate, private`. POST `/api/updates` without a session returned 401.
- `npm run lint`, `npm run typecheck`, and `npm run build` passed. No database/RLS change, dependency change, credential change, commit or deployment was made.
- Visual mobile/desktop, browser back/BFCache, valid login, refresh persistence and logout browser flows remain to be exercised: `agent-browser` and Chromium are unavailable in this environment, and no test session is present in the browser.

## Next Step

Middleware and server-side route protection are verified. Resume the pending browser acceptance items in `VERIFY.md` when browser automation and the maestro-provisioned test session are available. Do not commit or deploy until separately requested.

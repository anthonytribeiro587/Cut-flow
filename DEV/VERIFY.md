# Verification

## Latest Run

- Date: 2026-09-30
- Scope: acceptance gate for login, authenticated operational writes, visitor blocking, mobile layout, and security.
- Runtime: optimized production build served locally using ignored `.env.local`; no deployment.

## Automated Checks

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed; all application and API routes compiled.
- `npm audit --audit-level=low` — passed; 0 vulnerabilities.

## Authentication And Browser

- Valid email/password login succeeded using the test identity provisioned manually by the maestro. Return from `/login?next=/issues` went to `/issues`.
- Invalid password showed “E-mail ou senha inválidos. Confira os dados e tente novamente.” and retained the `/issues` return context.
- Reload retained the authenticated state (`Sair` remained visible); logout returned to the dashboard, and another reload showed the visitor state.
- At 390×844, `/login`, dashboard, `/projects/[id]`, stage edit dialog, issue create/edit dialog, and update entry were inspected. Document width stayed at 390 px; both dialogs fit the viewport and scroll internally as needed.
- Browser error output was empty after the authenticated and invalid-login flows. No React runtime, hydration, or Next error was observed. Network showed the expected local API writes: issue POST 201, issue PATCH 200 for edit and resolve, update POST 201, stage PATCH 200 (plus one PATCH 200 to restore the original stage).

## Persistence And Cleanup

- `project_updates`: created a clearly marked fictional update linked to the Canoas project and Civil stage. API returned 201; direct SQL confirmed `project_id`, `stage_id`, body, progress 72, author and timestamp. The update appeared immediately and after refresh. The exact test row was then removed by ID and matching body; final query confirmed zero rows.
- `project_stages`: changed Civil from Em andamento/85%/no note to Aguardando terceiro/86%/a fictional observation. API returned 200; direct SQL confirmed the UPDATE, UI reflected it, and refresh retained it. Restored via the application to Em andamento/85%/no note with its original owner and planned dates. Final query confirmed those values.
- `issues`: created a clearly marked fictional issue (201), edited its description/status (PATCH 200), marked it resolved (PATCH 200), and confirmed the resolved row and timestamp via SQL after refresh. Removed only that exact test ID with matching title and edited description; final query confirmed zero rows.

## Visitor, RLS And Security

- Public `GET /` and `GET /projects` returned 200 before/after login. After logout, POST `/api/updates`, POST `/api/issues`, and PATCH `/api/stages/[id]` each returned 401 with friendly messages; no anonymous write occurred.
- Queried `pg_class.relrowsecurity`: RLS is enabled on `documents`, `issues`, `project_stages`, `project_updates`, `project_vendors`, `projects`, `update_attachments`, and `vendors`.
- Re-read `pg_policies`: `anon` retains SELECT only. Authenticated permissions remain SELECT generally, plus UPDATE on `project_stages`, INSERT/UPDATE on `issues`, and INSERT on `project_updates`; no DELETE policy. No schema or RLS change was made in this pass.
- `.env.local` remains Git-ignored. Source/config scan found no test email/password, `SUPABASE_SERVICE_ROLE_KEY`, or `service_role` reference. Supabase app code references only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. No credential was added to project files, app logs, or `DEV/`.
- No deployment and no commit.

## Remaining Acceptance Gate

- None. The authenticated and visitor acceptance items passed. No E2E test suite or axe run is configured for this repository.

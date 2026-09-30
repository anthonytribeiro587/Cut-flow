-- Keep the public demo read-only and restrict authenticated writes to the
-- operational flows exposed by the application. This changes policies only.

drop policy if exists "authenticated manage projects" on public.projects;
create policy "authenticated read projects" on public.projects
  for select to authenticated using (true);

drop policy if exists "authenticated manage vendors" on public.vendors;
create policy "authenticated read vendors" on public.vendors
  for select to authenticated using (true);

drop policy if exists "authenticated manage project_vendors" on public.project_vendors;
create policy "authenticated read project_vendors" on public.project_vendors
  for select to authenticated using (true);

drop policy if exists "authenticated manage project_stages" on public.project_stages;
create policy "authenticated read project_stages" on public.project_stages
  for select to authenticated using (true);
create policy "authenticated update project_stages" on public.project_stages
  for update to authenticated using (true) with check (true);

drop policy if exists "authenticated manage issues" on public.issues;
create policy "authenticated read issues" on public.issues
  for select to authenticated using (true);
create policy "authenticated insert issues" on public.issues
  for insert to authenticated with check (true);
create policy "authenticated update issues" on public.issues
  for update to authenticated using (true) with check (true);

drop policy if exists "authenticated manage project_updates" on public.project_updates;
create policy "authenticated read project_updates" on public.project_updates
  for select to authenticated using (true);
create policy "authenticated insert project_updates" on public.project_updates
  for insert to authenticated with check (true);

drop policy if exists "authenticated manage update_attachments" on public.update_attachments;
create policy "authenticated read update_attachments" on public.update_attachments
  for select to authenticated using (true);

drop policy if exists "authenticated manage documents" on public.documents;
create policy "authenticated read documents" on public.documents
  for select to authenticated using (true);

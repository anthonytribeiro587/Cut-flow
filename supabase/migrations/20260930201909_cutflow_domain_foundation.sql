-- CutFlow foundation for the existing project. Review DEV/SUPABASE_AUDIT.md first.
-- DESTRUCTIVE: removes only documented Obra.flux objects in public. No DROP ... CASCADE.
-- Remote application authorized after matching the checkpoint in DEV/SUPABASE_AUDIT.md.
drop view if exists public.project_overview;
drop table if exists public.update_attachments;
drop table if exists public.documents;
drop table if exists public.project_updates;
drop table if exists public.issues;
drop table if exists public.project_stages;
drop table if exists public.project_vendors;
drop table if exists public.vendors;
drop table if exists public.projects;

create type public.organization_member_role as enum ('owner','admin','sales','planner','operator');
create type public.quote_status as enum ('draft','sent','approved','rejected','expired','converted');
create type public.order_status as enum ('pending','scheduled','in_production','completed','delivered','cancelled');
create type public.production_operation_status as enum ('pending','scheduled','running','paused','completed','cancelled');
create type public.schedule_entry_status as enum ('scheduled','running','completed','cancelled');
create type public.production_log_event as enum ('start','pause','resume','finish','quantity_update','note');

-- Reuse the existing generic public.set_updated_at() function; preserve its definition.

create table public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) > 0),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade, full_name text, avatar_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.organization_members (
 organization_id uuid not null references public.organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role public.organization_member_role not null default 'operator', created_at timestamptz not null default now(),
 primary key(organization_id,user_id)
);

-- SECURITY DEFINER is limited to authenticated callers, checks auth.uid(), uses a fixed search_path,
-- and is needed to avoid recursive RLS evaluation on organization_members.
create function public.is_organization_member(target_org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select (select auth.uid()) is not null and exists(
   select 1 from public.organization_members m where m.organization_id=target_org and m.user_id=(select auth.uid())
 ) $$;
create function public.has_organization_role(target_org uuid, allowed public.organization_member_role[]) returns boolean
language sql stable security definer set search_path = '' as $$
 select (select auth.uid()) is not null and exists(
   select 1 from public.organization_members m where m.organization_id=target_org and m.user_id=(select auth.uid()) and m.role=any(allowed)
 ) $$;
create function public.bootstrap_organization_owner() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if (select auth.uid()) is not null then
  insert into public.organization_members(organization_id,user_id,role) values(new.id,(select auth.uid()),'owner');
 end if;
 return new;
end $$;
revoke all on function public.is_organization_member(uuid) from public, anon;
revoke all on function public.has_organization_role(uuid,public.organization_member_role[]) from public, anon;
revoke all on function public.bootstrap_organization_owner() from public, anon, authenticated;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_organization_role(uuid,public.organization_member_role[]) to authenticated;
create trigger organizations_bootstrap_owner after insert on public.organizations for each row execute function public.bootstrap_organization_owner();

create function public.ensure_profile_for_member() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,full_name,avatar_url)
 select u.id,nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'avatar_url','')
 from auth.users u where u.id=new.user_id
 on conflict(id) do nothing;
 return new;
end $$;
revoke all on function public.ensure_profile_for_member() from public, anon, authenticated;
create trigger organization_member_ensure_profile after insert on public.organization_members
for each row execute function public.ensure_profile_for_member();

create table public.customers (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 type text not null default 'company' check(type in ('person','company')), legal_name text not null, trade_name text,
 document text, email text, phone text, city text, state text, notes text, active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id)
);
create table public.materials (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, category text, density_kg_m3 numeric(12,3) not null check(density_kg_m3>0),
 price_per_kg numeric(14,4) not null default 0 check(price_per_kg>=0), active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,id), unique(organization_id,name)
);
create table public.material_thicknesses (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 material_id uuid not null, thickness_mm numeric(10,3) not null check(thickness_mm>0), active boolean not null default true,
 created_at timestamptz not null default now(), unique(organization_id,id), unique(organization_id,material_id,thickness_mm), unique(organization_id,material_id,id),
 foreign key(organization_id,material_id) references public.materials(organization_id,id) on delete cascade
);
create table public.processes (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, code text not null, billing_unit text not null default 'hour',
 default_setup_minutes numeric(12,2) not null default 0 check(default_setup_minutes>=0), active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id), unique(organization_id,code)
);
create table public.machines (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, model text, hourly_cost numeric(14,4) not null default 0 check(hourly_cost>=0),
 work_area_width_mm numeric(12,2), work_area_height_mm numeric(12,2),
 daily_capacity_minutes integer not null default 480 check(daily_capacity_minutes>0),
 default_setup_minutes numeric(12,2) not null default 0 check(default_setup_minutes>=0), active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id)
);
create table public.machine_processes (
 organization_id uuid not null references public.organizations(id) on delete cascade, machine_id uuid not null, process_id uuid not null,
 created_at timestamptz not null default now(), primary key(machine_id,process_id),
 foreign key(organization_id,machine_id) references public.machines(organization_id,id) on delete cascade,
 foreign key(organization_id,process_id) references public.processes(organization_id,id) on delete cascade
);
create table public.machine_process_parameters (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 machine_id uuid not null, process_id uuid not null, material_id uuid not null, material_thickness_id uuid not null,
 cut_speed_mm_per_min numeric(14,3) check(cut_speed_mm_per_min>0),
 pierce_time_seconds numeric(12,3) not null default 0 check(pierce_time_seconds>=0),
 setup_minutes numeric(12,2) not null default 0 check(setup_minutes>=0), active boolean not null default true,
 is_demo boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,id), unique(machine_id,process_id,material_thickness_id),
 foreign key(organization_id,machine_id) references public.machines(organization_id,id) on delete cascade,
 foreign key(organization_id,process_id) references public.processes(organization_id,id) on delete cascade,
 foreign key(organization_id,material_id) references public.materials(organization_id,id) on delete cascade,
 foreign key(organization_id,material_thickness_id) references public.material_thicknesses(organization_id,id) on delete cascade,
 foreign key(organization_id,material_id,material_thickness_id) references public.material_thicknesses(organization_id,material_id,id) on delete cascade
);
create table public.quotes (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 customer_id uuid, number text not null, status public.quote_status not null default 'draft', created_by uuid references auth.users(id) on delete set null,
 valid_until date, markup_percent numeric(8,3) not null default 0 check(markup_percent>=0), other_costs numeric(14,2) not null default 0 check(other_costs>=0),
 commercial_notes text, estimated_start_at timestamptz, estimated_finish_at timestamptz, suggested_delivery_date date,
 total_cost numeric(14,2) not null default 0 check(total_cost>=0), selling_price numeric(14,2) not null default 0 check(selling_price>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,id), unique(organization_id,number),
 foreign key(organization_id,customer_id) references public.customers(organization_id,id) on delete set null(customer_id)
);
create table public.quote_items (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 quote_id uuid not null, description text not null, process_id uuid, material_id uuid, material_thickness_id uuid, machine_id uuid,
 length_mm numeric(14,3) not null check(length_mm>0), width_mm numeric(14,3) not null check(width_mm>0),
 quantity integer not null check(quantity>0), additional_cut_length_mm numeric(14,3) not null default 0 check(additional_cut_length_mm>=0),
 calculated_unit_weight_kg numeric(14,5) not null default 0, calculated_total_weight_kg numeric(14,5) not null default 0,
 calculated_cut_length_mm numeric(16,3) not null default 0, calculated_piercings integer not null default 0,
 estimated_machine_minutes numeric(14,3) not null default 0, material_cost numeric(14,2) not null default 0,
 machine_cost numeric(14,2) not null default 0, setup_cost numeric(14,2) not null default 0,
 subtotal numeric(14,2) not null default 0, selling_price numeric(14,2) not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id),
 foreign key(organization_id,quote_id) references public.quotes(organization_id,id) on delete cascade,
 foreign key(organization_id,process_id) references public.processes(organization_id,id) on delete set null(process_id),
 foreign key(organization_id,material_id) references public.materials(organization_id,id) on delete set null(material_id),
 foreign key(organization_id,material_thickness_id) references public.material_thicknesses(organization_id,id) on delete set null(material_thickness_id),
 foreign key(organization_id,material_id,material_thickness_id) references public.material_thicknesses(organization_id,material_id,id) on delete set null(material_thickness_id),
 foreign key(organization_id,machine_id) references public.machines(organization_id,id) on delete set null(machine_id)
);
create table public.quote_item_holes (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, quote_item_id uuid not null,
 diameter_mm numeric(12,3) not null check(diameter_mm>0), quantity integer not null check(quantity>0), created_at timestamptz not null default now(),
 foreign key(organization_id,quote_item_id) references public.quote_items(organization_id,id) on delete cascade
);
create table public.quote_item_operations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, quote_item_id uuid not null,
 process_id uuid not null, machine_id uuid, sequence integer not null check(sequence>0),
 estimated_minutes numeric(14,3) not null default 0 check(estimated_minutes>=0), cost numeric(14,2) not null default 0 check(cost>=0),
 created_at timestamptz not null default now(), foreign key(organization_id,quote_item_id) references public.quote_items(organization_id,id) on delete cascade,
 foreign key(organization_id,process_id) references public.processes(organization_id,id) on delete restrict,
 foreign key(organization_id,machine_id) references public.machines(organization_id,id) on delete set null(machine_id), unique(quote_item_id,sequence)
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 quote_id uuid, customer_id uuid, number text not null, status public.order_status not null default 'pending',
 promised_delivery_date date, estimated_delivery_date date, total numeric(14,2) not null default 0 check(total>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,id), unique(organization_id,number),
 foreign key(organization_id,quote_id) references public.quotes(organization_id,id) on delete set null(quote_id),
 foreign key(organization_id,customer_id) references public.customers(organization_id,id) on delete set null(customer_id)
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, order_id uuid not null, quote_item_id uuid,
 description text not null, quantity integer not null check(quantity>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(organization_id,order_id) references public.orders(organization_id,id) on delete cascade,
 foreign key(organization_id,quote_item_id) references public.quote_items(organization_id,id) on delete set null(quote_item_id)
);
create table public.production_orders (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 order_id uuid not null, number text not null, status text not null default 'pending' check(status in ('pending','scheduled','in_production','completed','cancelled')),
 priority integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,id), unique(organization_id,number),
 foreign key(organization_id,order_id) references public.orders(organization_id,id) on delete cascade
);
create table public.production_operations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 production_order_id uuid not null, process_id uuid not null, machine_id uuid, sequence integer not null check(sequence>0),
 status public.production_operation_status not null default 'pending', quantity integer not null default 1 check(quantity>0),
 estimated_minutes numeric(14,3) not null default 0 check(estimated_minutes>=0), actual_minutes numeric(14,3) check(actual_minutes>=0),
 scheduled_start_at timestamptz, scheduled_end_at timestamptz, started_at timestamptz, finished_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id),
 foreign key(organization_id,production_order_id) references public.production_orders(organization_id,id) on delete cascade,
 foreign key(organization_id,process_id) references public.processes(organization_id,id) on delete restrict,
 foreign key(organization_id,machine_id) references public.machines(organization_id,id) on delete set null(machine_id),
 unique(production_order_id,sequence), check(scheduled_end_at is null or scheduled_start_at is null or scheduled_end_at>=scheduled_start_at)
);
create table public.machine_schedule_entries (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 machine_id uuid not null, production_operation_id uuid not null, starts_at timestamptz not null, ends_at timestamptz not null,
 status public.schedule_entry_status not null default 'scheduled', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(ends_at>starts_at), unique(organization_id,id),
 foreign key(organization_id,machine_id) references public.machines(organization_id,id) on delete cascade,
 foreign key(organization_id,production_operation_id) references public.production_operations(organization_id,id) on delete cascade
);

create function public.prevent_machine_schedule_overlap() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 if (select auth.uid()) is null or not public.is_organization_member(new.organization_id) then
  raise exception 'Organization membership required' using errcode='42501';
 end if;
 if new.status in ('scheduled','running') then
  perform pg_advisory_xact_lock(hashtextextended(new.machine_id::text,0));
  if exists (
   select 1 from public.machine_schedule_entries e
   where e.organization_id=new.organization_id and e.machine_id=new.machine_id
     and e.status in ('scheduled','running') and e.id<>new.id
     and tstzrange(e.starts_at,e.ends_at,'[)') && tstzrange(new.starts_at,new.ends_at,'[)')
  ) then
   raise exception 'Machine schedule interval overlaps an existing entry' using errcode='23P01';
  end if;
 end if;
 return new;
end $$;
revoke all on function public.prevent_machine_schedule_overlap() from public, anon, authenticated;
create trigger machine_schedule_no_overlap before insert or update on public.machine_schedule_entries
for each row execute function public.prevent_machine_schedule_overlap();

create table public.production_logs (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 production_operation_id uuid not null, user_id uuid references auth.users(id) on delete set null, event_type public.production_log_event not null,
 occurred_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
 foreign key(organization_id,production_operation_id) references public.production_operations(organization_id,id) on delete cascade
);
create table public.settings (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null unique references public.organizations(id) on delete cascade,
 commercial_delivery_buffer_business_days integer not null default 1 check(commercial_delivery_buffer_business_days>=0),
 workday_start time not null default '08:00', lunch_start time not null default '12:00', lunch_end time not null default '13:00', workday_end time not null default '17:00',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(workday_start<lunch_start and lunch_start<=lunch_end and lunch_end<workday_end)
);

create function public.create_organization_settings() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.settings(organization_id) values(new.id) on conflict(organization_id) do nothing;
 return new;
end $$;
revoke all on function public.create_organization_settings() from public, anon, authenticated;
create trigger organizations_create_settings after insert on public.organizations
for each row execute function public.create_organization_settings();

create index organization_members_user_idx on public.organization_members(user_id,organization_id);
create index customers_org_active_idx on public.customers(organization_id,active);
create index material_thicknesses_material_idx on public.material_thicknesses(organization_id,material_id,active);
create index machines_org_active_idx on public.machines(organization_id,active);
create index machine_parameters_lookup_idx on public.machine_process_parameters(organization_id,machine_id,process_id,material_id,material_thickness_id) where active;
create index quotes_customer_created_idx on public.quotes(organization_id,customer_id,created_at desc);
create index quote_items_quote_idx on public.quote_items(organization_id,quote_id);
create index quote_item_holes_item_idx on public.quote_item_holes(organization_id,quote_item_id);
create index orders_status_delivery_idx on public.orders(organization_id,status,promised_delivery_date);
create index production_orders_order_idx on public.production_orders(organization_id,order_id);
create index production_operations_queue_idx on public.production_operations(organization_id,status,scheduled_start_at);
create index schedule_machine_time_idx on public.machine_schedule_entries(organization_id,machine_id,starts_at,ends_at) where status in ('scheduled','running');
create index production_logs_operation_time_idx on public.production_logs(organization_id,production_operation_id,occurred_at desc);

do $$ declare t text; begin
 foreach t in array array['organizations','profiles','customers','materials','processes','machines','machine_process_parameters','quotes','quote_items','orders','order_items','production_orders','production_operations','machine_schedule_entries','settings'] loop
  execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',t);
 end loop;
end $$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.customers enable row level security;
alter table public.materials enable row level security;
alter table public.material_thicknesses enable row level security;
alter table public.processes enable row level security;
alter table public.machines enable row level security;
alter table public.machine_processes enable row level security;
alter table public.machine_process_parameters enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_item_holes enable row level security;
alter table public.quote_item_operations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.production_orders enable row level security;
alter table public.production_operations enable row level security;
alter table public.machine_schedule_entries enable row level security;
alter table public.production_logs enable row level security;
alter table public.settings enable row level security;

grant select,insert,update,delete on public.organizations,public.profiles,public.organization_members,public.customers,public.materials,public.material_thicknesses,public.processes,public.machines,public.machine_processes,public.machine_process_parameters,public.quotes,public.quote_items,public.quote_item_holes,public.quote_item_operations,public.orders,public.order_items,public.production_orders,public.production_operations,public.machine_schedule_entries,public.production_logs,public.settings to authenticated;

create policy profiles_select_self on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profiles_select_org_members on public.profiles for select to authenticated
 using(exists(
   select 1 from public.organization_members m
   where m.user_id=profiles.id and public.is_organization_member(m.organization_id)
 ));
create policy profiles_insert_self on public.profiles for insert to authenticated with check(id=(select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy organizations_select_member on public.organizations for select to authenticated using(public.is_organization_member(id));
create policy organizations_insert_authenticated on public.organizations for insert to authenticated with check((select auth.uid()) is not null);
create policy organizations_update_admin on public.organizations for update to authenticated using(public.has_organization_role(id,array['owner','admin']::public.organization_member_role[])) with check(public.has_organization_role(id,array['owner','admin']::public.organization_member_role[]));
create policy organizations_delete_owner on public.organizations for delete to authenticated using(public.has_organization_role(id,array['owner']::public.organization_member_role[]));
create policy members_select_org on public.organization_members for select to authenticated using(public.is_organization_member(organization_id));
create policy members_insert_admin on public.organization_members for insert to authenticated with check(role<>'owner' and public.has_organization_role(organization_id,array['owner','admin']::public.organization_member_role[]));
create policy members_update_admin on public.organization_members for update to authenticated
 using(public.has_organization_role(organization_id,array['owner','admin']::public.organization_member_role[]))
 with check((role<>'owner' or public.has_organization_role(organization_id,array['owner']::public.organization_member_role[]))
   and public.has_organization_role(organization_id,array['owner','admin']::public.organization_member_role[]));
create policy members_delete_admin on public.organization_members for delete to authenticated using(role<>'owner' and public.has_organization_role(organization_id,array['owner','admin']::public.organization_member_role[]));

do $$ declare t text; begin
 foreach t in array array['customers','materials','material_thicknesses','processes','machines','machine_processes','machine_process_parameters','quotes','quote_items','quote_item_holes','quote_item_operations','orders','order_items','production_orders','production_operations','machine_schedule_entries','production_logs','settings'] loop
  execute format('create policy %I on public.%I for all to authenticated using(public.is_organization_member(organization_id)) with check(public.is_organization_member(organization_id))',t||'_org_member_all',t);
 end loop;
end $$;

comment on column public.machine_process_parameters.is_demo is 'True indicates illustrative seed data, not official technical parameters.';
comment on function public.is_organization_member(uuid) is 'RLS helper with fixed search_path and auth.uid() validation.';

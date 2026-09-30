-- Development/demo seed only. Run after the structural migration in a non-production environment.
-- Illustrative cutting speeds and piercing times are DEMONSTRATION values, not technical specifications.
-- Membership is intentionally not created: associate a deliberately chosen authenticated user separately.
begin;

insert into public.organizations(id,name,slug)
values('c0f10a00-0000-4000-8000-000000000001','Metalúrgica Horizonte','metalurgica-horizonte')
on conflict(id) do update set name=excluded.name, slug=excluded.slug;

insert into public.settings(organization_id)
values('c0f10a00-0000-4000-8000-000000000001')
on conflict(organization_id) do nothing;

insert into public.materials(id,organization_id,name,category,density_kg_m3,price_per_kg)
values
 ('c0f10a00-0000-4000-8000-000000000101','c0f10a00-0000-4000-8000-000000000001','Aço SAE 1020','steel',7850,11.90),
 ('c0f10a00-0000-4000-8000-000000000102','c0f10a00-0000-4000-8000-000000000001','Aço SAE 1045','steel',7850,12.50),
 ('c0f10a00-0000-4000-8000-000000000103','c0f10a00-0000-4000-8000-000000000001','Aço Inox 304','stainless_steel',7930,28.00),
 ('c0f10a00-0000-4000-8000-000000000104','c0f10a00-0000-4000-8000-000000000001','Alumínio 5052','aluminum',2680,22.00)
on conflict(id) do update set name=excluded.name, category=excluded.category,
 density_kg_m3=excluded.density_kg_m3, price_per_kg=excluded.price_per_kg;

-- Espessuras escolhidas por família. A lista não é copiada igualmente para todos os materiais.
with choices(material_id, thickness_mm) as (values
 ('c0f10a00-0000-4000-8000-000000000101'::uuid,1.5),('c0f10a00-0000-4000-8000-000000000101',2),('c0f10a00-0000-4000-8000-000000000101',3),('c0f10a00-0000-4000-8000-000000000101',4.75),('c0f10a00-0000-4000-8000-000000000101',6),('c0f10a00-0000-4000-8000-000000000101',8),('c0f10a00-0000-4000-8000-000000000101',10),('c0f10a00-0000-4000-8000-000000000101',12.7),
 ('c0f10a00-0000-4000-8000-000000000102',3),('c0f10a00-0000-4000-8000-000000000102',4.75),('c0f10a00-0000-4000-8000-000000000102',6),('c0f10a00-0000-4000-8000-000000000102',8),('c0f10a00-0000-4000-8000-000000000102',10),('c0f10a00-0000-4000-8000-000000000102',12.7),
 ('c0f10a00-0000-4000-8000-000000000103',1.5),('c0f10a00-0000-4000-8000-000000000103',2),('c0f10a00-0000-4000-8000-000000000103',3),('c0f10a00-0000-4000-8000-000000000103',4.75),('c0f10a00-0000-4000-8000-000000000103',6),('c0f10a00-0000-4000-8000-000000000103',8),('c0f10a00-0000-4000-8000-000000000103',10),('c0f10a00-0000-4000-8000-000000000103',12.7),
 ('c0f10a00-0000-4000-8000-000000000104',1.5),('c0f10a00-0000-4000-8000-000000000104',2),('c0f10a00-0000-4000-8000-000000000104',3),('c0f10a00-0000-4000-8000-000000000104',4.75),('c0f10a00-0000-4000-8000-000000000104',6),('c0f10a00-0000-4000-8000-000000000104',8),('c0f10a00-0000-4000-8000-000000000104',10)
)
insert into public.material_thicknesses(organization_id,material_id,thickness_mm)
select 'c0f10a00-0000-4000-8000-000000000001',material_id,thickness_mm from choices
on conflict(organization_id,material_id,thickness_mm) do update set active=true;

insert into public.processes(id,organization_id,name,code,billing_unit,default_setup_minutes)
values
 ('c0f10a00-0000-4000-8000-000000000201','c0f10a00-0000-4000-8000-000000000001','Corte laser','laser_cut','minute',0),
 ('c0f10a00-0000-4000-8000-000000000202','c0f10a00-0000-4000-8000-000000000001','Dobra','bending','hour',0),
 ('c0f10a00-0000-4000-8000-000000000203','c0f10a00-0000-4000-8000-000000000001','Solda MIG','mig_welding','hour',0),
 ('c0f10a00-0000-4000-8000-000000000204','c0f10a00-0000-4000-8000-000000000001','Pintura','painting','hour',0),
 ('c0f10a00-0000-4000-8000-000000000205','c0f10a00-0000-4000-8000-000000000001','Acabamento','finishing','hour',0)
on conflict(id) do update set name=excluded.name, code=excluded.code, billing_unit=excluded.billing_unit;

insert into public.machines(id,organization_id,name,model,hourly_cost,work_area_width_mm,work_area_height_mm,daily_capacity_minutes)
values
 ('c0f10a00-0000-4000-8000-000000000301','c0f10a00-0000-4000-8000-000000000001','Laser 01','Trumpf TruLaser 3030',120,3000,1500,480),
 ('c0f10a00-0000-4000-8000-000000000302','c0f10a00-0000-4000-8000-000000000001','Laser 02','Bystronic ByStar 4020',150,4000,2000,480),
 ('c0f10a00-0000-4000-8000-000000000303','c0f10a00-0000-4000-8000-000000000001','Laser 03','HSG 3015',110,3000,1500,480)
on conflict(id) do update set name=excluded.name, model=excluded.model, hourly_cost=excluded.hourly_cost,
 work_area_width_mm=excluded.work_area_width_mm, work_area_height_mm=excluded.work_area_height_mm, daily_capacity_minutes=excluded.daily_capacity_minutes;

insert into public.machine_processes(organization_id,machine_id,process_id)
select 'c0f10a00-0000-4000-8000-000000000001',m.id,'c0f10a00-0000-4000-8000-000000000201'
from public.machines m where m.id in ('c0f10a00-0000-4000-8000-000000000301','c0f10a00-0000-4000-8000-000000000302','c0f10a00-0000-4000-8000-000000000303')
on conflict(machine_id,process_id) do nothing;

-- DEMONSTRAÇÃO: valores fictícios para validar fluxo de tela/cálculo, sem validade técnica de corte.
insert into public.machine_process_parameters(organization_id,machine_id,process_id,material_id,material_thickness_id,cut_speed_mm_per_min,pierce_time_seconds,setup_minutes,is_demo)
select 'c0f10a00-0000-4000-8000-000000000001',mach.id,'c0f10a00-0000-4000-8000-000000000201',mat.id,th.id,
 case mat.name when 'Aço Inox 304' then 900 when 'Alumínio 5052' then 1800 when 'Aço SAE 1045' then 800 else 1000 end,
 1.5,5,true
from public.machines mach
join public.materials mat on mat.organization_id=mach.organization_id
join public.material_thicknesses th on th.organization_id=mat.organization_id and th.material_id=mat.id and th.thickness_mm in (1.5,2,3,4.75,6)
where mach.organization_id='c0f10a00-0000-4000-8000-000000000001'
on conflict(machine_id,process_id,material_thickness_id) do update set
 cut_speed_mm_per_min=excluded.cut_speed_mm_per_min,pierce_time_seconds=excluded.pierce_time_seconds,
 setup_minutes=excluded.setup_minutes,is_demo=true,active=true;

commit;

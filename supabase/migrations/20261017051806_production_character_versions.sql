begin;
create table public.production_character_versions (
 id uuid primary key default gen_random_uuid(),
 project_id text not null references public.projects(id),
 name text not null check(length(name) between 1 and 80),
 reference_path text not null,
 attributes jsonb not null check(jsonb_array_length(attributes) between 1 and 12),
 created_at timestamptz not null default now()
);
create index production_character_versions_project_idx on public.production_character_versions(project_id,created_at desc);
alter table public.production_character_versions enable row level security;
revoke all on public.production_character_versions from anon,authenticated;
grant all on public.production_character_versions to service_role;
alter table public.production_settings add column character_version_id uuid references public.production_character_versions(id);
create function public.save_production_character(p_project_id text,p_owner_hash text,p_name text,p_reference_path text,p_attributes jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare version_id uuid; begin
 perform 1 from public.production_settings where project_id=p_project_id and owner_hash=p_owner_hash for update;
 if not found then return false; end if;
 insert into public.production_character_versions(project_id,name,reference_path,attributes)
 values(p_project_id,p_name,p_reference_path,p_attributes) returning id into version_id;
 update public.production_settings set character_version_id=version_id,reference_path=p_reference_path
 where project_id=p_project_id and owner_hash=p_owner_hash;
 return true;
end; $$;
revoke all on function public.save_production_character(text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.save_production_character(text,text,text,text,jsonb) to service_role;
commit;

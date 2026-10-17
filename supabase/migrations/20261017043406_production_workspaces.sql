begin;
create table public.production_settings (
 project_id text primary key references public.projects(id) on delete cascade,
 owner_hash text not null check(length(owner_hash)=64),
 scene_prompts jsonb not null check(jsonb_array_length(scene_prompts)=6),
 reference_path text not null,
 generation_started_at timestamptz,
 generation_count integer not null default 0,
 created_at timestamptz not null default now()
);
create index production_settings_owner_idx on public.production_settings(owner_hash,created_at desc);
create table public.production_limits (
 bucket text primary key,
 attempts integer not null default 1 check(attempts>0)
);
alter table public.production_settings enable row level security;
alter table public.production_limits enable row level security;
revoke all on public.production_settings,public.production_limits from anon,authenticated;
grant all on public.production_settings,public.production_limits to service_role;
create function public.claim_production_slot(p_bucket text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer; begin
 insert into public.production_limits(bucket) values(p_bucket)
 on conflict(bucket) do update set attempts=public.production_limits.attempts+1
 returning attempts into n;
 return n<=6;
end; $$;
create function public.create_production(p_project jsonb,p_owner_hash text,p_scenes jsonb,p_reference_path text)
returns void language plpgsql security invoker set search_path='' as $$
begin
 perform public.seed_project(p_project,'[]'::jsonb);
 insert into public.production_settings(project_id,owner_hash,scene_prompts,reference_path)
 values(p_project->>'id',p_owner_hash,p_scenes,p_reference_path);
end; $$;
create function public.claim_production_generation(p_project_id text,p_owner_hash text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare claimed text; begin
 update public.production_settings set generation_started_at=now(),generation_count=generation_count+1
 where project_id=p_project_id and owner_hash=p_owner_hash and generation_count<3
 and (generation_started_at is null or generation_started_at<now()-interval '6 minutes')
 returning project_id into claimed;
 return claimed is not null;
end; $$;
revoke all on function public.claim_production_slot(text),public.create_production(jsonb,text,jsonb,text),public.claim_production_generation(text,text) from public,anon,authenticated;
grant execute on function public.claim_production_slot(text),public.create_production(jsonb,text,jsonb,text),public.claim_production_generation(text,text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('references','references',false,4194304,array['image/png','image/jpeg','image/webp'])
on conflict(id) do nothing;
commit;

-- Canon's Data API is server-only. Never ship the service_role key to a browser.
begin;

create table public.projects (
  id text primary key check (length(id) between 1 and 200),
  name text not null check (length(name) between 1 and 200)
);
create table public.characters (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  name text not null,
  reference_image_url text not null,
  position integer not null default 0,
  unique (id, project_id)
);
create index characters_project_idx on public.characters(project_id, position);
create table public.attributes (
  character_id text not null references public.characters(id) on delete cascade,
  key text not null,
  label text not null,
  expected text not null,
  weight double precision not null check (weight > 0 and weight < 'Infinity'::float8),
  position integer not null default 0,
  primary key (character_id, key)
);
create table public.rules (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  text text not null check (length(text) between 1 and 2000),
  attribute_key text,
  source text not null check (source in ('rejection', 'correction', 'seed')),
  created_at timestamptz not null default now(),
  times_applied integer not null default 0 check (times_applied >= 0)
);
create index rules_project_idx on public.rules(project_id, times_applied desc, created_at desc);
create table public.batches (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  index integer not null check (index > 0),
  rules_applied text[] not null default '{}',
  drift_rate double precision not null check (drift_rate between 0 and 1),
  created_at timestamptz not null default now(),
  unique (project_id, index),
  unique (id, project_id)
);
create table public.shots (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  batch_id text not null,
  scene_prompt text not null,
  final_prompt text not null,
  image_url text not null,
  drift_score double precision not null check (drift_score between 0 and 1),
  flagged boolean not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  reject_reason text,
  foreign key (batch_id, project_id) references public.batches(id, project_id) on delete cascade,
  unique (id, project_id)
);
create index shots_project_idx on public.shots(project_id);
create index shots_batch_idx on public.shots(batch_id, project_id);
create table public.attribute_checks (
  shot_id text not null references public.shots(id) on delete cascade,
  key text not null,
  expected text not null,
  observed text not null,
  pass boolean not null,
  confidence double precision not null check (confidence between 0 and 1),
  note text,
  position integer not null default 0,
  primary key (shot_id, key)
);
create table public.traces (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  shot_id text,
  type text not null check (type in ('generate', 'check', 'flag', 'rule_learned', 'rule_applied', 'error')),
  category text check (category in ('attribute_drift', 'identity_drift', 'style_drift', 'prompt_ignored', 'api_error')),
  message text not null,
  created_at timestamptz not null default now(),
  foreign key (shot_id, project_id) references public.shots(id, project_id) on delete cascade
);
create index traces_project_idx on public.traces(project_id, created_at);
create index traces_shot_idx on public.traces(shot_id, project_id);

-- Increment usage atomically; only the server role can execute this function.
create function public.increment_rule_usage(p_project_id text, p_rule_ids text[])
returns void language sql security invoker set search_path = '' as $$
  update public.rules set times_applied = times_applied + 1
  where project_id = p_project_id and id = any(p_rule_ids);
$$;
revoke all on function public.increment_rule_usage(text, text[]) from public, anon, authenticated;
grant execute on function public.increment_rule_usage(text, text[]) to service_role;

-- RLS is enabled with no public policies: reads and writes pass through Next.js.
do $$ declare t text; begin
  foreach t in array array['projects','characters','attributes','rules','batches','shots','attribute_checks','traces'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

-- Public image URLs are intentional. Upload/update/delete still require the server key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shots', 'shots', true, 20971520, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
commit;

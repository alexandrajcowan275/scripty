begin;
-- Preserve the original pessimistic ledger. Baseline is founder-reported billing,
-- not a claim that the old reservation total was an invoice.
create table public.api_budget_v2 (
 id text primary key default 'scripty' check(id='scripty'),
 baseline_usd numeric(12,6) not null default 2.05,
 baseline_source text not null default 'Founder-reported OpenAI dashboard, 2026-10-17',
 limit_usd numeric(12,6) not null default 40 check(limit_usd=40),
 spent_usd numeric(12,6) not null default 0 check(spent_usd>=0),
 held_usd numeric(12,6) not null default 0 check(held_usd>=0),
 updated_at timestamptz not null default now()
);
insert into public.api_budget_v2(id) values('scripty');
create table public.api_attempts (
 id text primary key, scope text not null check(scope in ('production','verification')),
 reserved_usd numeric(12,6) not null check(reserved_usd>0 and reserved_usd<=10),
 cost_usd numeric(12,6), model text, usage jsonb,
 created_at timestamptz not null default now(), settled_at timestamptz,
 check(cost_usd is null or cost_usd>=0)
);
create function public.reserve_api_attempt(p_id text,p_amount numeric,p_scope text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare b public.api_budget_v2; old public.api_attempts; test_total numeric; begin
 if p_amount is null or p_amount<=0 or p_amount>10 or p_amount='NaN'::numeric or p_scope not in ('production','verification') then raise exception 'Invalid reservation'; end if;
 select * into b from public.api_budget_v2 where id='scripty' for update;
 select * into old from public.api_attempts where id=p_id;
 if found then
  if old.reserved_usd<>p_amount or old.scope<>p_scope then raise exception 'Reservation conflict'; end if;
  return true;
 end if;
 if b.baseline_usd+b.spent_usd+b.held_usd+p_amount>b.limit_usd then return false; end if;
 if p_scope='verification' then
  select coalesce(sum(coalesce(cost_usd,reserved_usd)),0) into test_total from public.api_attempts where scope='verification';
  if test_total+p_amount>6 then return false; end if;
 end if;
 insert into public.api_attempts(id,scope,reserved_usd) values(p_id,p_scope,p_amount);
 update public.api_budget_v2 set held_usd=held_usd+p_amount,updated_at=now() where id='scripty';
 return true;
end; $$;
create function public.settle_api_attempt(p_id text,p_cost numeric,p_model text,p_usage jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare a public.api_attempts; begin
 if p_cost is null or p_cost<0 or p_cost>10 or p_cost='NaN'::numeric then raise exception 'Invalid usage cost'; end if;
 perform id from public.api_budget_v2 where id='scripty' for update;
 select * into a from public.api_attempts where id=p_id for update;
 if not found then raise exception 'Unknown reservation'; end if;
 if a.settled_at is not null then return; end if;
 update public.api_attempts set cost_usd=p_cost,model=p_model,usage=p_usage,settled_at=now() where id=p_id;
 update public.api_budget_v2 set held_usd=greatest(0,held_usd-a.reserved_usd),spent_usd=spent_usd+p_cost,updated_at=now() where id='scripty';
end; $$;
-- Fresh checks are append-only and do not replace any original shot or batch rate.
create table public.monitor_runs (
 id uuid primary key default gen_random_uuid(), project_id text not null references public.projects(id),
 shot_id text not null, owner_hash text not null check(length(owner_hash)=64),
 checks jsonb not null, flagged boolean not null, drift_score float8 not null,
 rule_ids jsonb not null, model text not null, version text not null,
 created_at timestamptz not null default now()
);
create index monitor_runs_owner_project_idx on public.monitor_runs(owner_hash,project_id,created_at desc);
-- Labels are immutable submissions: changing a judgment appends another version.
-- prediction is frozen when the blind card was presented, not recomputed later.
create table public.human_labels (
 id uuid primary key default gen_random_uuid(), project_id text not null references public.projects(id),
 shot_id text not null, attribute_key text not null, owner_hash text not null check(length(owner_hash)=64),
 true_pass boolean, prediction jsonb, source text not null default 'human_blind' check(source='human_blind'),
 note text not null default '' check(length(note)<=400), created_at timestamptz not null default now()
);
create index human_labels_owner_project_idx on public.human_labels(owner_hash,project_id,created_at desc);
create table public.shot_repairs (
 shot_id text primary key references public.shots(id), source_shot_id text not null,
 owner_hash text not null check(length(owner_hash)=64),
 project_id text not null references public.projects(id), created_at timestamptz not null default now()
);
alter table public.api_budget_v2 enable row level security;
alter table public.api_attempts enable row level security;
alter table public.monitor_runs enable row level security;
alter table public.human_labels enable row level security;
alter table public.shot_repairs enable row level security;
revoke all on public.api_budget_v2,public.api_attempts,public.monitor_runs,public.human_labels,public.shot_repairs from public,anon,authenticated;
grant select on public.api_budget_v2,public.api_attempts to service_role;
grant update on public.api_budget_v2,public.api_attempts to service_role;
grant insert on public.api_attempts to service_role;
grant select,insert on public.monitor_runs,public.human_labels,public.shot_repairs to service_role;
revoke all on function public.reserve_api_attempt(text,numeric,text),public.settle_api_attempt(text,numeric,text,jsonb) from public,anon,authenticated;
grant execute on function public.reserve_api_attempt(text,numeric,text),public.settle_api_attempt(text,numeric,text,jsonb) to service_role;
-- Serialize memory writes per project. Dedupe exact normalized outputs even if
-- simultaneous extraction calls both saw the previous memory snapshot.
create function public.save_memory_rule(p_rule jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare match_id text; saved public.rules; begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_rule->>'projectId',0));
 select id into match_id from public.rules where project_id=p_rule->>'projectId'
 and (id=p_rule->>'id' or (regexp_replace(lower(text),'[^a-z0-9]+','','g')=regexp_replace(lower(p_rule->>'text'),'[^a-z0-9]+','','g')
 and (attribute_key is null or p_rule->>'attributeKey' is null or attribute_key=p_rule->>'attributeKey')))
 order by (id=p_rule->>'id') desc limit 1;
 if match_id is null then match_id:=p_rule->>'id'; end if;
 insert into public.rules(id,project_id,text,attribute_key,source,created_at,times_applied)
 values(match_id,p_rule->>'projectId',p_rule->>'text',p_rule->>'attributeKey',p_rule->>'source',(p_rule->>'createdAt')::timestamptz,(p_rule->>'timesApplied')::integer)
 on conflict(id) do update set text=excluded.text,attribute_key=coalesce(excluded.attribute_key,rules.attribute_key),source=excluded.source,created_at=excluded.created_at,times_applied=greatest(rules.times_applied,excluded.times_applied)
 where rules.project_id=excluded.project_id returning * into saved;
 if saved.id is null then raise exception 'Rule belongs to another production'; end if;
 return jsonb_build_object('id',saved.id,'projectId',saved.project_id,'text',saved.text,'attributeKey',saved.attribute_key,'source',saved.source,'createdAt',saved.created_at,'timesApplied',saved.times_applied);
end; $$;
revoke all on function public.save_memory_rule(jsonb) from public,anon,authenticated;
grant execute on function public.save_memory_rule(jsonb) to service_role;
commit;

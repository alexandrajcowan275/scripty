begin;
create table public.api_budget_reconciliations (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 baseline_usd numeric(12,6) not null, source text not null, previous_ledger jsonb not null
);
alter table public.api_budget_reconciliations enable row level security;
revoke all on public.api_budget_reconciliations from public,anon,authenticated;
grant select on public.api_budget_reconciliations to service_role;
alter table public.api_attempts add column included_in_baseline boolean not null default false;
alter table public.api_attempts add column released_at timestamptz;
alter table public.api_attempts drop constraint api_attempts_scope_check;
alter table public.api_attempts add constraint api_attempts_scope_check check(scope in ('production','verification','ab_test'));
alter table public.api_budget_v2 drop constraint api_budget_v2_limit_usd_check;
insert into public.api_budget_reconciliations(baseline_usd,source,previous_ledger)
 select 2.23,'Founder-reported OpenAI dashboard baseline; credit balance $32.29; 2026-10-17',to_jsonb(b) from public.api_budget_v2 b;
update public.api_attempts set included_in_baseline=true where settled_at is not null;
update public.api_attempts set released_at=now() where settled_at is null and released_at is null and created_at<now()-interval '30 minutes';
update public.api_budget_v2 set baseline_usd=2.23,baseline_source='Founder-reported OpenAI dashboard, 2026-10-17; reconciliation receipts retained',limit_usd=30,spent_usd=0,held_usd=(select coalesce(sum(reserved_usd),0) from public.api_attempts where settled_at is null and released_at is null),updated_at=now() where id='scripty';
alter table public.api_budget_v2 add constraint api_budget_v2_limit_usd_check check(limit_usd=30);
create or replace function public.reserve_api_attempt(p_id text,p_amount numeric,p_scope text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare b public.api_budget_v2; old public.api_attempts; test_total numeric; expired numeric; begin
 if p_amount is null or p_amount<=0 or p_amount>10 or p_amount='NaN'::numeric or p_scope not in ('production','verification','ab_test') then raise exception 'Invalid reservation'; end if;
 select * into b from public.api_budget_v2 where id='scripty' for update;
 with released as (update public.api_attempts set released_at=now() where settled_at is null and released_at is null and created_at<now()-interval '30 minutes' returning reserved_usd)
 select coalesce(sum(reserved_usd),0) into expired from released;
 if expired>0 then update public.api_budget_v2 set held_usd=greatest(0,held_usd-expired),updated_at=now() where id='scripty' returning * into b; end if;
 select * into old from public.api_attempts where id=p_id;
 if found then
  if old.reserved_usd<>p_amount or old.scope<>p_scope then raise exception 'Reservation conflict'; end if;
  return old.released_at is null;
 end if;
 if b.baseline_usd+b.spent_usd+b.held_usd+p_amount>b.limit_usd then return false; end if;
 if p_scope in ('verification','ab_test') then
  select coalesce(sum(coalesce(cost_usd,case when released_at is null then reserved_usd else 0 end)),0) into test_total from public.api_attempts where scope in ('verification','ab_test');
  if test_total+p_amount>12 then return false; end if;
 end if;
 if p_scope='ab_test' then
  select coalesce(sum(coalesce(cost_usd,case when released_at is null then reserved_usd else 0 end)),0) into test_total from public.api_attempts where scope='ab_test';
  if test_total+p_amount>3 then return false; end if;
 end if;
 insert into public.api_attempts(id,scope,reserved_usd) values(p_id,p_scope,p_amount);
 update public.api_budget_v2 set held_usd=held_usd+p_amount,updated_at=now() where id='scripty';
 return true;
end; $$;
create or replace function public.settle_api_attempt(p_id text,p_cost numeric,p_model text,p_usage jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare a public.api_attempts; begin
 if p_cost is null or p_cost<0 or p_cost>10 or p_cost='NaN'::numeric then raise exception 'Invalid usage cost'; end if;
 perform id from public.api_budget_v2 where id='scripty' for update;
 select * into a from public.api_attempts where id=p_id for update;
 if not found then raise exception 'Unknown reservation'; end if;
 if a.settled_at is not null then return; end if;
 update public.api_attempts set cost_usd=p_cost,model=p_model,usage=p_usage,settled_at=now() where id=p_id;
 update public.api_budget_v2 set held_usd=greatest(0,held_usd-case when a.released_at is null then a.reserved_usd else 0 end),spent_usd=spent_usd+case when a.included_in_baseline then 0 else p_cost end,updated_at=now() where id='scripty';
end; $$;
commit;

begin;
-- Pessimistic reservations survive serverless restarts and concurrent requests.
-- The cap is fixed in SQL; callers cannot raise it. Failed AI requests do not refund.
create table public.api_budget (
  id text primary key check (id = 'canon-demo'),
  reserved_usd numeric(10,4) not null default 0 check (reserved_usd between 0 and 24),
  updated_at timestamptz not null default now()
);
insert into public.api_budget(id) values ('canon-demo');
create table public.api_budget_reservations (
  reservation_id text primary key check (length(reservation_id) between 1 and 200),
  amount_usd numeric(10,4) not null check (amount_usd > 0 and amount_usd <= 24),
  created_at timestamptz not null default now()
);
alter table public.api_budget enable row level security;
alter table public.api_budget_reservations enable row level security;
revoke all on public.api_budget, public.api_budget_reservations from anon, authenticated;
grant select on public.api_budget, public.api_budget_reservations to service_role;
grant update (reserved_usd, updated_at) on public.api_budget to service_role;
grant insert on public.api_budget_reservations to service_role;

-- A repeated reservation ID is safe for retrying an ambiguous DB request. Every
-- distinct paid AI attempt (including AI retries) must use a distinct ID.
create function public.reserve_api_budget(p_amount numeric, p_reservation_id text default gen_random_uuid()::text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare existing_amount numeric;
begin
  if p_amount is null or p_amount <= 0 or p_amount > 24 or p_amount = 'NaN'::numeric then
    raise exception 'Reservation must be a finite positive amount no greater than 24 USD';
  end if;
  if p_reservation_id is null or length(p_reservation_id) not between 1 and 200 then
    raise exception 'Reservation ID must contain 1 to 200 characters';
  end if;
  p_amount := ceil(p_amount * 10000) / 10000;
  -- Serialize ledger and counter changes, including duplicate reservation IDs.
  perform id from public.api_budget where id = 'canon-demo' for update;
  select amount_usd into existing_amount from public.api_budget_reservations where reservation_id = p_reservation_id;
  if found then
    if existing_amount <> p_amount then raise exception 'Reservation ID was already used for a different amount'; end if;
    return true;
  end if;
  update public.api_budget
  set reserved_usd = reserved_usd + p_amount, updated_at = now()
  where id = 'canon-demo' and reserved_usd + p_amount <= 24;
  if not found then return false; end if;
  insert into public.api_budget_reservations(reservation_id,amount_usd) values(p_reservation_id,p_amount);
  return true;
end;
$$;
revoke all on function public.reserve_api_budget(numeric,text) from public, anon, authenticated;
grant execute on function public.reserve_api_budget(numeric,text) to service_role;
commit;

begin;
-- Reads/preflight must expire old holds too; otherwise they could reject a
-- request before reserve_api_attempt gets a chance to release the old hold.
create function public.release_stale_api_holds() returns numeric
language plpgsql security invoker set search_path='' as $$
declare expired numeric; begin
 perform id from public.api_budget_v2 where id='scripty' for update;
 with released as (
  update public.api_attempts set released_at=now()
  where settled_at is null and released_at is null and created_at<now()-interval '30 minutes'
  returning reserved_usd
 ) select coalesce(sum(reserved_usd),0) into expired from released;
 if expired>0 then update public.api_budget_v2 set held_usd=greatest(0,held_usd-expired),updated_at=now() where id='scripty'; end if;
 return expired;
end; $$;
revoke all on function public.release_stale_api_holds() from public,anon,authenticated;
grant execute on function public.release_stale_api_holds() to service_role;
commit;

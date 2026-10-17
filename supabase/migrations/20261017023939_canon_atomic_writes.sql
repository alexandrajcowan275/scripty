begin;
-- A shot and its checks are committed together. On conflict a generation save never
-- resets a creator's review, which could have arrived while monitoring completed.
create function public.save_shot(p_shot jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.shots(id, project_id, batch_id, scene_prompt, final_prompt, image_url, drift_score, flagged, status, reject_reason)
  values(p_shot->>'id', p_shot->>'projectId', p_shot->>'batchId', p_shot->>'scenePrompt', p_shot->>'finalPrompt', p_shot->>'imageUrl', (p_shot->>'driftScore')::float8, (p_shot->>'flagged')::boolean, p_shot->>'status', p_shot->>'rejectReason')
  on conflict(id) do update set scene_prompt = excluded.scene_prompt,
    final_prompt = excluded.final_prompt, image_url = excluded.image_url,
    drift_score = excluded.drift_score, flagged = excluded.flagged
  where shots.project_id = excluded.project_id and shots.batch_id = excluded.batch_id;
  if not found then raise exception 'Shot ID is already assigned to a different project or batch'; end if;
  delete from public.attribute_checks where shot_id = p_shot->>'id';
  insert into public.attribute_checks(shot_id, key, expected, observed, pass, confidence, note, position)
  select p_shot->>'id', item->>'key', item->>'expected', item->>'observed',
    (item->>'pass')::boolean, (item->>'confidence')::float8, item->>'note', ordinal::integer
  from jsonb_array_elements(p_shot->'checks') with ordinality as entry(item, ordinal);
end;
$$;
revoke all on function public.save_shot(jsonb) from public, anon, authenticated;
grant execute on function public.save_shot(jsonb) to service_role;

create function public.seed_project(p_project jsonb, p_rules jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare c jsonb; a jsonb; r jsonb; cpos integer := 0; apos integer;
begin
  insert into public.projects(id,name) values(p_project->>'id',p_project->>'name')
    on conflict(id) do update set name = excluded.name;
  for c in select value from jsonb_array_elements(p_project->'characters') loop
    insert into public.characters(id,project_id,name,reference_image_url,position)
    values(c->>'id',p_project->>'id',c->>'name',c->>'referenceImageUrl',cpos)
    on conflict(id) do update set name=excluded.name, reference_image_url=excluded.reference_image_url,position=excluded.position
    where characters.project_id = excluded.project_id;
    if not found then raise exception 'Character ID belongs to another project'; end if;
    delete from public.attributes where character_id = c->>'id';
    apos := 0;
    for a in select value from jsonb_array_elements(c->'attributes') loop
      insert into public.attributes(character_id,key,label,expected,weight,position)
      values(c->>'id',a->>'key',a->>'label',a->>'expected',(a->>'weight')::float8,apos);
      apos := apos+1;
    end loop;
    cpos := cpos+1;
  end loop;
  for r in select value from jsonb_array_elements(p_rules) loop
    if r->>'projectId' <> p_project->>'id' then raise exception 'Rule belongs to another project'; end if;
    insert into public.rules(id,project_id,text,attribute_key,source,created_at,times_applied)
    values(r->>'id',r->>'projectId',r->>'text',r->>'attributeKey',r->>'source',(r->>'createdAt')::timestamptz,(r->>'timesApplied')::integer)
    on conflict(id) do nothing;
  end loop;
end;
$$;
revoke all on function public.seed_project(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.seed_project(jsonb,jsonb) to service_role;
commit;

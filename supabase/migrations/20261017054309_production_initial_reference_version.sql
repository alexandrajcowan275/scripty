begin;
create or replace function public.create_production(p_project jsonb,p_owner_hash text,p_scenes jsonb,p_reference_path text)
returns void language plpgsql security invoker set search_path='' as $$
begin
 perform public.seed_project(p_project,'[]'::jsonb);
 insert into public.production_settings(project_id,owner_hash,scene_prompts,reference_path)
 values(p_project->>'id',p_owner_hash,p_scenes,p_reference_path);
 perform public.save_production_character(p_project->>'id',p_owner_hash,p_project->'characters'->0->>'name',p_reference_path,p_project->'characters'->0->'attributes');
end; $$;
-- Preserve initial canon/reference versions for existing untouched productions too.
do $$ declare row record; begin
 for row in select settings.project_id,settings.owner_hash,settings.reference_path,character.name,
 (select jsonb_agg(jsonb_build_object('key',attribute.key,'label',attribute.label,'expected',attribute.expected,'weight',attribute.weight) order by attribute.position)
  from public.attributes attribute where attribute.character_id=character.id) as canon
 from public.production_settings settings join public.characters character on character.project_id=settings.project_id
 where settings.character_version_id is null and character.position=0
 loop
  perform public.save_production_character(row.project_id,row.owner_hash,row.name,row.reference_path,row.canon);
 end loop;
end $$;
revoke all on function public.create_production(jsonb,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.create_production(jsonb,text,jsonb,text) to service_role;
commit;

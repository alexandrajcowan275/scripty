begin;
-- Validation change only: no rows, historical canon or scenes are removed.
alter table public.production_settings drop constraint production_settings_scene_prompts_check;
alter table public.production_settings add constraint production_settings_scene_prompts_check
 check(jsonb_typeof(scene_prompts)='array' and jsonb_array_length(scene_prompts) between 1 and 6);
commit;

-- Scene Prompt Template Seed
-- Project: Eternal Rift
-- Purpose: Adds or updates the Google Flow Scene Prompt template for Scene Prompt Builder MVP.
-- Notes:
-- - This file is designed to be safely re-runnable via upsert.
-- - Run this after supabase/seed.sql if the main seed has already been applied.

insert into public.prompt_templates (
  id,
  project_id,
  name,
  target_tool,
  template_type,
  template_body,
  variables,
  description,
  is_global,
  metadata
)
values (
  '00000000-0000-4000-8000-000000000703',
  '00000000-0000-4000-8000-000000000001',
  'Google Flow Scene Prompt',
  'google_flow',
  'scene',
  '{{style.prompt_prefix}}

Create a cinematic anime scene set in {{location.name}}, within the world of {{location.worldview}}.

Scene subject:
{{character.name}}, {{character.role}}, appears in this scene.

Character appearance:
{{character.prompt_summary}}

Location description:
{{location.prompt_summary}}

Scene action:
{{scene.action}}

Character emotion:
{{scene.emotion}}

Camera direction:
{{scene.camera_shot}}, {{scene.camera_angle}}

Lighting and atmosphere:
{{scene.lighting}}, {{location.atmosphere}}

Time and weather:
{{scene.time_weather}}

Environmental details:
{{location.visual_elements}}

Additional direction:
{{scene.additional_notes}}

Continuity rules:
Keep the character visually consistent with the established design. Preserve the location identity and cinematic dark science fantasy tone. Do not change the character outfit, signature items, hairstyle, or role. Maintain coherent lighting, readable faces, and strong environment storytelling.

{{style.prompt_suffix}}',
  '[
    "style.prompt_prefix",
    "location.name",
    "location.worldview",
    "character.name",
    "character.role",
    "character.prompt_summary",
    "location.prompt_summary",
    "scene.action",
    "scene.emotion",
    "scene.camera_shot",
    "scene.camera_angle",
    "scene.lighting",
    "scene.time_weather",
    "location.atmosphere",
    "location.visual_elements",
    "scene.additional_notes",
    "style.prompt_suffix"
  ]'::jsonb,
  'Builds a Google Flow-ready scene prompt by combining one character, one location, scene direction fields, and the selected style guide.',
  false,
  '{
    "version": 2,
    "usage": "scene_image_or_video_generation",
    "builder_mode": "scene",
    "mvp_inputs": [
      "character",
      "location",
      "style_guide",
      "scene.action",
      "scene.emotion",
      "scene.camera_shot",
      "scene.camera_angle",
      "scene.lighting",
      "scene.time_weather",
      "scene.additional_notes"
    ]
  }'::jsonb
)
on conflict (
  project_id,
  name,
  target_tool,
  template_type
)
do update set
  template_body = excluded.template_body,
  variables = excluded.variables,
  description = excluded.description,
  is_global = excluded.is_global,
  metadata = excluded.metadata,
  updated_at = now();

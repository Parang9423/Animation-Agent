-- Seed shot prompt templates for Eternal Rift.
-- Run this after supabase/20260723_create_shots_table.sql has been applied.

insert into public.prompt_templates (
  project_id,
  name,
  template_type,
  target_tool,
  template_body,
  negative_prompt,
  required_variables,
  memo
)
values
(
  '00000000-0000-4000-8000-000000000001',
  'Eternal Rift Shot Image Prompt',
  'shot',
  'google_flow',
  '{{style.prompt_prefix}}

Create a cinematic anime keyframe image for a single shot in Eternal Rift.

Scene context:
Scene #{{scene.sequence_no}} - {{scene.title}}
Scene type: {{scene.scene_type}}
Scene summary: {{scene.prompt_summary}}

Shot context:
Shot #{{shot.shot_order}} - {{shot.title}}
Shot type: {{shot.shot_type}}
Shot action: {{shot.action}}
Shot emotion: {{shot.emotion}}
Dialogue, if any: {{shot.dialogue}}

Character:
{{character.name}}, {{character.role}}
{{character.prompt_summary}}

Location:
{{location.name}}
{{location.prompt_summary}}

Camera direction:
{{shot.camera_shot}}, {{shot.camera_angle}}
Camera movement reference: {{shot.camera_movement}}

Visual direction:
{{shot.visual_prompt}}

Lighting and atmosphere:
{{scene.lighting}}, {{scene.time_weather}}
{{location.atmosphere}}

Continuity rules:
Keep the approved character and scene visual identity consistent. Preserve hairstyle, outfit, signature items, facial structure, color language, location geometry, and story tone. Make this a clean production keyframe that can be used as a video reference image.

{{style.prompt_suffix}}',
  'no inconsistent character design, no changed outfit, no wrong location, no unreadable face, no extra limbs, no distorted hands, no unrelated props, no comedic tone, no bright cheerful color palette, no low-detail background, no text artifacts, no watermark',
  array[
    'style.prompt_prefix',
    'style.prompt_suffix',
    'scene.sequence_no',
    'scene.title',
    'scene.scene_type',
    'scene.prompt_summary',
    'scene.lighting',
    'scene.time_weather',
    'shot.shot_order',
    'shot.title',
    'shot.shot_type',
    'shot.action',
    'shot.emotion',
    'shot.dialogue',
    'shot.camera_shot',
    'shot.camera_angle',
    'shot.camera_movement',
    'shot.visual_prompt',
    'character.name',
    'character.role',
    'character.prompt_summary',
    'location.name',
    'location.prompt_summary',
    'location.atmosphere'
  ],
  'Shot-level keyframe image prompt template for Google Flow.'
),
(
  '00000000-0000-4000-8000-000000000001',
  'Eternal Rift Shot Video Prompt',
  'shot',
  'google_flow',
  '{{style.prompt_prefix}}

Create a cinematic anime video shot for Eternal Rift.

Scene context:
Scene #{{scene.sequence_no}} - {{scene.title}}
Scene summary: {{scene.prompt_summary}}

Shot context:
Shot #{{shot.shot_order}} - {{shot.title}}
Shot type: {{shot.shot_type}}
Duration: {{shot.duration_sec}} seconds

Action and performance:
{{shot.action}}
Emotion: {{shot.emotion}}
Dialogue, if any: {{shot.dialogue}}

Character continuity:
{{character.name}}, {{character.role}}
{{character.prompt_summary}}

Location continuity:
{{location.name}}
{{location.prompt_summary}}

Camera and motion:
Shot size: {{shot.camera_shot}}
Camera angle: {{shot.camera_angle}}
Camera movement: {{shot.camera_movement}}

Video direction:
{{shot.video_prompt}}

Lighting and atmosphere:
{{scene.lighting}}, {{scene.time_weather}}
{{location.atmosphere}}

Motion rules:
Use restrained, cinematic motion. Keep animation coherent and physically readable. Avoid sudden cuts inside the shot unless specified. Preserve character identity, outfit, face, body proportions, lighting continuity, and scene geography across the entire duration.

{{style.prompt_suffix}}',
  'no identity drift, no character morphing, no outfit changes, no wrong location, no unstable face, no warped body, no extra limbs, no flickering, no camera jitter, no unreadable action, no text artifacts, no watermark, no abrupt style shift',
  array[
    'style.prompt_prefix',
    'style.prompt_suffix',
    'scene.sequence_no',
    'scene.title',
    'scene.prompt_summary',
    'scene.lighting',
    'scene.time_weather',
    'shot.shot_order',
    'shot.title',
    'shot.shot_type',
    'shot.duration_sec',
    'shot.action',
    'shot.emotion',
    'shot.dialogue',
    'shot.camera_shot',
    'shot.camera_angle',
    'shot.camera_movement',
    'shot.video_prompt',
    'character.name',
    'character.role',
    'character.prompt_summary',
    'location.name',
    'location.prompt_summary',
    'location.atmosphere'
  ],
  'Shot-level video prompt template for Google Flow or future video generation tools.'
)
on conflict do nothing;

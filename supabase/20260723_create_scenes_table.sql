-- Scenes table for Animation Agent
-- Purpose:
-- - Promote scene prompt runs into a first-class production unit.
-- - Store scene-level story, camera, lighting, and generation status.
-- - Allow prompt_runs and assets to be linked to a stable scene record.

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sequence_no integer not null default 1,
  title text not null,
  character_id uuid references public.characters(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  scene_type text not null default 'story',
  action text,
  emotion text,
  camera_shot text,
  camera_angle text,
  lighting text,
  time_weather text,
  description text,
  prompt_summary text,
  negative_prompt text,
  status text not null default 'draft',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scenes_status_check check (
    status in (
      'draft',
      'prompt_ready',
      'image_generated',
      'approved',
      'video_ready',
      'archived'
    )
  ),
  constraint scenes_scene_type_check check (
    scene_type in (
      'story',
      'character_intro',
      'location_establishing',
      'action',
      'dialogue',
      'transition',
      'other'
    )
  ),
  constraint scenes_sequence_positive_check check (sequence_no > 0)
);

create index if not exists scenes_project_id_idx
  on public.scenes(project_id);

create index if not exists scenes_project_sequence_idx
  on public.scenes(project_id, sequence_no);

create index if not exists scenes_character_id_idx
  on public.scenes(character_id);

create index if not exists scenes_location_id_idx
  on public.scenes(location_id);

create index if not exists scenes_status_idx
  on public.scenes(status);

-- Link prompt runs to scenes. Existing rows remain valid because scene_id is nullable.
alter table public.prompt_runs
  add column if not exists scene_id uuid references public.scenes(id) on delete set null;

create index if not exists prompt_runs_scene_id_idx
  on public.prompt_runs(scene_id);

-- Existing assets already support generic entity links through related_entity_type/related_entity_id.
-- Scene image assets should use:
--   related_entity_type = 'scene'
--   related_entity_id   = scenes.id
--   asset_type          = 'scene_image'
--   status              = 'approved' for representative scene image

-- Keep anon/auth grants aligned with current MVP access model.
grant select, insert, update, delete
on public.scenes
to anon, authenticated;

grant select, insert, update, delete
on public.prompt_runs
to anon, authenticated;

grant select, insert, update, delete
on public.assets
to anon, authenticated;

-- If row level security is enabled later, add explicit policies instead of relying only on grants.
-- Current MVP has used table-level grants/RLS-disabled operation for frontend access.

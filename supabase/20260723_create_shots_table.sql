-- Create shots table for scene-level video production planning.
-- Run this in Supabase SQL Editor after the scenes table migration is applied.

create table if not exists public.shots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  scene_id uuid not null references public.scenes(id) on delete cascade,
  shot_order integer not null default 1,
  title text not null,
  shot_type text not null default 'story',
  camera_shot text null,
  camera_angle text null,
  camera_movement text null,
  duration_sec numeric(5,2) null,
  action text null,
  dialogue text null,
  emotion text null,
  visual_prompt text null,
  negative_prompt text null,
  video_prompt text null,
  status text not null default 'draft',
  memo text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shots_shot_order_positive check (shot_order > 0),
  constraint shots_duration_positive check (duration_sec is null or duration_sec > 0),
  constraint shots_shot_type_check check (
    shot_type in (
      'story',
      'establishing',
      'character_action',
      'dialogue',
      'reaction',
      'insert',
      'transition',
      'other'
    )
  ),
  constraint shots_status_check check (
    status in (
      'draft',
      'prompt_ready',
      'image_generated',
      'video_prompt_ready',
      'video_generated',
      'approved',
      'archived'
    )
  )
);

create index if not exists shots_project_id_idx
  on public.shots(project_id);

create index if not exists shots_scene_id_idx
  on public.shots(scene_id);

create index if not exists shots_scene_order_idx
  on public.shots(scene_id, shot_order);

create unique index if not exists shots_scene_order_unique_idx
  on public.shots(scene_id, shot_order);

alter table public.prompt_runs
  add column if not exists shot_id uuid references public.shots(id) on delete set null;

create index if not exists prompt_runs_shot_id_idx
  on public.prompt_runs(shot_id);

-- MVP convenience grants. Tighten this with RLS policies before multi-user deployment.
grant select, insert, update, delete
on public.shots
to anon, authenticated;

grant select, insert, update, delete
on public.prompt_runs
to anon, authenticated;

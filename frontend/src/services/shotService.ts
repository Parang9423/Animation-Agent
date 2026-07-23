import { supabase } from '../lib/supabaseClient'

export type ShotStatus =
  | 'draft'
  | 'prompt_ready'
  | 'image_generated'
  | 'video_prompt_ready'
  | 'video_generated'
  | 'approved'
  | 'archived'

export type ShotType =
  | 'story'
  | 'establishing'
  | 'character_action'
  | 'dialogue'
  | 'reaction'
  | 'insert'
  | 'transition'
  | 'other'

export type Shot = {
  id: string
  project_id: string
  scene_id: string
  shot_order: number
  title: string
  shot_type: ShotType | null
  camera_shot: string | null
  camera_angle: string | null
  camera_movement: string | null
  duration_sec: number | null
  action: string | null
  dialogue: string | null
  emotion: string | null
  visual_prompt: string | null
  negative_prompt: string | null
  video_prompt: string | null
  status: ShotStatus | null
  memo: string | null
  created_at: string
  updated_at: string
}

export type CreateShotInput = {
  project_id: string
  scene_id: string
  shot_order: number
  title: string
  shot_type?: ShotType | null
  camera_shot?: string | null
  camera_angle?: string | null
  camera_movement?: string | null
  duration_sec?: number | null
  action?: string | null
  dialogue?: string | null
  emotion?: string | null
  visual_prompt?: string | null
  negative_prompt?: string | null
  video_prompt?: string | null
  status?: ShotStatus | null
  memo?: string | null
}

export async function getShotsByScene(sceneId: string): Promise<Shot[]> {
  const { data, error } = await supabase
    .from('shots')
    .select('*')
    .eq('scene_id', sceneId)
    .order('shot_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getShotsByProject(projectId: string): Promise<Shot[]> {
  const { data, error } = await supabase
    .from('shots')
    .select('*')
    .eq('project_id', projectId)
    .order('scene_id', { ascending: true })
    .order('shot_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createShot(shot: CreateShotInput): Promise<Shot> {
  const { data, error } = await supabase
    .from('shots')
    .insert({
      project_id: shot.project_id,
      scene_id: shot.scene_id,
      shot_order: shot.shot_order,
      title: shot.title,
      shot_type: shot.shot_type ?? 'story',
      camera_shot: shot.camera_shot ?? null,
      camera_angle: shot.camera_angle ?? null,
      camera_movement: shot.camera_movement ?? null,
      duration_sec: shot.duration_sec ?? null,
      action: shot.action ?? null,
      dialogue: shot.dialogue ?? null,
      emotion: shot.emotion ?? null,
      visual_prompt: shot.visual_prompt ?? null,
      negative_prompt: shot.negative_prompt ?? null,
      video_prompt: shot.video_prompt ?? null,
      status: shot.status ?? 'draft',
      memo: shot.memo ?? null,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateShotStatus(
  shotId: string,
  status: ShotStatus,
): Promise<Shot> {
  const { data, error } = await supabase
    .from('shots')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shotId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

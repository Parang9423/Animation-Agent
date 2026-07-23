import { supabase } from '../lib/supabaseClient'

export type SceneStatus =
  | 'draft'
  | 'prompt_ready'
  | 'image_generated'
  | 'approved'
  | 'video_ready'
  | 'archived'

export type SceneType =
  | 'story'
  | 'character_intro'
  | 'location_establishing'
  | 'action'
  | 'dialogue'
  | 'transition'
  | 'other'

export type SceneWithDetails = {
  id: string
  project_id: string
  sequence_no: number
  title: string
  character_id: string | null
  location_id: string | null
  scene_type: SceneType | null
  action: string | null
  emotion: string | null
  camera_shot: string | null
  camera_angle: string | null
  lighting: string | null
  time_weather: string | null
  description: string | null
  prompt_summary: string | null
  negative_prompt: string | null
  status: SceneStatus | null
  memo: string | null
  created_at: string
  updated_at: string
  characters: {
    name: string
    role: string | null
  } | null
  locations: {
    name: string
    type: string | null
  } | null
}

export type CreateSceneInput = {
  project_id: string
  sequence_no: number
  title: string
  character_id?: string | null
  location_id?: string | null
  scene_type?: SceneType | null
  action?: string | null
  emotion?: string | null
  camera_shot?: string | null
  camera_angle?: string | null
  lighting?: string | null
  time_weather?: string | null
  description?: string | null
  prompt_summary?: string | null
  negative_prompt?: string | null
  status?: SceneStatus | null
  memo?: string | null
}

export async function getScenesByProject(
  projectId: string,
): Promise<SceneWithDetails[]> {
  const { data, error } = await supabase
    .from('scenes')
    .select(
      `
      *,
      characters (
        name,
        role
      ),
      locations (
        name,
        type
      )
    `,
    )
    .eq('project_id', projectId)
    .order('sequence_no', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createScene(scene: CreateSceneInput): Promise<SceneWithDetails> {
  const { data, error } = await supabase
    .from('scenes')
    .insert({
      project_id: scene.project_id,
      sequence_no: scene.sequence_no,
      title: scene.title,
      character_id: scene.character_id ?? null,
      location_id: scene.location_id ?? null,
      scene_type: scene.scene_type ?? 'story',
      action: scene.action ?? null,
      emotion: scene.emotion ?? null,
      camera_shot: scene.camera_shot ?? null,
      camera_angle: scene.camera_angle ?? null,
      lighting: scene.lighting ?? null,
      time_weather: scene.time_weather ?? null,
      description: scene.description ?? null,
      prompt_summary: scene.prompt_summary ?? null,
      negative_prompt: scene.negative_prompt ?? null,
      status: scene.status ?? 'draft',
      memo: scene.memo ?? null,
    })
    .select(
      `
      *,
      characters (
        name,
        role
      ),
      locations (
        name,
        type
      )
    `,
    )
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateSceneStatus(
  sceneId: string,
  status: SceneStatus,
): Promise<SceneWithDetails> {
  const { data, error } = await supabase
    .from('scenes')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sceneId)
    .select(
      `
      *,
      characters (
        name,
        role
      ),
      locations (
        name,
        type
      )
    `,
    )
    .single()

  if (error) {
    throw error
  }

  return data
}

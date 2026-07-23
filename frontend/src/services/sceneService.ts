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

import { supabase } from '../lib/supabaseClient'

export type LocationWithWorldview = {
  id: string
  project_id: string
  worldview_id: string | null
  name: string
  type: string | null
  description: string | null
  atmosphere: string | null
  visual_elements: string[] | null
  related_factions: string[] | null
  related_characters: string[] | null
  prompt_summary: string | null
  negative_prompt: string | null
  created_at: string
  updated_at: string
  worldviews: {
    id: string
    name: string
  } | null
}

export async function getLocationsByProject(
  projectId: string,
): Promise<LocationWithWorldview[]> {
  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      worldviews (
        id,
        name
      )
    `)
    .eq('project_id', projectId)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

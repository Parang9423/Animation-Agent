import { supabase } from '../lib/supabaseClient'

export type FactionWithWorldview = {
  id: string
  project_id: string
  worldview_id: string | null
  name: string
  type: string | null
  goal: string | null
  values: string | null
  technology_level: string | null
  symbol: string | null
  color_palette: string | null
  representative_characters: string[] | null
  enemy_factions: string[] | null
  prompt_summary: string | null
  created_at: string
  updated_at: string
  worldviews: {
    id: string
    name: string
  } | null
}

export async function getFactionsByProject(
  projectId: string,
): Promise<FactionWithWorldview[]> {
  const { data, error } = await supabase
    .from('factions')
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

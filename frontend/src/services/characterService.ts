import { supabase } from '../lib/supabaseClient'

export type CharacterWithWorldview = {
  id: string
  project_id: string
  worldview_id: string | null
  name: string
  code_name: string | null
  role: string | null
  gender: string | null
  age_range: string | null
  age_text?: string | null
  personality: string | null
  speech_style: string | null
  appearance: string | null
  visual_description?: string | null
  outfit: string | null
  costume?: string | null
  signature_items: string[] | null
  goal: string | null
  weakness: string | null
  backstory: string | null
  forbidden_settings: string | null
  prompt_summary: string | null
  negative_prompt: string | null
  created_at: string
  updated_at: string
  worldviews: {
    id: string
    name: string
  } | null
}

export async function getCharactersByProject(
  projectId: string,
): Promise<CharacterWithWorldview[]> {
  const { data, error } = await supabase
    .from('characters')
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

  return (data ?? []).map((character) => ({
    ...character,
    age_text: character.age_range ?? null,
    visual_description: character.appearance ?? null,
    costume: character.outfit ?? null,
  }))
}

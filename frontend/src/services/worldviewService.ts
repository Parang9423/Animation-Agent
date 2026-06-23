import { supabase } from '../lib/supabaseClient'

export type Worldview = {
  id: string
  project_id: string
  name: string
  summary: string | null
  era: string | null
  civilization_level: string | null
  core_rules: string | null
  science_or_magic_rules: string | null
  major_events: Array<{
    name?: string
    description?: string
  }> | string[] | null
  major_regions: string[] | null
  forbidden_settings: string | null
  visual_tone: string | null
  prompt_summary: string | null
  created_at: string
  updated_at: string
}

export async function getWorldviewsByProject(
  projectId: string,
): Promise<Worldview[]> {
  const { data, error } = await supabase
    .from('worldviews')
    .select('*')
    .eq('project_id', projectId)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

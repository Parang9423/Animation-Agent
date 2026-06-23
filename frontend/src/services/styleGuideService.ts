import { supabase } from '../lib/supabaseClient'

export type StyleGuide = {
  id: string
  project_id: string
  name: string
  animation_style: string | null
  color_palette: string | null
  camera_style: string | null
  lighting_style: string | null
  mood: string | null
  reference_keywords: string[] | null
  negative_style: string | null
  prompt_prefix: string | null
  prompt_suffix: string | null
  is_default: boolean | null
  created_at: string
  updated_at: string
}

export async function getStyleGuidesByProject(
  projectId: string,
): Promise<StyleGuide[]> {
  const { data, error } = await supabase
    .from('style_guides')
    .select('*')
    .eq('project_id', projectId)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

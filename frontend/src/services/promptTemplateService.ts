import { supabase } from '../lib/supabaseClient'

export type PromptTemplate = {
  id: string
  project_id: string
  name: string
  target_tool: string | null
  template_type: string | null
  template_body: string | null
  negative_prompt: string | null
  variables: string[] | Record<string, unknown> | null
  usage_notes: string | null
  created_at: string
  updated_at: string
}

export async function getPromptTemplatesByProject(
  projectId: string,
): Promise<PromptTemplate[]> {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('project_id', projectId)
    .order('template_type', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

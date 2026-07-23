import { supabase } from '../lib/supabaseClient'

export type PromptRunType = 'character' | 'location' | 'scene'
export type PromptRunStatus =
  | 'draft'
  | 'copied'
  | 'generated'
  | 'selected'
  | 'rejected'
  | 'failed'

export type PromptRun = {
  id: string
  project_id: string
  prompt_type: PromptRunType
  target_tool: string
  template_id: string | null
  style_guide_id: string | null
  character_id: string | null
  location_id: string | null
  scene_id: string | null
  positive_prompt: string
  negative_prompt: string | null
  input_snapshot: Record<string, unknown>
  output_status: PromptRunStatus
  memo: string | null
  created_at: string
  updated_at: string
}

export type PromptRunWithDetails = PromptRun & {
  prompt_templates: {
    name: string
    template_type: string | null
    target_tool: string | null
  } | null
  style_guides: {
    name: string
  } | null
  characters: {
    name: string
    role: string | null
  } | null
  locations: {
    name: string
    type: string | null
  } | null
  scenes: {
    title: string
    sequence_no: number | null
    scene_type: string | null
    status: string | null
  } | null
}

export type CreatePromptRunInput = {
  project_id: string
  prompt_type: PromptRunType
  target_tool?: string
  template_id?: string | null
  style_guide_id?: string | null
  character_id?: string | null
  location_id?: string | null
  scene_id?: string | null
  positive_prompt: string
  negative_prompt?: string | null
  input_snapshot?: Record<string, unknown>
  output_status?: PromptRunStatus
  memo?: string | null
}

export async function createPromptRun(
  promptRun: CreatePromptRunInput,
): Promise<PromptRun> {
  const { data, error } = await supabase
    .from('prompt_runs')
    .insert({
      project_id: promptRun.project_id,
      prompt_type: promptRun.prompt_type,
      target_tool: promptRun.target_tool ?? 'google_flow',
      template_id: promptRun.template_id ?? null,
      style_guide_id: promptRun.style_guide_id ?? null,
      character_id: promptRun.character_id ?? null,
      location_id: promptRun.location_id ?? null,
      scene_id: promptRun.scene_id ?? null,
      positive_prompt: promptRun.positive_prompt,
      negative_prompt: promptRun.negative_prompt ?? null,
      input_snapshot: promptRun.input_snapshot ?? {},
      output_status: promptRun.output_status ?? 'draft',
      memo: promptRun.memo ?? null,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getPromptRunsByProject(
  projectId: string,
): Promise<PromptRunWithDetails[]> {
  const { data, error } = await supabase
    .from('prompt_runs')
    .select(
      `
      *,
      prompt_templates (
        name,
        template_type,
        target_tool
      ),
      style_guides (
        name
      ),
      characters (
        name,
        role
      ),
      locations (
        name,
        type
      ),
      scenes (
        title,
        sequence_no,
        scene_type,
        status
      )
    `,
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function deletePromptRun(promptRunId: string): Promise<void> {
  const { error } = await supabase.from('prompt_runs').delete().eq('id', promptRunId)

  if (error) {
    throw error
  }
}

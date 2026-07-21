import { supabase } from '../lib/supabaseClient'

export type AssetStatus = 'candidate' | 'approved' | 'rejected' | 'archived'

export type Asset = {
  id: string
  project_id: string
  related_entity_type: string | null
  related_entity_id: string | null
  asset_type: string | null
  source_type: string | null
  storage_path: string | null
  external_url: string | null
  prompt_used: string | null
  generation_metadata: Record<string, unknown> | null
  status: AssetStatus | null
  prompt_run_id: string | null
  created_at: string
  updated_at: string
}

export type AssetWithPromptRun = Asset & {
  prompt_runs: {
    id: string
    prompt_type: string
    target_tool: string
    output_status: string
    created_at: string
    characters: {
      name: string
    } | null
    locations: {
      name: string
    } | null
  } | null
}

export type CreateAssetInput = {
  project_id: string
  related_entity_type?: string | null
  related_entity_id?: string | null
  asset_type?: string | null
  source_type?: string | null
  storage_path?: string | null
  external_url?: string | null
  prompt_used?: string | null
  generation_metadata?: Record<string, unknown> | null
  status?: AssetStatus | null
  prompt_run_id?: string | null
}

export async function getAssetsByProject(
  projectId: string,
): Promise<AssetWithPromptRun[]> {
  const { data, error } = await supabase
    .from('assets')
    .select(
      `
      *,
      prompt_runs (
        id,
        prompt_type,
        target_tool,
        output_status,
        created_at,
        characters (
          name
        ),
        locations (
          name
        )
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

export async function createAsset(asset: CreateAssetInput): Promise<Asset> {
  const { data, error } = await supabase
    .from('assets')
    .insert({
      project_id: asset.project_id,
      related_entity_type: asset.related_entity_type ?? null,
      related_entity_id: asset.related_entity_id ?? null,
      asset_type: asset.asset_type ?? 'image',
      source_type: asset.source_type ?? 'google_flow',
      storage_path: asset.storage_path ?? null,
      external_url: asset.external_url ?? null,
      prompt_used: asset.prompt_used ?? null,
      generation_metadata: asset.generation_metadata ?? {},
      status: asset.status ?? 'candidate',
      prompt_run_id: asset.prompt_run_id ?? null,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateAssetStatus(
  assetId: string,
  status: AssetStatus,
): Promise<Asset> {
  const { data, error } = await supabase
    .from('assets')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assetId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

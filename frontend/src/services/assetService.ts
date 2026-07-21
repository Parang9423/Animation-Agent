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

export type UploadAssetFileInput = {
  file: File
  projectSlug: string
  assetType: string
  promptRunId?: string | null
}

export type UploadedAssetFile = {
  bucket: string
  storage_path: string
  public_url: string
}

const ASSET_BUCKET_NAME = 'assets'

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
      asset_type: asset.asset_type ?? 'other',
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

export async function uploadAssetFile({
  file,
  projectSlug,
  assetType,
  promptRunId,
}: UploadAssetFileInput): Promise<UploadedAssetFile> {
  const fileExtension = getFileExtension(file.name)
  const safeBaseName = sanitizeFileName(removeFileExtension(file.name))
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const promptRunPrefix = promptRunId ? `${promptRunId.slice(0, 8)}-` : ''
  const fileName = `${promptRunPrefix}${safeBaseName}-${timestamp}.${fileExtension}`
  const storagePath = `${sanitizePathSegment(projectSlug)}/${sanitizePathSegment(
    assetType,
  )}/${fileName}`

  const { error } = await supabase.storage
    .from(ASSET_BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from(ASSET_BUCKET_NAME)
    .getPublicUrl(storagePath)

  return {
    bucket: ASSET_BUCKET_NAME,
    storage_path: storagePath,
    public_url: data.publicUrl,
  }
}

function getFileExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase()

  return extension && extension !== fileName ? extension : 'png'
}

function removeFileExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '')
}

function sanitizeFileName(fileName: string) {
  return (
    fileName
      .toLowerCase()
      .replace(/[^a-z0-9가-힣-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'asset'
  )
}

function sanitizePathSegment(segment: string) {
  return (
    segment
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'default'
  )
}

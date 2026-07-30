import { supabase } from '../lib/supabaseClient'
import type { Asset } from './assetService'
import type { Shot, ShotStatus } from './shotService'

export type ProductionBoardScene = {
  title: string | null
  sequence_no: number | null
  status: string | null
}

export type ProductionBoardAsset = Pick<
  Asset,
  'id' | 'external_url' | 'storage_path' | 'asset_type' | 'status' | 'updated_at' | 'created_at'
>

export type ProductionBoardRow = Shot & {
  scenes: ProductionBoardScene | null
  approvedImageAsset: ProductionBoardAsset | null
  approvedVideoAsset: ProductionBoardAsset | null
  hasApprovedImage: boolean
  hasApprovedVideo: boolean
  hasVideoPrompt: boolean
  nextAction: string
  progressStage: 'draft' | 'prompt' | 'image' | 'video_prompt' | 'video' | 'complete'
}

type ShotWithScene = Shot & {
  scenes: ProductionBoardScene | null
}

export async function getProductionBoardRows(
  projectId: string,
): Promise<ProductionBoardRow[]> {
  const shots = await getShotsWithScenes(projectId)
  const approvedShotAssets = await getApprovedShotAssets(projectId)
  const assetsByShotId = groupApprovedAssetsByShotId(approvedShotAssets)

  return shots.map((shot) => {
    const shotAssets = assetsByShotId[shot.id] ?? []
    const approvedImageAsset = getLatestAssetByType(shotAssets, 'shot_image')
    const approvedVideoAsset = getLatestAssetByType(shotAssets, 'video')
    const hasApprovedImage = Boolean(approvedImageAsset)
    const hasApprovedVideo = Boolean(approvedVideoAsset)
    const hasVideoPrompt = Boolean(shot.video_prompt?.trim())

    return {
      ...shot,
      approvedImageAsset,
      approvedVideoAsset,
      hasApprovedImage,
      hasApprovedVideo,
      hasVideoPrompt,
      ...getProgressState({
        status: shot.status,
        hasApprovedImage,
        hasApprovedVideo,
        hasVideoPrompt,
      }),
    }
  })
}

async function getShotsWithScenes(projectId: string): Promise<ShotWithScene[]> {
  const { data, error } = await supabase
    .from('shots')
    .select(
      `
      *,
      scenes (
        title,
        sequence_no,
        status
      )
    `,
    )
    .eq('project_id', projectId)
    .order('scene_id', { ascending: true })
    .order('shot_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (!error) {
    return data ?? []
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from('shots')
    .select('*')
    .eq('project_id', projectId)
    .order('scene_id', { ascending: true })
    .order('shot_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (fallbackError) {
    throw fallbackError
  }

  return (fallbackData ?? []).map((shot) => ({
    ...shot,
    scenes: null,
  }))
}

async function getApprovedShotAssets(
  projectId: string,
): Promise<ProductionBoardAsset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select(
      'id, related_entity_id, asset_type, status, external_url, storage_path, updated_at, created_at',
    )
    .eq('project_id', projectId)
    .eq('related_entity_type', 'shot')
    .eq('status', 'approved')
    .in('asset_type', ['shot_image', 'video'])
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as ProductionBoardAsset[]
}

function groupApprovedAssetsByShotId(assets: ProductionBoardAsset[]) {
  return assets.reduce<Record<string, ProductionBoardAsset[]>>((groupedAssets, asset) => {
    const relatedEntityId = (asset as ProductionBoardAsset & { related_entity_id?: string | null })
      .related_entity_id

    if (!relatedEntityId) {
      return groupedAssets
    }

    return {
      ...groupedAssets,
      [relatedEntityId]: [...(groupedAssets[relatedEntityId] ?? []), asset],
    }
  }, {})
}

function getLatestAssetByType(
  assets: ProductionBoardAsset[],
  assetType: 'shot_image' | 'video',
) {
  return assets.find((asset) => asset.asset_type === assetType) ?? null
}

function getProgressState({
  status,
  hasApprovedImage,
  hasApprovedVideo,
  hasVideoPrompt,
}: {
  status: ShotStatus | null
  hasApprovedImage: boolean
  hasApprovedVideo: boolean
  hasVideoPrompt: boolean
}): Pick<ProductionBoardRow, 'nextAction' | 'progressStage'> {
  if (hasApprovedVideo || status === 'video_generated') {
    return {
      progressStage: 'complete',
      nextAction: 'Complete / review final video',
    }
  }

  if (hasVideoPrompt && hasApprovedImage) {
    return {
      progressStage: 'video',
      nextAction: 'Generate video and upload asset',
    }
  }

  if (hasApprovedImage) {
    return {
      progressStage: 'video_prompt',
      nextAction: 'Create shot video prompt',
    }
  }

  if (status === 'prompt_ready' || status === 'image_generated') {
    return {
      progressStage: 'image',
      nextAction: 'Generate or approve shot image',
    }
  }

  return {
    progressStage: 'prompt',
    nextAction: 'Create shot image prompt',
  }
}

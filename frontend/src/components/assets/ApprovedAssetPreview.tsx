import { useEffect, useState } from 'react'
import {
  getApprovedAssetByEntity,
  type Asset,
} from '../../services/assetService'

type ApprovedAssetPreviewProps = {
  relatedEntityType: 'character' | 'location' | string
  relatedEntityId: string
  assetType: 'character_image' | 'location_image' | 'scene_image' | string
  label?: string
  compact?: boolean
}

type LoadState = 'idle' | 'loading' | 'loaded' | 'failed'

export function ApprovedAssetPreview({
  relatedEntityType,
  relatedEntityId,
  assetType,
  label = 'Approved Asset',
  compact = false,
}: ApprovedAssetPreviewProps) {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [mediaFailed, setMediaFailed] = useState(false)

  useEffect(() => {
    let isMounted = true

    setLoadState('loading')
    setMediaFailed(false)

    getApprovedAssetByEntity({
      relatedEntityType,
      relatedEntityId,
      assetType,
    })
      .then((approvedAsset) => {
        if (!isMounted) return
        setAsset(approvedAsset)
        setLoadState('loaded')
      })
      .catch(() => {
        if (!isMounted) return
        setAsset(null)
        setLoadState('failed')
      })

    return () => {
      isMounted = false
    }
  }, [assetType, relatedEntityId, relatedEntityType])

  if (loadState === 'loading') {
    return (
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
        대표 에셋을 불러오는 중...
      </div>
    )
  }

  if (!asset?.external_url || mediaFailed) {
    return compact ? null : (
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
        승인된 대표 에셋이 없습니다.
      </div>
    )
  }

  const isVideo = isVideoAsset(asset.asset_type, asset.external_url)

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
          {label}
        </p>
        <span className="rounded-full border border-emerald-700 bg-emerald-950 px-2 py-0.5 text-[11px] text-emerald-100">
          approved
        </span>
      </div>

      <div className={compact ? 'h-48 bg-slate-950' : 'h-80 bg-slate-950'}>
        {isVideo ? (
          <video
            src={asset.external_url}
            controls
            onError={() => setMediaFailed(true)}
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <img
            src={asset.external_url}
            alt={`${relatedEntityType} approved asset`}
            onError={() => setMediaFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  )
}

function isVideoAsset(assetType: string | null, url: string) {
  return assetType === 'video' || /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(url)
}

import { useState } from 'react'
import {
  updateAssetStatus,
  type AssetStatus,
  type AssetWithPromptRun,
} from '../../services/assetService'

type AssetCardProps = {
  asset: AssetWithPromptRun
}

type StatusSaveState = 'idle' | 'saving' | 'saved' | 'failed'

const ASSET_STATUS_OPTIONS: AssetStatus[] = [
  'candidate',
  'approved',
  'rejected',
  'archived',
]

export function AssetCard({ asset }: AssetCardProps) {
  const promptRunSubject = getPromptRunSubject(asset)
  const [currentStatus, setCurrentStatus] = useState<AssetStatus>(
    normalizeAssetStatus(asset.status),
  )
  const [statusSaveState, setStatusSaveState] =
    useState<StatusSaveState>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [imageFailed, setImageFailed] = useState(false)

  const shouldShowImagePreview =
    Boolean(asset.external_url) &&
    !imageFailed &&
    (isLikelyImageUrl(asset.external_url ?? '') || isImageAsset(asset.asset_type))

  const handleStatusChange = async (nextStatus: AssetStatus) => {
    const previousStatus = currentStatus

    setCurrentStatus(nextStatus)
    setStatusSaveState('saving')
    setStatusMessage('Saving status...')

    try {
      await updateAssetStatus(asset.id, nextStatus)
      setStatusSaveState('saved')
      setStatusMessage(`Status updated to ${nextStatus}`)
      window.setTimeout(() => {
        setStatusSaveState('idle')
        setStatusMessage(null)
      }, 2000)
    } catch (error) {
      setCurrentStatus(previousStatus)
      setStatusSaveState('failed')
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Asset status 변경 중 오류가 발생했습니다.',
      )
    }
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-xs font-semibold text-cyan-100">
              {asset.asset_type ?? 'asset'}
            </span>
            <span className={getStatusBadgeClassName(currentStatus)}>
              {currentStatus}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              {asset.source_type ?? 'unknown source'}
            </span>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-100">
            {promptRunSubject}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Asset ID: {asset.id.slice(0, 8)} · Created:{' '}
            {new Date(asset.created_at).toLocaleString()}
          </p>
        </div>

        <div className="text-right text-xs text-slate-500">
          <p>Entity: {asset.related_entity_type ?? 'none'}</p>
          <p>Run: {asset.prompt_run_id?.slice(0, 8) ?? 'No run'}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-300">Asset Status</p>
            <p className="mt-1 text-xs text-slate-500">
              후보/승인/폐기/보관 상태를 즉시 변경합니다.
            </p>
          </div>

          <select
            value={currentStatus}
            onChange={(event) =>
              handleStatusChange(event.target.value as AssetStatus)
            }
            disabled={statusSaveState === 'saving'}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:text-slate-600"
          >
            {ASSET_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {statusMessage && (
          <p
            className={`mt-3 text-sm ${
              statusSaveState === 'failed'
                ? 'text-red-300'
                : statusSaveState === 'saved'
                  ? 'text-emerald-300'
                  : 'text-slate-400'
            }`}
          >
            {statusMessage}
          </p>
        )}
      </div>

      {shouldShowImagePreview && (
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <img
            src={asset.external_url ?? ''}
            alt={promptRunSubject}
            onError={() => setImageFailed(true)}
            className="max-h-[420px] w-full object-contain"
          />
        </div>
      )}

      {asset.external_url && imageFailed && (
        <div className="mt-5 rounded-xl border border-yellow-800 bg-yellow-950/20 p-4 text-sm text-yellow-100">
          이미지 미리보기를 불러오지 못했습니다. 외부 링크 접근 권한 또는 URL 만료 여부를 확인하세요.
        </div>
      )}

      {!asset.external_url && asset.storage_path && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
          Storage path만 등록되어 있습니다. Supabase Storage preview 연결은 이후 단계에서 추가할 수 있습니다.
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InfoBlock label="External URL" value={asset.external_url} />
        <InfoBlock label="Storage Path" value={asset.storage_path} />
      </div>

      {asset.prompt_used && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-300">Prompt Used</p>
          <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-400">
            {asset.prompt_used}
          </pre>
        </div>
      )}

      <details className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-300">
          Generation Metadata
        </summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-400">
          {JSON.stringify(asset.generation_metadata ?? {}, null, 2)}
        </pre>
      </details>
    </article>
  )
}

type InfoBlockProps = {
  label: string
  value: string | null
}

function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      {value ? (
        <p className="mt-2 break-words text-sm text-slate-300">{value}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-600">No value</p>
      )}
    </div>
  )
}

function getPromptRunSubject(asset: AssetWithPromptRun) {
  if (!asset.prompt_runs) {
    return `${asset.related_entity_type ?? 'Unlinked'} asset`
  }

  const characterName = asset.prompt_runs.characters?.name
  const locationName = asset.prompt_runs.locations?.name

  if (characterName && locationName) {
    return `${characterName} @ ${locationName}`
  }

  return characterName ?? locationName ?? `${asset.prompt_runs.prompt_type} prompt run`
}

function normalizeAssetStatus(status: AssetWithPromptRun['status']): AssetStatus {
  if (
    status === 'approved' ||
    status === 'rejected' ||
    status === 'archived' ||
    status === 'candidate'
  ) {
    return status
  }

  return 'candidate'
}

function getStatusBadgeClassName(status: AssetStatus) {
  const baseClassName = 'rounded-full border px-3 py-1 text-xs font-semibold'

  if (status === 'approved') {
    return `${baseClassName} border-emerald-700 bg-emerald-950 text-emerald-100`
  }

  if (status === 'rejected') {
    return `${baseClassName} border-red-700 bg-red-950 text-red-100`
  }

  if (status === 'archived') {
    return `${baseClassName} border-slate-700 bg-slate-950 text-slate-300`
  }

  return `${baseClassName} border-yellow-700 bg-yellow-950 text-yellow-100`
}

function isImageAsset(assetType: string | null) {
  return Boolean(assetType?.toLowerCase().includes('image'))
}

function isLikelyImageUrl(url: string) {
  return /\.(png|jpg|jpeg|webp|gif)(\?.*)?$/i.test(url)
}

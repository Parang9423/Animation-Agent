import { useState } from 'react'
import {
  updateAssetStatus,
  type AssetStatus,
  type AssetWithPromptRun,
} from '../../services/assetService'
import {
  deletePromptRun,
  type PromptRunWithDetails,
} from '../../services/promptRunService'

type PromptRunCardProps = {
  promptRun: PromptRunWithDetails
  assets?: AssetWithPromptRun[]
  onAssetStatusChanged?: () => void
  onPromptRunDeleted?: () => void
}

type StatusSaveState = 'idle' | 'saving' | 'saved' | 'failed'
type DeleteState = 'idle' | 'deleting' | 'failed'

const ASSET_STATUS_OPTIONS: AssetStatus[] = [
  'candidate',
  'approved',
  'rejected',
  'archived',
]

export function PromptRunCard({
  promptRun,
  assets = [],
  onAssetStatusChanged,
  onPromptRunDeleted,
}: PromptRunCardProps) {
  const createdAt = new Date(promptRun.created_at).toLocaleString()
  const subjectLabel = getSubjectLabel(promptRun)
  const approvedAssets = assets.filter((asset) => asset.status === 'approved')
  const [deleteState, setDeleteState] = useState<DeleteState>('idle')
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)
  const [isDeleted, setIsDeleted] = useState(false)

  const handleDeletePromptRun = async () => {
    const linkedAssetMessage =
      assets.length > 0
        ? `\n\n이 Prompt Run에 연결된 Asset ${assets.length}개는 삭제되지 않고 prompt_run 연결만 해제됩니다.`
        : ''

    const shouldDelete = window.confirm(
      `이 Prompt Run을 삭제할까요?\n\n${subjectLabel}\nID: ${promptRun.id.slice(
        0,
        8,
      )}${linkedAssetMessage}`,
    )

    if (!shouldDelete) {
      return
    }

    setDeleteState('deleting')
    setDeleteMessage('Deleting prompt run...')

    try {
      await deletePromptRun(promptRun.id)
      setIsDeleted(true)
      onPromptRunDeleted?.()
      onAssetStatusChanged?.()
    } catch (error) {
      setDeleteState('failed')
      setDeleteMessage(
        error instanceof Error
          ? error.message
          : 'Prompt Run 삭제 중 오류가 발생했습니다.',
      )
    }
  }

  if (isDeleted) {
    return null
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
              {promptRun.prompt_type}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              {promptRun.output_status}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              {promptRun.target_tool}
            </span>
            <span className="rounded-full border border-purple-700 bg-purple-950 px-3 py-1 text-xs font-semibold text-purple-100">
              {assets.length} assets
            </span>
            {approvedAssets.length > 0 && (
              <span className="rounded-full border border-emerald-700 bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-100">
                {approvedAssets.length} approved
              </span>
            )}
          </div>

          <h3 className="mt-4 text-xl font-semibold text-slate-100">
            {subjectLabel}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {promptRun.prompt_templates?.name ?? 'No template'} ·{' '}
            {promptRun.style_guides?.name ?? 'No style guide'}
          </p>
        </div>

        <div className="text-right text-xs text-slate-500">
          <p>{createdAt}</p>
          <p className="mt-1 font-mono">{promptRun.id.slice(0, 8)}</p>
          <button
            type="button"
            onClick={handleDeletePromptRun}
            disabled={deleteState === 'deleting'}
            className="mt-3 rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-950 disabled:text-slate-600"
          >
            {deleteState === 'deleting' ? 'Deleting...' : 'Delete Run'}
          </button>
          {deleteMessage && (
            <p
              className={`mt-2 max-w-52 text-xs ${
                deleteState === 'failed' ? 'text-red-300' : 'text-slate-400'
              }`}
            >
              {deleteMessage}
            </p>
          )}
        </div>
      </div>

      <PromptRunAssets
        assets={assets}
        onAssetStatusChanged={onAssetStatusChanged}
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <PromptPreview
          title="Positive Prompt"
          value={promptRun.positive_prompt}
        />
        <PromptPreview
          title="Negative Prompt"
          value={promptRun.negative_prompt ?? 'No negative prompt'}
        />
      </div>

      <details className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-300">
          Input Snapshot
        </summary>
        <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-400">
          {JSON.stringify(promptRun.input_snapshot, null, 2)}
        </pre>
      </details>
    </article>
  )
}

type PromptRunAssetsProps = {
  assets: AssetWithPromptRun[]
  onAssetStatusChanged?: () => void
}

function PromptRunAssets({ assets, onAssetStatusChanged }: PromptRunAssetsProps) {
  if (assets.length === 0) {
    return (
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
        이 Prompt Run에 연결된 Asset 후보가 아직 없습니다.
      </div>
    )
  }

  return (
    <section className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-300">
            Asset Candidates
          </p>
          <p className="mt-1 text-xs text-slate-500">
            같은 prompt_run에서 생성된 후보를 비교하고 상태를 선택합니다.
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
          {assets.length} candidates
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <PromptRunAssetCandidate
            key={asset.id}
            asset={asset}
            onAssetStatusChanged={onAssetStatusChanged}
          />
        ))}
      </div>
    </section>
  )
}

type PromptRunAssetCandidateProps = {
  asset: AssetWithPromptRun
  onAssetStatusChanged?: () => void
}

function PromptRunAssetCandidate({
  asset,
  onAssetStatusChanged,
}: PromptRunAssetCandidateProps) {
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
    setStatusMessage('Saving...')

    try {
      await updateAssetStatus(asset.id, nextStatus)
      setStatusSaveState('saved')
      setStatusMessage(`Updated to ${nextStatus}`)
      onAssetStatusChanged?.()
      window.setTimeout(() => {
        setStatusSaveState('idle')
        setStatusMessage(null)
      }, 1600)
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
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      {shouldShowImagePreview ? (
        <div className="flex h-56 items-center justify-center bg-slate-950">
          <img
            src={asset.external_url ?? ''}
            alt={`${asset.asset_type ?? 'asset'} candidate`}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center bg-slate-950 px-4 text-center text-sm text-slate-500">
          {asset.external_url
            ? 'Preview를 불러오지 못했습니다.'
            : 'Preview URL이 없습니다.'}
        </div>
      )}

      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-700 bg-cyan-950 px-2.5 py-1 text-xs text-cyan-100">
            {asset.asset_type ?? 'asset'}
          </span>
          <span className={getStatusBadgeClassName(currentStatus)}>
            {currentStatus}
          </span>
        </div>

        <p className="mt-3 font-mono text-xs text-slate-500">
          Asset ID: {asset.id.slice(0, 8)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Created: {new Date(asset.created_at).toLocaleString()}
        </p>

        <label className="mt-4 block">
          <span className="text-xs text-slate-400">Candidate Status</span>
          <select
            value={currentStatus}
            onChange={(event) =>
              handleStatusChange(event.target.value as AssetStatus)
            }
            disabled={statusSaveState === 'saving'}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:text-slate-600"
          >
            {ASSET_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        {statusMessage && (
          <p
            className={`mt-2 text-xs ${
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
    </div>
  )
}

type PromptPreviewProps = {
  title: string
  value: string
}

function PromptPreview({ title, value }: PromptPreviewProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-400">
        {value}
      </pre>
    </div>
  )
}

function getSubjectLabel(promptRun: PromptRunWithDetails) {
  if (promptRun.prompt_type === 'character') {
    return promptRun.characters?.name ?? 'Character prompt run'
  }

  if (promptRun.prompt_type === 'location') {
    return promptRun.locations?.name ?? 'Location prompt run'
  }

  const characterName = promptRun.characters?.name ?? 'No character'
  const locationName = promptRun.locations?.name ?? 'No location'

  return `${characterName} @ ${locationName}`
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
  const baseClassName = 'rounded-full border px-2.5 py-1 text-xs font-semibold'

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

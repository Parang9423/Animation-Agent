import { useState } from 'react'
import { ApprovedAssetPreview } from '../assets/ApprovedAssetPreview'
import {
  updateShotStatus,
  type Shot,
  type ShotStatus,
} from '../../services/shotService'

const SHOT_STATUS_OPTIONS: ShotStatus[] = [
  'draft',
  'prompt_ready',
  'image_generated',
  'video_prompt_ready',
  'video_generated',
  'approved',
  'archived',
]

type ShotCardProps = {
  shot: Shot
  onChanged?: () => void
}

type SaveState = 'idle' | 'saving' | 'saved' | 'failed'

export function ShotCard({ shot, onChanged }: ShotCardProps) {
  const [currentShot, setCurrentShot] = useState(shot)
  const [currentStatus, setCurrentStatus] = useState<ShotStatus>(
    normalizeShotStatus(shot.status),
  )
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleStatusChange = async (nextStatus: ShotStatus) => {
    const previousStatus = currentStatus

    setCurrentStatus(nextStatus)
    setSaveState('saving')
    setMessage('Saving shot status...')

    try {
      const updatedShot = await updateShotStatus(currentShot.id, nextStatus)
      setCurrentShot(updatedShot)
      setSaveState('saved')
      setMessage(`Shot status updated to ${nextStatus}`)
      onChanged?.()
      window.setTimeout(() => {
        setSaveState('idle')
        setMessage(null)
      }, 2000)
    } catch (error) {
      setCurrentStatus(previousStatus)
      setSaveState('failed')
      setMessage(
        error instanceof Error
          ? error.message
          : 'Shot status 변경 중 오류가 발생했습니다.',
      )
    }
  }

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-800 bg-cyan-950 px-3 py-1 text-xs font-semibold text-cyan-100">
              Shot #{currentShot.shot_order}
            </span>
            <span className={getStatusBadgeClassName(currentStatus)}>
              {currentStatus}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              {currentShot.shot_type ?? 'story'}
            </span>
          </div>

          <h4 className="mt-3 text-lg font-semibold text-slate-100">
            {currentShot.title}
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            Duration: {currentShot.duration_sec ?? 'N/A'} sec · ID:{' '}
            {currentShot.id.slice(0, 8)}
          </p>
        </div>

        <label className="min-w-52">
          <span className="text-xs text-slate-500">Shot Status</span>
          <select
            value={currentStatus}
            onChange={(event) =>
              handleStatusChange(event.target.value as ShotStatus)
            }
            disabled={saveState === 'saving'}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:text-slate-600"
          >
            {SHOT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message && (
        <p
          className={`mt-3 text-sm ${
            saveState === 'failed'
              ? 'text-red-300'
              : saveState === 'saved'
                ? 'text-emerald-300'
                : 'text-slate-400'
          }`}
        >
          {message}
        </p>
      )}

      <ApprovedAssetPreview
        relatedEntityType="shot"
        relatedEntityId={currentShot.id}
        assetType="shot_image"
        label="Approved Shot Image"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoBlock label="Action" value={currentShot.action} />
        <InfoBlock label="Emotion" value={currentShot.emotion} />
        <InfoBlock label="Camera" value={formatCamera(currentShot)} />
        <InfoBlock label="Movement" value={currentShot.camera_movement} />
      </div>

      {currentShot.visual_prompt && (
        <PromptBlock title="Visual Prompt" prompt={currentShot.visual_prompt} />
      )}

      {currentShot.video_prompt && (
        <PromptBlock title="Video Prompt" prompt={currentShot.video_prompt} />
      )}
    </article>
  )
}

type InfoBlockProps = {
  label: string
  value: string | null
}

function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{value ?? 'No data'}</p>
    </div>
  )
}

type PromptBlockProps = {
  title: string
  prompt: string
}

function PromptBlock({ title, prompt }: PromptBlockProps) {
  return (
    <details className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-slate-300">
        {title}
      </summary>
      <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
        {prompt}
      </pre>
    </details>
  )
}

function formatCamera(shot: Shot) {
  return [shot.camera_shot, shot.camera_angle].filter(Boolean).join(', ') || null
}

function normalizeShotStatus(status: Shot['status']): ShotStatus {
  return status && SHOT_STATUS_OPTIONS.includes(status) ? status : 'draft'
}

function getStatusBadgeClassName(status: ShotStatus) {
  const baseClassName = 'rounded-full border px-3 py-1 text-xs font-semibold'

  if (status === 'approved' || status === 'video_generated') {
    return `${baseClassName} border-emerald-700 bg-emerald-950 text-emerald-100`
  }

  if (
    status === 'prompt_ready' ||
    status === 'image_generated' ||
    status === 'video_prompt_ready'
  ) {
    return `${baseClassName} border-cyan-700 bg-cyan-950 text-cyan-100`
  }

  if (status === 'archived') {
    return `${baseClassName} border-slate-700 bg-slate-900 text-slate-300`
  }

  return `${baseClassName} border-yellow-700 bg-yellow-950 text-yellow-100`
}

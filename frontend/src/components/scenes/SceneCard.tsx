import { useState } from 'react'
import { ApprovedAssetPreview } from '../assets/ApprovedAssetPreview'
import {
  updateSceneStatus,
  type SceneStatus,
  type SceneWithDetails,
} from '../../services/sceneService'

type SceneCardProps = {
  scene: SceneWithDetails
}

type StatusSaveState = 'idle' | 'saving' | 'saved' | 'failed'

const SCENE_STATUS_OPTIONS: SceneStatus[] = [
  'draft',
  'prompt_ready',
  'image_generated',
  'approved',
  'video_ready',
  'archived',
]

export function SceneCard({ scene }: SceneCardProps) {
  const [currentScene, setCurrentScene] = useState(scene)
  const [currentStatus, setCurrentStatus] = useState<SceneStatus>(
    normalizeSceneStatus(scene.status),
  )
  const [statusSaveState, setStatusSaveState] =
    useState<StatusSaveState>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleStatusChange = async (nextStatus: SceneStatus) => {
    const previousStatus = currentStatus

    setCurrentStatus(nextStatus)
    setStatusSaveState('saving')
    setStatusMessage('Saving scene status...')

    try {
      const updatedScene = await updateSceneStatus(currentScene.id, nextStatus)
      setCurrentScene(updatedScene)
      setStatusSaveState('saved')
      setStatusMessage(`Scene status updated to ${nextStatus}`)
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
          : 'Scene status 변경 중 오류가 발생했습니다.',
      )
    }
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-xs font-semibold text-cyan-100">
              Scene #{currentScene.sequence_no}
            </span>
            <span className={getStatusBadgeClassName(currentStatus)}>
              {currentStatus}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              {currentScene.scene_type ?? 'story'}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-semibold text-slate-100">
            {currentScene.title}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {currentScene.characters?.name ?? 'No character'} @{' '}
            {currentScene.locations?.name ?? 'No location'}
          </p>
        </div>

        <div className="text-right text-xs text-slate-500">
          <p>Updated: {new Date(currentScene.updated_at).toLocaleString()}</p>
          <p className="mt-1 font-mono">{currentScene.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-300">Production Status</p>
            <p className="mt-1 text-xs text-slate-500">
              Scene 제작 단계를 변경합니다. 상태는 scenes.status에 즉시 저장됩니다.
            </p>
          </div>

          <label className="min-w-52">
            <span className="sr-only">Scene Status</span>
            <select
              value={currentStatus}
              onChange={(event) =>
                handleStatusChange(event.target.value as SceneStatus)
              }
              disabled={statusSaveState === 'saving'}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:text-slate-600"
            >
              {SCENE_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
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

      <ApprovedAssetPreview
        relatedEntityType="scene"
        relatedEntityId={currentScene.id}
        assetType="scene_image"
        label="Representative Scene Image"
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Action" value={currentScene.action} />
        <InfoBlock title="Emotion" value={currentScene.emotion} />
        <InfoBlock title="Camera" value={formatCamera(currentScene)} />
        <InfoBlock title="Lighting / Time" value={formatLighting(currentScene)} />
      </div>

      <div className="mt-5 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">
        <p className="text-sm font-semibold text-slate-300">Prompt Summary</p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {currentScene.prompt_summary ?? currentScene.description ?? 'No prompt summary'}
        </p>
      </div>

      {currentScene.negative_prompt && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm font-semibold text-slate-300">Negative Prompt</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {currentScene.negative_prompt}
          </p>
        </div>
      )}
    </article>
  )
}

type InfoBlockProps = {
  title: string
  value: string | null
}

function InfoBlock({ title, value }: InfoBlockProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {value ?? 'No data'}
      </p>
    </div>
  )
}

function formatCamera(scene: SceneWithDetails) {
  return [scene.camera_shot, scene.camera_angle].filter(Boolean).join(', ') || null
}

function formatLighting(scene: SceneWithDetails) {
  return [scene.lighting, scene.time_weather].filter(Boolean).join(', ') || null
}

function normalizeSceneStatus(status: SceneWithDetails['status']): SceneStatus {
  return status && SCENE_STATUS_OPTIONS.includes(status) ? status : 'draft'
}

function getStatusBadgeClassName(status: SceneStatus) {
  const baseClassName = 'rounded-full border px-3 py-1 text-xs font-semibold'

  if (status === 'approved' || status === 'video_ready') {
    return `${baseClassName} border-emerald-700 bg-emerald-950 text-emerald-100`
  }

  if (status === 'image_generated' || status === 'prompt_ready') {
    return `${baseClassName} border-cyan-700 bg-cyan-950 text-cyan-100`
  }

  if (status === 'archived') {
    return `${baseClassName} border-slate-700 bg-slate-950 text-slate-300`
  }

  return `${baseClassName} border-yellow-700 bg-yellow-950 text-yellow-100`
}

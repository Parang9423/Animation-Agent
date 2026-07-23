import { ApprovedAssetPreview } from '../assets/ApprovedAssetPreview'
import type { SceneWithDetails } from '../../services/sceneService'

type SceneCardProps = {
  scene: SceneWithDetails
}

export function SceneCard({ scene }: SceneCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-xs font-semibold text-cyan-100">
              Scene #{scene.sequence_no}
            </span>
            <span className={getStatusBadgeClassName(scene.status)}>
              {scene.status ?? 'draft'}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              {scene.scene_type ?? 'story'}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-semibold text-slate-100">
            {scene.title}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {scene.characters?.name ?? 'No character'} @{' '}
            {scene.locations?.name ?? 'No location'}
          </p>
        </div>

        <div className="text-right text-xs text-slate-500">
          <p>Updated: {new Date(scene.updated_at).toLocaleString()}</p>
          <p className="mt-1 font-mono">{scene.id.slice(0, 8)}</p>
        </div>
      </div>

      <ApprovedAssetPreview
        relatedEntityType="scene"
        relatedEntityId={scene.id}
        assetType="scene_image"
        label="Representative Scene Image"
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Action" value={scene.action} />
        <InfoBlock title="Emotion" value={scene.emotion} />
        <InfoBlock title="Camera" value={formatCamera(scene)} />
        <InfoBlock title="Lighting / Time" value={formatLighting(scene)} />
      </div>

      <div className="mt-5 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">
        <p className="text-sm font-semibold text-slate-300">Prompt Summary</p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {scene.prompt_summary ?? scene.description ?? 'No prompt summary'}
        </p>
      </div>

      {scene.negative_prompt && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm font-semibold text-slate-300">Negative Prompt</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {scene.negative_prompt}
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

function getStatusBadgeClassName(status: SceneWithDetails['status']) {
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

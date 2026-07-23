import { useEffect, useMemo, useState } from 'react'
import { ShotCard } from './ShotCard'
import { ShotCreateForm } from './ShotCreateForm'
import {
  getShotsByScene,
  type Shot,
} from '../../services/shotService'

type SceneShotsSectionProps = {
  projectId: string
  sceneId: string
}

export function SceneShotsSection({ projectId, sceneId }: SceneShotsSectionProps) {
  const [shots, setShots] = useState<Shot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadShots = () => {
    setIsLoading(true)
    getShotsByScene(sceneId)
      .then((data) => {
        setShots(data)
        setErrorMessage(null)
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Shot 목록 조회 중 오류가 발생했습니다.',
        )
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadShots()
  }, [sceneId])

  const nextShotOrder = useMemo(() => {
    const maxShotOrder = shots.reduce(
      (maxValue, shot) => Math.max(maxValue, shot.shot_order ?? 0),
      0,
    )

    return maxShotOrder + 1
  }, [shots])

  return (
    <section className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-300">Shots</p>
          <p className="mt-1 text-xs text-slate-500">
            Scene을 이미지/영상 생성 가능한 연속 Shot 단위로 관리합니다.
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
          {shots.length} shots
        </span>
      </div>

      <div className="mt-4">
        <ShotCreateForm
          projectId={projectId}
          sceneId={sceneId}
          nextShotOrder={nextShotOrder}
          onCreated={loadShots}
        />
      </div>

      {isLoading && <p className="mt-4 text-sm text-slate-400">Loading shots...</p>}

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && shots.length === 0 && (
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-400">
          아직 등록된 Shot이 없습니다. New Shot 폼으로 첫 Shot을 추가하세요.
        </div>
      )}

      <div className="mt-4 grid gap-4">
        {shots.map((shot) => (
          <ShotCard key={shot.id} shot={shot} onChanged={loadShots} />
        ))}
      </div>
    </section>
  )
}

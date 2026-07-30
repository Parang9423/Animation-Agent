import { useMemo, useState } from 'react'
import type { ProductionBoardRow } from '../../services/productionBoardService'

const QUICK_ACTION_BANNER_ID = 'production-quick-action-banner'

type ProductionBoardPanelProps = {
  rows: ProductionBoardRow[]
  isLoading: boolean
  errorMessage: string | null
  onRefresh: () => void
}

type StatusFilter = 'all' | ProductionBoardRow['progressStage']
type QuickActionSection = 'promptBuilder' | 'assets' | 'scenes'

const STATUS_FILTERS: StatusFilter[] = [
  'all',
  'prompt',
  'image',
  'video_prompt',
  'video',
  'complete',
]

export function ProductionBoardPanel({
  rows,
  isLoading,
  errorMessage,
  onRefresh,
}: ProductionBoardPanelProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [onlyMissingImage, setOnlyMissingImage] = useState(false)
  const [onlyMissingVideo, setOnlyMissingVideo] = useState(false)

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesStatus =
          statusFilter === 'all' || row.progressStage === statusFilter
        const matchesImage = !onlyMissingImage || !row.hasApprovedImage
        const matchesVideo = !onlyMissingVideo || !row.hasApprovedVideo

        return matchesStatus && matchesImage && matchesVideo
      }),
    [onlyMissingImage, onlyMissingVideo, rows, statusFilter],
  )

  const groupedRows = useMemo(() => groupRowsByScene(filteredRows), [filteredRows])
  const summary = useMemo(() => buildSummary(rows), [rows])

  const handleQuickAction = (row: ProductionBoardRow) => {
    const quickAction = getQuickAction(row)

    showQuickActionBanner(row, quickAction.section, quickAction.guidance)
    navigateToSection(quickAction.section)
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Production Board</h2>
          <p className="mt-1 text-sm text-slate-500">
            Scene/Shot 단위의 이미지, 영상, 다음 작업 상태를 한 화면에서 확인합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-xl border border-cyan-800 bg-cyan-950 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-950 disabled:text-slate-600"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Board'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <SummaryCard label="Total Shots" value={summary.totalShots} />
        <SummaryCard label="Image Ready" value={summary.imageReady} />
        <SummaryCard label="Video Ready" value={summary.videoReady} />
        <SummaryCard label="Need Image" value={summary.needImage} />
        <SummaryCard label="Need Video" value={summary.needVideo} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="min-w-56">
            <span className="text-sm text-slate-400">Progress Stage</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={onlyMissingImage}
              onChange={(event) => setOnlyMissingImage(event.target.checked)}
            />
            Only missing image
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={onlyMissingVideo}
              onChange={(event) => setOnlyMissingVideo(event.target.checked)}
            />
            Only missing video
          </label>
        </div>
      </div>

      {isLoading && <p className="mt-6 text-slate-400">Loading production board...</p>}

      {!isLoading && errorMessage && (
        <div className="mt-6 rounded-xl border border-red-500 bg-red-950 p-4 text-red-200">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && rows.length === 0 && (
        <EmptyState>조회된 Shot이 없습니다. Scenes 탭에서 Shot을 먼저 추가하세요.</EmptyState>
      )}

      {!isLoading && !errorMessage && rows.length > 0 && filteredRows.length === 0 && (
        <EmptyState>현재 필터 조건에 맞는 Shot이 없습니다.</EmptyState>
      )}

      <div className="mt-6 grid gap-5">
        {groupedRows.map((group) => (
          <SceneProductionGroup
            key={group.sceneKey}
            group={group}
            onQuickAction={handleQuickAction}
          />
        ))}
      </div>
    </section>
  )
}

type SceneGroup = {
  sceneKey: string
  sceneTitle: string
  sceneSequenceNo: number | null
  rows: ProductionBoardRow[]
}

function SceneProductionGroup({
  group,
  onQuickAction,
}: {
  group: SceneGroup
  onQuickAction: (row: ProductionBoardRow) => void
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-400">
            Scene #{group.sceneSequenceNo ?? '-'}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-100">
            {group.sceneTitle}
          </h3>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-300">
          {group.rows.length} shots
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1120px] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Shot</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Image</th>
              <th className="px-3 py-2">Video Prompt</th>
              <th className="px-3 py-2">Video</th>
              <th className="px-3 py-2">Next Action</th>
              <th className="px-3 py-2">Quick Action</th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map((row) => (
              <ProductionBoardTableRow
                key={row.id}
                row={row}
                onQuickAction={onQuickAction}
              />
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function ProductionBoardTableRow({
  row,
  onQuickAction,
}: {
  row: ProductionBoardRow
  onQuickAction: (row: ProductionBoardRow) => void
}) {
  const quickAction = getQuickAction(row)

  return (
    <tr className="rounded-xl bg-slate-950 align-top">
      <td className="rounded-l-xl px-3 py-3">
        <div className="flex items-start gap-3">
          {row.approvedImageAsset?.external_url ? (
            <img
              src={row.approvedImageAsset.external_url}
              alt={row.title}
              className="h-16 w-24 rounded-lg border border-slate-800 object-cover"
            />
          ) : (
            <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-xs text-slate-600">
              no image
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-100">
              #{row.shot_order} {row.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {row.shot_type ?? 'story'} · {row.duration_sec ?? 'N/A'} sec
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className={getStageBadgeClassName(row.progressStage)}>
          {row.progressStage}
        </span>
        <p className="mt-2 text-xs text-slate-500">DB: {row.status ?? 'draft'}</p>
      </td>
      <td className="px-3 py-3">
        <ReadyBadge isReady={row.hasApprovedImage} readyLabel="ready" missingLabel="missing" />
      </td>
      <td className="px-3 py-3">
        <ReadyBadge isReady={row.hasVideoPrompt} readyLabel="ready" missingLabel="missing" />
      </td>
      <td className="px-3 py-3">
        <ReadyBadge isReady={row.hasApprovedVideo} readyLabel="ready" missingLabel="missing" />
      </td>
      <td className="px-3 py-3">
        <p className="max-w-xs text-sm text-slate-300">{row.nextAction}</p>
      </td>
      <td className="rounded-r-xl px-3 py-3">
        <button
          type="button"
          onClick={() => onQuickAction(row)}
          className="rounded-xl border border-cyan-800 bg-cyan-950 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-900"
        >
          {quickAction.buttonLabel}
        </button>
        <p className="mt-2 max-w-40 text-xs leading-5 text-slate-500">
          {quickAction.targetLabel}
        </p>
      </td>
    </tr>
  )
}

function ReadyBadge({
  isReady,
  readyLabel,
  missingLabel,
}: {
  isReady: boolean
  readyLabel: string
  missingLabel: string
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        isReady
          ? 'border-emerald-700 bg-emerald-950 text-emerald-100'
          : 'border-yellow-700 bg-yellow-950 text-yellow-100'
      }`}
    >
      {isReady ? readyLabel : missingLabel}
    </span>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-100">{value}</p>
    </div>
  )
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
      {children}
    </div>
  )
}

function buildSummary(rows: ProductionBoardRow[]) {
  const imageReady = rows.filter((row) => row.hasApprovedImage).length
  const videoReady = rows.filter((row) => row.hasApprovedVideo).length

  return {
    totalShots: rows.length,
    imageReady,
    videoReady,
    needImage: rows.length - imageReady,
    needVideo: rows.length - videoReady,
  }
}

function groupRowsByScene(rows: ProductionBoardRow[]): SceneGroup[] {
  const groupMap = rows.reduce<Record<string, SceneGroup>>((groupedRows, row) => {
    const sceneKey = row.scene_id
    const currentGroup = groupedRows[sceneKey] ?? {
      sceneKey,
      sceneTitle: row.scenes?.title ?? 'Untitled Scene',
      sceneSequenceNo: row.scenes?.sequence_no ?? null,
      rows: [],
    }

    return {
      ...groupedRows,
      [sceneKey]: {
        ...currentGroup,
        rows: [...currentGroup.rows, row],
      },
    }
  }, {})

  return Object.values(groupMap).sort((firstGroup, secondGroup) => {
    const firstSequence = firstGroup.sceneSequenceNo ?? Number.MAX_SAFE_INTEGER
    const secondSequence = secondGroup.sceneSequenceNo ?? Number.MAX_SAFE_INTEGER

    return firstSequence - secondSequence
  })
}

function getQuickAction(row: ProductionBoardRow): {
  section: QuickActionSection
  buttonLabel: string
  targetLabel: string
  guidance: string
} {
  if (row.progressStage === 'prompt') {
    return {
      section: 'promptBuilder',
      buttonLabel: 'Build Image Prompt',
      targetLabel: 'Open Prompt Builder',
      guidance: 'Shot 모드에서 이 Shot을 선택한 뒤 이미지 프롬프트를 생성/저장하세요.',
    }
  }

  if (row.progressStage === 'image') {
    return {
      section: 'assets',
      buttonLabel: 'Upload Image Asset',
      targetLabel: 'Open Assets',
      guidance: '생성된 Shot 이미지를 업로드하고 candidate 또는 approved 상태로 저장하세요.',
    }
  }

  if (row.progressStage === 'video_prompt') {
    return {
      section: 'promptBuilder',
      buttonLabel: 'Build Video Prompt',
      targetLabel: 'Open Prompt Builder',
      guidance: 'Shot 모드에서 video 템플릿을 선택하고 identity-lock 비디오 프롬프트를 생성/저장하세요.',
    }
  }

  if (row.progressStage === 'video') {
    return {
      section: 'assets',
      buttonLabel: 'Upload Video Asset',
      targetLabel: 'Open Assets',
      guidance: 'Google Flow에서 생성한 Shot 영상을 video asset으로 업로드하고 approved 처리하세요.',
    }
  }

  return {
    section: 'scenes',
    buttonLabel: 'View Scene',
    targetLabel: 'Open Scenes',
    guidance: '해당 Scene의 ShotCard에서 승인 이미지와 승인 영상을 최종 확인하세요.',
  }
}

function navigateToSection(section: QuickActionSection) {
  const sectionLabelMap: Record<QuickActionSection, string> = {
    promptBuilder: 'Prompt Builder',
    assets: 'Assets',
    scenes: 'Scenes',
  }
  const targetLabel = sectionLabelMap[section]
  const targetButton = Array.from(document.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(targetLabel),
  )

  targetButton?.click()
}

function showQuickActionBanner(
  row: ProductionBoardRow,
  section: QuickActionSection,
  guidance: string,
) {
  document.getElementById(QUICK_ACTION_BANNER_ID)?.remove()

  const sectionLabelMap: Record<QuickActionSection, string> = {
    promptBuilder: 'Prompt Builder',
    assets: 'Assets',
    scenes: 'Scenes',
  }

  const banner = document.createElement('div')
  banner.id = QUICK_ACTION_BANNER_ID
  banner.className =
    'fixed right-6 top-6 z-50 max-w-xl rounded-2xl border border-cyan-700 bg-slate-950 px-5 py-4 text-sm text-slate-200 shadow-2xl shadow-black/40'

  const title = document.createElement('p')
  title.className = 'font-semibold text-cyan-100'
  title.textContent = `작업 대상: Scene #${row.scenes?.sequence_no ?? '-'} / Shot #${row.shot_order} ${row.title}`

  const body = document.createElement('p')
  body.className = 'mt-2 leading-6 text-slate-300'
  body.textContent = `${sectionLabelMap[section]}로 이동했습니다. ${guidance}`

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'mt-3 text-xs font-semibold text-cyan-300 hover:text-cyan-100'
  closeButton.textContent = 'Dismiss'
  closeButton.onclick = () => banner.remove()

  banner.append(title, body, closeButton)
  document.body.appendChild(banner)

  window.setTimeout(() => {
    banner.remove()
  }, 8000)
}

function getStageBadgeClassName(stage: ProductionBoardRow['progressStage']) {
  const baseClassName = 'rounded-full border px-3 py-1 text-xs font-semibold'

  if (stage === 'complete') {
    return `${baseClassName} border-emerald-700 bg-emerald-950 text-emerald-100`
  }

  if (stage === 'video' || stage === 'video_prompt') {
    return `${baseClassName} border-cyan-700 bg-cyan-950 text-cyan-100`
  }

  if (stage === 'image') {
    return `${baseClassName} border-blue-700 bg-blue-950 text-blue-100`
  }

  return `${baseClassName} border-yellow-700 bg-yellow-950 text-yellow-100`
}

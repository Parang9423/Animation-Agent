import type { PromptRunWithDetails } from '../../services/promptRunService'

type PromptRunCardProps = {
  promptRun: PromptRunWithDetails
}

export function PromptRunCard({ promptRun }: PromptRunCardProps) {
  const createdAt = new Date(promptRun.created_at).toLocaleString()
  const subjectLabel = getSubjectLabel(promptRun)

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
        </div>
      </div>

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

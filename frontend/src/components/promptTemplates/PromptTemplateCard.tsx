import type { PromptTemplate } from '../../services/promptTemplateService'

type PromptTemplateCardProps = {
  promptTemplate: PromptTemplate
}

export function PromptTemplateCard({ promptTemplate }: PromptTemplateCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-100">
            {promptTemplate.name}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {promptTemplate.target_tool ?? 'unknown tool'} / {promptTemplate.template_type ?? 'unknown type'}
          </p>
        </div>

        <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
          template
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">
        <p className="text-sm font-semibold text-slate-300">Template Body</p>
        <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
          {promptTemplate.template_body ?? 'No template body'}
        </pre>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Negative Prompt" value={promptTemplate.negative_prompt} />
        <InfoBlock title="Usage Notes" value={promptTemplate.usage_notes} />
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-sm font-semibold text-slate-300">Variables</p>
        <VariablesView variables={promptTemplate.variables} />
      </div>
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
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
        {value ?? 'No data'}
      </p>
    </div>
  )
}

type VariablesViewProps = {
  variables: PromptTemplate['variables']
}

function VariablesView({ variables }: VariablesViewProps) {
  if (!variables) {
    return <p className="mt-3 text-sm text-slate-500">No variables</p>
  }

  if (Array.isArray(variables)) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {variables.map((variable) => (
          <span
            key={variable}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300"
          >
            {variable}
          </span>
        ))}
      </div>
    )
  }

  return (
    <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
      {JSON.stringify(variables, null, 2)}
    </pre>
  )
}

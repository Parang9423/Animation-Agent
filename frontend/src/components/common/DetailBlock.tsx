type DetailBlockProps = {
  title: string
  value: string | null
  accent?: boolean
}

export function DetailBlock({ title, value, accent = false }: DetailBlockProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? 'border-cyan-900 bg-cyan-950/20'
          : 'border-slate-800 bg-slate-950'
      }`}
    >
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
        {value || 'No data'}
      </p>
    </div>
  )
}

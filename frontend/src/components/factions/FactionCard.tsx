import type { FactionWithWorldview } from '../../services/factionService'

type FactionCardProps = {
  faction: FactionWithWorldview
}

export function FactionCard({ faction }: FactionCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-100">
            {faction.name}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {faction.type ?? 'unknown type'} / {faction.worldviews?.name ?? 'No worldview'}
          </p>
        </div>

        <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
          faction
        </span>
      </div>

      <p className="mt-5 leading-7 text-slate-300">
        {faction.goal ?? 'No goal'}
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Values" value={faction.values} />
        <InfoBlock title="Technology Level" value={faction.technology_level} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Symbol" value={faction.symbol} />
        <InfoBlock title="Color Palette" value={faction.color_palette} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <TagList
          title="Representative Characters"
          items={faction.representative_characters}
        />
        <TagList title="Enemy Factions" items={faction.enemy_factions} />
      </div>

      <div className="mt-5 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">
        <p className="text-sm font-semibold text-slate-300">Prompt Summary</p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {faction.prompt_summary ?? 'No prompt summary'}
        </p>
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
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {value ?? 'No data'}
      </p>
    </div>
  )
}

type TagListProps = {
  title: string
  items: string[] | null
}

function TagList({ title, items }: TagListProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm font-semibold text-slate-300">{title}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {items && items.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300"
            >
              {item}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">No items</p>
        )}
      </div>
    </div>
  )
}

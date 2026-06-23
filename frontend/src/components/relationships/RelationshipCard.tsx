import type { RelationshipWithCharacters } from '../../services/relationshipService'

type RelationshipCardProps = {
  relationship: RelationshipWithCharacters
}

export function RelationshipCard({ relationship }: RelationshipCardProps) {
  const characterA = relationship.character_a?.name ?? 'Unknown Character A'
  const characterB = relationship.character_b?.name ?? 'Unknown Character B'

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-100">
            {characterA} ↔ {characterB}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {relationship.relationship_stage ?? 'unknown stage'}
          </p>
        </div>

        <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
          {relationship.relationship_type ?? 'relationship'}
        </span>
      </div>

      <p className="mt-5 leading-7 text-slate-300">
        {relationship.description ?? 'No description'}
      </p>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-sm font-semibold text-slate-300">Emotion</p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {relationship.emotion ?? 'No emotion'}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Past Event" value={relationship.past_event} />
        <InfoBlock
          title="Current Conflict"
          value={relationship.current_conflict}
        />
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

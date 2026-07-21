import { ApprovedAssetPreview } from '../assets/ApprovedAssetPreview'
import { DetailBlock } from '../common/DetailBlock'
import type { CharacterWithWorldview } from '../../services/characterService'

type CharacterDetailPanelProps = {
  character: CharacterWithWorldview
}

export function CharacterDetailPanel({ character }: CharacterDetailPanelProps) {
  return (
    <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
            Character Detail
          </p>

          <h2 className="mt-3 text-3xl font-bold">{character.name}</h2>

          <p className="mt-2 text-slate-400">
            {character.role} / {character.gender} / {character.age_range}
          </p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300">
          {character.worldviews?.name ?? 'No worldview'}
        </span>
      </div>

      <ApprovedAssetPreview
        relatedEntityType="character"
        relatedEntityId={character.id}
        assetType="character_image"
        label="Representative Character Image"
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <DetailBlock title="Personality" value={character.personality} />
        <DetailBlock title="Speech Style" value={character.speech_style} />
        <DetailBlock title="Appearance" value={character.appearance} />
        <DetailBlock title="Outfit" value={character.outfit} />
        <DetailBlock title="Goal" value={character.goal} />
        <DetailBlock title="Weakness" value={character.weakness} />
        <DetailBlock title="Backstory" value={character.backstory} />
        <DetailBlock
          title="Forbidden Settings"
          value={character.forbidden_settings}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <DetailBlock title="Prompt Summary" value={character.prompt_summary} accent />
        <DetailBlock title="Negative Prompt" value={character.negative_prompt} accent />
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-sm font-semibold text-slate-300">Signature Items</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {character.signature_items && character.signature_items.length > 0 ? (
            character.signature_items.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300"
              >
                {item}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">No signature items</p>
          )}
        </div>
      </div>
    </section>
  )
}

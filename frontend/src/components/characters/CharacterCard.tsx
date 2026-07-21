import { ApprovedAssetPreview } from '../assets/ApprovedAssetPreview'
import type { CharacterWithWorldview } from '../../services/characterService'

type CharacterCardProps = {
  character: CharacterWithWorldview
  isSelected: boolean
  onSelect: (character: CharacterWithWorldview) => void
}

export function CharacterCard({
  character,
  isSelected,
  onSelect,
}: CharacterCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(character)}
      className={`flex flex-col rounded-2xl border p-5 text-left shadow-lg shadow-black/20 transition ${
        isSelected
          ? 'border-cyan-500 bg-cyan-950/30'
          : 'border-slate-800 bg-slate-900 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{character.name}</h3>

          <p className="mt-1 text-sm text-slate-400">
            {character.role ?? 'unknown role'}
          </p>
        </div>

        <span className="rounded-full border border-blue-700 bg-blue-950 px-3 py-1 text-xs text-blue-200">
          {character.age_range ?? 'N/A'}
        </span>
      </div>

      <ApprovedAssetPreview
        relatedEntityType="character"
        relatedEntityId={character.id}
        assetType="character_image"
        label="Representative Image"
        compact
      />

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Worldview
        </p>
        <p className="mt-1 text-sm text-slate-200">
          {character.worldviews?.name ?? 'No worldview'}
        </p>
      </div>

      <p className="mt-4 line-clamp-5 text-sm leading-6 text-slate-300">
        {character.prompt_summary}
      </p>

      <div className="mt-auto pt-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">Goal</p>
        <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-400">
          {character.goal}
        </p>
      </div>
    </button>
  )
}

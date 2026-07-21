import type { AssetWithPromptRun } from '../../services/assetService'

type AssetCardProps = {
  asset: AssetWithPromptRun
}

export function AssetCard({ asset }: AssetCardProps) {
  const promptRunSubject = getPromptRunSubject(asset)
  const assetUrl = asset.external_url ?? asset.storage_path

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-xs font-semibold text-cyan-100">
              {asset.asset_type ?? 'asset'}
            </span>
            <span className="rounded-full border border-emerald-700 bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-100">
              {asset.status ?? 'candidate'}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              {asset.source_type ?? 'unknown source'}
            </span>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-100">
            {promptRunSubject}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Asset ID: {asset.id.slice(0, 8)} · Created:{' '}
            {new Date(asset.created_at).toLocaleString()}
          </p>
        </div>

        <div className="text-right text-xs text-slate-500">
          <p>Entity: {asset.related_entity_type ?? 'none'}</p>
          <p>Run: {asset.prompt_run_id?.slice(0, 8) ?? 'No run'}</p>
        </div>
      </div>

      {asset.external_url && isLikelyImageUrl(asset.external_url) && (
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <img
            src={asset.external_url}
            alt={promptRunSubject}
            className="max-h-[420px] w-full object-contain"
          />
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InfoBlock label="External URL" value={asset.external_url} />
        <InfoBlock label="Storage Path" value={asset.storage_path} />
      </div>

      {asset.prompt_used && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-300">Prompt Used</p>
          <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-400">
            {asset.prompt_used}
          </pre>
        </div>
      )}

      <details className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-300">
          Generation Metadata
        </summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-400">
          {JSON.stringify(asset.generation_metadata ?? {}, null, 2)}
        </pre>
      </details>
    </article>
  )
}

type InfoBlockProps = {
  label: string
  value: string | null
}

function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      {value ? (
        <p className="mt-2 break-words text-sm text-slate-300">{value}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-600">No value</p>
      )}
    </div>
  )
}

function getPromptRunSubject(asset: AssetWithPromptRun) {
  if (!asset.prompt_runs) {
    return `${asset.related_entity_type ?? 'Unlinked'} asset`
  }

  const characterName = asset.prompt_runs.characters?.name
  const locationName = asset.prompt_runs.locations?.name

  if (characterName && locationName) {
    return `${characterName} @ ${locationName}`
  }

  return characterName ?? locationName ?? `${asset.prompt_runs.prompt_type} prompt run`
}

function isLikelyImageUrl(url: string) {
  return /\.(png|jpg|jpeg|webp|gif)(\?.*)?$/i.test(url)
}

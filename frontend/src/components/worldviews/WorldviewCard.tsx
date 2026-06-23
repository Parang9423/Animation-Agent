import type { Worldview } from '../../services/worldviewService'

type WorldviewCardProps = {
  worldview: Worldview
}

export function WorldviewCard({ worldview }: WorldviewCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-100">
            {worldview.name}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {worldview.era ?? 'unknown era'} / {worldview.civilization_level ?? 'unknown civilization'}
          </p>
        </div>

        <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
          worldview
        </span>
      </div>

      <p className="mt-5 leading-7 text-slate-300">
        {worldview.summary ?? 'No summary'}
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Core Rules" value={worldview.core_rules} />
        <InfoBlock
          title="Science / Magic Rules"
          value={worldview.science_or_magic_rules}
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-sm font-semibold text-slate-300">Visual Tone</p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {worldview.visual_tone ?? 'No visual tone'}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-cyan-900 bg-cyan-950/20 p-4">
        <p className="text-sm font-semibold text-slate-300">Prompt Summary</p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {worldview.prompt_summary ?? 'No prompt summary'}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <TagList title="Major Regions" items={worldview.major_regions} />
        <MajorEventsList events={worldview.major_events} />
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

type MajorEventsListProps = {
  events:
    | Array<{
        name?: string
        description?: string
      }>
    | string[]
    | null
}

function MajorEventsList({ events }: MajorEventsListProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm font-semibold text-slate-300">Major Events</p>

      <div className="mt-3 grid gap-3">
        {events && events.length > 0 ? (
          events.map((event, index) => {
            if (typeof event === 'string') {
              return (
                <p key={event} className="text-sm leading-6 text-slate-400">
                  {event}
                </p>
              )
            }

            return (
              <div key={`${event.name ?? 'event'}-${index}`}>
                <p className="text-sm font-medium text-slate-300">
                  {event.name ?? `Event ${index + 1}`}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {event.description ?? 'No description'}
                </p>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-slate-500">No events</p>
        )}
      </div>
    </div>
  )
}

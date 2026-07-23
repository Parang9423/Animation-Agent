export type AppSection =
  | 'overview'
  | 'characters'
  | 'worldviews'
  | 'locations'
  | 'scenes'
  | 'factions'
  | 'relationships'
  | 'promptBuilder'
  | 'promptRuns'
  | 'assets'
  | 'promptTemplates'

type SidebarProps = {
  activeSection: AppSection
  onSectionChange: (section: AppSection) => void
}

type NavItem = {
  id: AppSection
  label: string
  description: string
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Project summary',
  },
  {
    id: 'characters',
    label: 'Characters',
    description: 'Cast and details',
  },
  {
    id: 'worldviews',
    label: 'Worldviews',
    description: 'World rules',
  },
  {
    id: 'locations',
    label: 'Locations',
    description: 'Places and backgrounds',
  },
  {
    id: 'scenes',
    label: 'Scenes',
    description: 'Story beats and shots',
  },
  {
    id: 'factions',
    label: 'Factions',
    description: 'Groups and powers',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    description: 'Character links',
  },
  {
    id: 'promptBuilder',
    label: 'Prompt Builder',
    description: 'Generate final prompts',
  },
  {
    id: 'promptRuns',
    label: 'Prompt Runs',
    description: 'Saved generations',
  },
  {
    id: 'assets',
    label: 'Assets',
    description: 'Generated outputs',
  },
  {
    id: 'promptTemplates',
    label: 'Prompt Templates',
    description: 'Google Flow prompts',
  },
]

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-950/95 px-5 py-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-400">
          Animation Agent
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-100">
          Story IP DB
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Eternal Rift 세계관 제작 데이터를 관리하는 MVP 대시보드입니다.
        </p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? 'border-cyan-500 bg-cyan-950/30 text-slate-100'
                  : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-1 block text-xs text-slate-500">
                {item.description}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Current Project
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-200">
          Eternal Rift
        </p>
        <p className="mt-1 text-xs text-slate-500">
          science_fantasy / Google Flow-ready
        </p>
      </div>
    </aside>
  )
}

import type { ReactNode } from 'react'
import { Sidebar, type AppSection } from './Sidebar'

type AppLayoutProps = {
  activeSection: AppSection
  onSectionChange: (section: AppSection) => void
  children: ReactNode
}

export function AppLayout({
  activeSection,
  onSectionChange,
  children,
}: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />

        <div className="min-w-0 flex-1 px-8 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </main>
  )
}

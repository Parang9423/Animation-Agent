import { useEffect, useState } from 'react'
import { CharacterCard } from './components/characters/CharacterCard'
import { CharacterDetailPanel } from './components/characters/CharacterDetailPanel'
import { FactionCard } from './components/factions/FactionCard'
import { LocationCard } from './components/locations/LocationCard'
import { ProjectCard } from './components/projects/ProjectCard'
import { PromptBuilderPanel } from './components/promptBuilder/PromptBuilderPanel'
import { PromptTemplateCard } from './components/promptTemplates/PromptTemplateCard'
import { RelationshipCard } from './components/relationships/RelationshipCard'
import { WorldviewCard } from './components/worldviews/WorldviewCard'
import { AppLayout } from './layouts/AppLayout'
import type { AppSection } from './layouts/Sidebar'
import { getProjects, type Project } from './services/projectService'
import {
  getCharactersByProject,
  type CharacterWithWorldview,
} from './services/characterService'
import {
  getFactionsByProject,
  type FactionWithWorldview,
} from './services/factionService'
import {
  getLocationsByProject,
  type LocationWithWorldview,
} from './services/locationService'
import {
  getPromptTemplatesByProject,
  type PromptTemplate,
} from './services/promptTemplateService'
import {
  getRelationshipsByProject,
  type RelationshipWithCharacters,
} from './services/relationshipService'
import {
  getStyleGuidesByProject,
  type StyleGuide,
} from './services/styleGuideService'
import {
  getWorldviewsByProject,
  type Worldview,
} from './services/worldviewService'
import './App.css'

const ETERNAL_RIFT_PROJECT_ID = '00000000-0000-4000-8000-000000000001'

function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('overview')
  const [projects, setProjects] = useState<Project[]>([])
  const [characters, setCharacters] = useState<CharacterWithWorldview[]>([])
  const [worldviews, setWorldviews] = useState<Worldview[]>([])
  const [locations, setLocations] = useState<LocationWithWorldview[]>([])
  const [factions, setFactions] = useState<FactionWithWorldview[]>([])
  const [relationships, setRelationships] = useState<RelationshipWithCharacters[]>([])
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([])
  const [styleGuides, setStyleGuides] = useState<StyleGuide[]>([])
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterWithWorldview | null>(null)

  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true)
  const [isLoadingWorldviews, setIsLoadingWorldviews] = useState(true)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [isLoadingFactions, setIsLoadingFactions] = useState(true)
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(true)
  const [isLoadingPromptTemplates, setIsLoadingPromptTemplates] = useState(true)
  const [isLoadingStyleGuides, setIsLoadingStyleGuides] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    getProjects()
      .then((data) => {
        setProjects(data)
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
      .finally(() => {
        setIsLoadingProjects(false)
      })

    getCharactersByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => {
        setCharacters(data)
        setSelectedCharacter(data[0] ?? null)
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
      .finally(() => {
        setIsLoadingCharacters(false)
      })

    getWorldviewsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => {
        setWorldviews(data)
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
      .finally(() => {
        setIsLoadingWorldviews(false)
      })

    getLocationsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => {
        setLocations(data)
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
      .finally(() => {
        setIsLoadingLocations(false)
      })

    getFactionsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => {
        setFactions(data)
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
      .finally(() => {
        setIsLoadingFactions(false)
      })

    getRelationshipsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => {
        setRelationships(data)
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
      .finally(() => {
        setIsLoadingRelationships(false)
      })

    getPromptTemplatesByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => {
        setPromptTemplates(data)
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
      .finally(() => {
        setIsLoadingPromptTemplates(false)
      })

    getStyleGuidesByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => {
        setStyleGuides(data)
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
      .finally(() => {
        setIsLoadingStyleGuides(false)
      })
  }, [])

  return (
    <AppLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      <PageIntro activeSection={activeSection} />

      {errorMessage && (
        <div className="mt-8 rounded-xl border border-red-500 bg-red-950 p-4 text-red-200">
          <p className="font-semibold">Supabase 조회 오류</p>
          <p className="mt-2 text-sm">{errorMessage}</p>
        </div>
      )}

      {activeSection === 'overview' && (
        <OverviewSection
          projects={projects}
          characters={characters}
          worldviews={worldviews}
          locations={locations}
          factions={factions}
          relationships={relationships}
          promptTemplates={promptTemplates}
          styleGuides={styleGuides}
          isLoadingProjects={isLoadingProjects}
          errorMessage={errorMessage}
        />
      )}

      {activeSection === 'characters' && (
        <CharactersSection
          characters={characters}
          selectedCharacter={selectedCharacter}
          isLoadingCharacters={isLoadingCharacters}
          errorMessage={errorMessage}
          onSelectCharacter={setSelectedCharacter}
        />
      )}

      {activeSection === 'worldviews' && (
        <WorldviewsSection
          worldviews={worldviews}
          isLoadingWorldviews={isLoadingWorldviews}
          errorMessage={errorMessage}
        />
      )}

      {activeSection === 'locations' && (
        <LocationsSection
          locations={locations}
          isLoadingLocations={isLoadingLocations}
          errorMessage={errorMessage}
        />
      )}

      {activeSection === 'factions' && (
        <FactionsSection
          factions={factions}
          isLoadingFactions={isLoadingFactions}
          errorMessage={errorMessage}
        />
      )}

      {activeSection === 'relationships' && (
        <RelationshipsSection
          relationships={relationships}
          isLoadingRelationships={isLoadingRelationships}
          errorMessage={errorMessage}
        />
      )}

      {activeSection === 'promptBuilder' && (
        <PromptBuilderPanel
          characters={characters}
          promptTemplates={promptTemplates}
          styleGuides={styleGuides}
          isLoadingStyleGuides={isLoadingStyleGuides}
        />
      )}

      {activeSection === 'promptTemplates' && (
        <PromptTemplatesSection
          promptTemplates={promptTemplates}
          isLoadingPromptTemplates={isLoadingPromptTemplates}
          errorMessage={errorMessage}
        />
      )}
    </AppLayout>
  )
}

type PageIntroProps = {
  activeSection: AppSection
}

function PageIntro({ activeSection }: PageIntroProps) {
  const sectionTitleMap: Record<AppSection, string> = {
    overview: 'Overview',
    characters: 'Characters',
    worldviews: 'Worldviews',
    locations: 'Locations',
    factions: 'Factions',
    relationships: 'Relationships',
    promptBuilder: 'Prompt Builder',
    promptTemplates: 'Prompt Templates',
  }

  const sectionDescriptionMap: Record<AppSection, string> = {
    overview:
      'Supabase에 저장된 프로젝트와 핵심 제작 데이터를 한눈에 확인합니다.',
    characters:
      'Eternal Rift 캐릭터 목록과 선택한 캐릭터의 상세 설정을 확인합니다.',
    worldviews:
      'Eternal Rift 세계관 규칙, 문명 수준, 시각 톤, 프롬프트 요약을 확인합니다.',
    locations:
      'Eternal Rift 장소와 배경 프롬프트 데이터를 확인합니다.',
    factions:
      'Eternal Rift 세력, 조직, 문명 정보를 확인합니다.',
    relationships:
      'Eternal Rift 캐릭터 간 관계, 감정선, 갈등 구조를 확인합니다.',
    promptBuilder:
      '캐릭터 데이터, 스타일 가이드, 프롬프트 템플릿을 조합해 Google Flow용 최종 프롬프트를 생성합니다.',
    promptTemplates:
      'Google Flow용 프롬프트 템플릿과 변수를 확인합니다.',
  }

  return (
    <header>
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
        Animation Agent
      </p>

      <h1 className="mt-3 text-4xl font-bold">
        {sectionTitleMap[activeSection]}
      </h1>

      <p className="mt-3 text-slate-400">
        {sectionDescriptionMap[activeSection]}
      </p>
    </header>
  )
}

type OverviewSectionProps = {
  projects: Project[]
  characters: CharacterWithWorldview[]
  worldviews: Worldview[]
  locations: LocationWithWorldview[]
  factions: FactionWithWorldview[]
  relationships: RelationshipWithCharacters[]
  promptTemplates: PromptTemplate[]
  styleGuides: StyleGuide[]
  isLoadingProjects: boolean
  errorMessage: string | null
}

function OverviewSection({
  projects,
  characters,
  worldviews,
  locations,
  factions,
  relationships,
  promptTemplates,
  styleGuides,
  isLoadingProjects,
  errorMessage,
}: OverviewSectionProps) {
  return (
    <>
      <section className="mt-8 grid gap-4 md:grid-cols-4 xl:grid-cols-9">
        <SummaryCard label="Projects" value={projects.length} />
        <SummaryCard label="Characters" value={characters.length} />
        <SummaryCard label="Worldviews" value={worldviews.length} />
        <SummaryCard label="Locations" value={locations.length} />
        <SummaryCard label="Factions" value={factions.length} />
        <SummaryCard label="Relations" value={relationships.length} />
        <SummaryCard label="Templates" value={promptTemplates.length} />
        <SummaryCard label="Styles" value={styleGuides.length} />
        <SummaryCard label="Current MVP" value="Prompt" />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Projects</h2>
            <p className="mt-1 text-sm text-slate-500">
              Story IP 프로젝트 기본 정보
            </p>
          </div>
        </div>

        {isLoadingProjects && (
          <p className="text-slate-400">Loading projects...</p>
        )}

        {!isLoadingProjects && !errorMessage && projects.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
            조회된 프로젝트가 없습니다.
          </div>
        )}

        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </>
  )
}

type CharactersSectionProps = {
  characters: CharacterWithWorldview[]
  selectedCharacter: CharacterWithWorldview | null
  isLoadingCharacters: boolean
  errorMessage: string | null
  onSelectCharacter: (character: CharacterWithWorldview) => void
}

function CharactersSection({
  characters,
  selectedCharacter,
  isLoadingCharacters,
  errorMessage,
  onSelectCharacter,
}: CharactersSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Characters</h2>
          <p className="mt-1 text-sm text-slate-500">
            Eternal Rift 주요 캐릭터 목록
          </p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
          {characters.length} characters
        </span>
      </div>

      {isLoadingCharacters && (
        <p className="text-slate-400">Loading characters...</p>
      )}

      {!isLoadingCharacters && !errorMessage && characters.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
          조회된 캐릭터가 없습니다.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={selectedCharacter?.id === character.id}
            onSelect={onSelectCharacter}
          />
        ))}
      </div>

      {selectedCharacter && (
        <CharacterDetailPanel character={selectedCharacter} />
      )}
    </section>
  )
}

type WorldviewsSectionProps = {
  worldviews: Worldview[]
  isLoadingWorldviews: boolean
  errorMessage: string | null
}

function WorldviewsSection({
  worldviews,
  isLoadingWorldviews,
  errorMessage,
}: WorldviewsSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Worldviews</h2>
          <p className="mt-1 text-sm text-slate-500">
            Eternal Rift 세계관 목록
          </p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
          {worldviews.length} worldviews
        </span>
      </div>

      {isLoadingWorldviews && (
        <p className="text-slate-400">Loading worldviews...</p>
      )}

      {!isLoadingWorldviews && !errorMessage && worldviews.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
          조회된 세계관이 없습니다.
        </div>
      )}

      <div className="grid gap-5">
        {worldviews.map((worldview) => (
          <WorldviewCard key={worldview.id} worldview={worldview} />
        ))}
      </div>
    </section>
  )
}

type LocationsSectionProps = {
  locations: LocationWithWorldview[]
  isLoadingLocations: boolean
  errorMessage: string | null
}

function LocationsSection({
  locations,
  isLoadingLocations,
  errorMessage,
}: LocationsSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Locations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Eternal Rift 장소와 배경 목록
          </p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
          {locations.length} locations
        </span>
      </div>

      {isLoadingLocations && (
        <p className="text-slate-400">Loading locations...</p>
      )}

      {!isLoadingLocations && !errorMessage && locations.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
          조회된 장소가 없습니다.
        </div>
      )}

      <div className="grid gap-5">
        {locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </section>
  )
}

type FactionsSectionProps = {
  factions: FactionWithWorldview[]
  isLoadingFactions: boolean
  errorMessage: string | null
}

function FactionsSection({
  factions,
  isLoadingFactions,
  errorMessage,
}: FactionsSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Factions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Eternal Rift 세력과 문명 목록
          </p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
          {factions.length} factions
        </span>
      </div>

      {isLoadingFactions && (
        <p className="text-slate-400">Loading factions...</p>
      )}

      {!isLoadingFactions && !errorMessage && factions.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
          조회된 세력이 없습니다.
        </div>
      )}

      <div className="grid gap-5">
        {factions.map((faction) => (
          <FactionCard key={faction.id} faction={faction} />
        ))}
      </div>
    </section>
  )
}

type RelationshipsSectionProps = {
  relationships: RelationshipWithCharacters[]
  isLoadingRelationships: boolean
  errorMessage: string | null
}

function RelationshipsSection({
  relationships,
  isLoadingRelationships,
  errorMessage,
}: RelationshipsSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Relationships</h2>
          <p className="mt-1 text-sm text-slate-500">
            Eternal Rift 캐릭터 관계와 갈등 구조
          </p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
          {relationships.length} relationships
        </span>
      </div>

      {isLoadingRelationships && (
        <p className="text-slate-400">Loading relationships...</p>
      )}

      {!isLoadingRelationships && !errorMessage && relationships.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
          조회된 관계가 없습니다.
        </div>
      )}

      <div className="grid gap-5">
        {relationships.map((relationship) => (
          <RelationshipCard
            key={relationship.id}
            relationship={relationship}
          />
        ))}
      </div>
    </section>
  )
}

type PromptTemplatesSectionProps = {
  promptTemplates: PromptTemplate[]
  isLoadingPromptTemplates: boolean
  errorMessage: string | null
}

function PromptTemplatesSection({
  promptTemplates,
  isLoadingPromptTemplates,
  errorMessage,
}: PromptTemplatesSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Prompt Templates</h2>
          <p className="mt-1 text-sm text-slate-500">
            Google Flow용 프롬프트 템플릿 목록
          </p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
          {promptTemplates.length} templates
        </span>
      </div>

      {isLoadingPromptTemplates && (
        <p className="text-slate-400">Loading prompt templates...</p>
      )}

      {!isLoadingPromptTemplates && !errorMessage && promptTemplates.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
          조회된 프롬프트 템플릿이 없습니다.
        </div>
      )}

      <div className="grid gap-5">
        {promptTemplates.map((promptTemplate) => (
          <PromptTemplateCard
            key={promptTemplate.id}
            promptTemplate={promptTemplate}
          />
        ))}
      </div>
    </section>
  )
}

type SummaryCardProps = {
  label: string
  value: number | string
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-100">{value}</p>
    </div>
  )
}

export default App

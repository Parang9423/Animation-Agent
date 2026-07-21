import { useEffect, useMemo, useState } from 'react'
import { AssetCard } from './components/assets/AssetCard'
import { AssetCreateForm } from './components/assets/AssetCreateForm'
import { CharacterCard } from './components/characters/CharacterCard'
import { CharacterDetailPanel } from './components/characters/CharacterDetailPanel'
import { FactionCard } from './components/factions/FactionCard'
import { LocationCard } from './components/locations/LocationCard'
import { ProjectCard } from './components/projects/ProjectCard'
import { PromptBuilderPanel } from './components/promptBuilder/PromptBuilderPanel'
import { PromptRunCard } from './components/promptRuns/PromptRunCard'
import { PromptTemplateCard } from './components/promptTemplates/PromptTemplateCard'
import { RelationshipCard } from './components/relationships/RelationshipCard'
import { WorldviewCard } from './components/worldviews/WorldviewCard'
import { AppLayout } from './layouts/AppLayout'
import type { AppSection } from './layouts/Sidebar'
import {
  getAssetsByProject,
  type AssetWithPromptRun,
} from './services/assetService'
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
  getPromptRunsByProject,
  type PromptRunWithDetails,
} from './services/promptRunService'
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
  const [promptRuns, setPromptRuns] = useState<PromptRunWithDetails[]>([])
  const [assets, setAssets] = useState<AssetWithPromptRun[]>([])
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
  const [isLoadingPromptRuns, setIsLoadingPromptRuns] = useState(true)
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)
  const [isLoadingStyleGuides, setIsLoadingStyleGuides] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadAssets = () => {
    setIsLoadingAssets(true)
    getAssetsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => {
        setAssets(data)
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
      .finally(() => {
        setIsLoadingAssets(false)
      })
  }

  useEffect(() => {
    getProjects()
      .then((data) => setProjects(data))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingProjects(false))

    getCharactersByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => {
        setCharacters(data)
        setSelectedCharacter(data[0] ?? null)
      })
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingCharacters(false))

    getWorldviewsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => setWorldviews(data))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingWorldviews(false))

    getLocationsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => setLocations(data))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingLocations(false))

    getFactionsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => setFactions(data))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingFactions(false))

    getRelationshipsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => setRelationships(data))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingRelationships(false))

    getPromptTemplatesByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => setPromptTemplates(data))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingPromptTemplates(false))

    getPromptRunsByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => setPromptRuns(data))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingPromptRuns(false))

    loadAssets()

    getStyleGuidesByProject(ETERNAL_RIFT_PROJECT_ID)
      .then((data) => setStyleGuides(data))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoadingStyleGuides(false))
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
          promptRuns={promptRuns}
          assets={assets}
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
          projectId={ETERNAL_RIFT_PROJECT_ID}
          characters={characters}
          locations={locations}
          promptTemplates={promptTemplates}
          styleGuides={styleGuides}
          isLoadingStyleGuides={isLoadingStyleGuides}
        />
      )}

      {activeSection === 'promptRuns' && (
        <PromptRunsSection
          promptRuns={promptRuns}
          isLoadingPromptRuns={isLoadingPromptRuns}
          errorMessage={errorMessage}
        />
      )}

      {activeSection === 'assets' && (
        <AssetsSection
          projectId={ETERNAL_RIFT_PROJECT_ID}
          assets={assets}
          promptRuns={promptRuns}
          isLoadingAssets={isLoadingAssets}
          errorMessage={errorMessage}
          onAssetCreated={loadAssets}
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
    promptRuns: 'Prompt Runs',
    assets: 'Assets',
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
      '캐릭터/장소/장면 데이터, 스타일 가이드, 프롬프트 템플릿을 조합해 Google Flow용 최종 프롬프트를 생성하고 실행 기록으로 저장합니다.',
    promptRuns:
      'Prompt Builder에서 저장한 프롬프트 실행 기록과 입력 스냅샷을 확인합니다.',
    assets:
      'Google Flow 생성 결과 이미지와 영상 후보를 등록하고 prompt run과 연결합니다.',
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
  promptRuns: PromptRunWithDetails[]
  assets: AssetWithPromptRun[]
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
  promptRuns,
  assets,
  styleGuides,
  isLoadingProjects,
  errorMessage,
}: OverviewSectionProps) {
  return (
    <>
      <section className="mt-8 grid gap-4 md:grid-cols-4 xl:grid-cols-11">
        <SummaryCard label="Projects" value={projects.length} />
        <SummaryCard label="Characters" value={characters.length} />
        <SummaryCard label="Worldviews" value={worldviews.length} />
        <SummaryCard label="Locations" value={locations.length} />
        <SummaryCard label="Factions" value={factions.length} />
        <SummaryCard label="Relations" value={relationships.length} />
        <SummaryCard label="Templates" value={promptTemplates.length} />
        <SummaryCard label="Runs" value={promptRuns.length} />
        <SummaryCard label="Assets" value={assets.length} />
        <SummaryCard label="Styles" value={styleGuides.length} />
        <SummaryCard label="Current MVP" value="Assets" />
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
      <SectionHeader
        title="Characters"
        description="Eternal Rift 주요 캐릭터 목록"
        countLabel={`${characters.length} characters`}
      />

      {isLoadingCharacters && (
        <p className="text-slate-400">Loading characters...</p>
      )}

      {!isLoadingCharacters && !errorMessage && characters.length === 0 && (
        <EmptyState>조회된 캐릭터가 없습니다.</EmptyState>
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
      <SectionHeader
        title="Worldviews"
        description="Eternal Rift 세계관 목록"
        countLabel={`${worldviews.length} worldviews`}
      />

      {isLoadingWorldviews && (
        <p className="text-slate-400">Loading worldviews...</p>
      )}

      {!isLoadingWorldviews && !errorMessage && worldviews.length === 0 && (
        <EmptyState>조회된 세계관이 없습니다.</EmptyState>
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
      <SectionHeader
        title="Locations"
        description="Eternal Rift 장소와 배경 목록"
        countLabel={`${locations.length} locations`}
      />

      {isLoadingLocations && (
        <p className="text-slate-400">Loading locations...</p>
      )}

      {!isLoadingLocations && !errorMessage && locations.length === 0 && (
        <EmptyState>조회된 장소가 없습니다.</EmptyState>
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
      <SectionHeader
        title="Factions"
        description="Eternal Rift 세력과 문명 목록"
        countLabel={`${factions.length} factions`}
      />

      {isLoadingFactions && (
        <p className="text-slate-400">Loading factions...</p>
      )}

      {!isLoadingFactions && !errorMessage && factions.length === 0 && (
        <EmptyState>조회된 세력이 없습니다.</EmptyState>
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
      <SectionHeader
        title="Relationships"
        description="Eternal Rift 캐릭터 관계와 갈등 구조"
        countLabel={`${relationships.length} relationships`}
      />

      {isLoadingRelationships && (
        <p className="text-slate-400">Loading relationships...</p>
      )}

      {!isLoadingRelationships && !errorMessage && relationships.length === 0 && (
        <EmptyState>조회된 관계가 없습니다.</EmptyState>
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

type PromptRunsSectionProps = {
  promptRuns: PromptRunWithDetails[]
  isLoadingPromptRuns: boolean
  errorMessage: string | null
}

function PromptRunsSection({
  promptRuns,
  isLoadingPromptRuns,
  errorMessage,
}: PromptRunsSectionProps) {
  return (
    <section className="mt-8">
      <SectionHeader
        title="Prompt Runs"
        description="Prompt Builder에서 저장한 프롬프트 실행 기록"
        countLabel={`${promptRuns.length} runs`}
      />

      {isLoadingPromptRuns && (
        <p className="text-slate-400">Loading prompt runs...</p>
      )}

      {!isLoadingPromptRuns && !errorMessage && promptRuns.length === 0 && (
        <EmptyState>저장된 Prompt Run이 없습니다.</EmptyState>
      )}

      <div className="grid gap-5">
        {promptRuns.map((promptRun) => (
          <PromptRunCard key={promptRun.id} promptRun={promptRun} />
        ))}
      </div>
    </section>
  )
}

type AssetFilterValue = 'all' | string
type PromptRunLinkFilter = 'all' | 'linked' | 'unlinked'

type AssetsSectionProps = {
  projectId: string
  assets: AssetWithPromptRun[]
  promptRuns: PromptRunWithDetails[]
  isLoadingAssets: boolean
  errorMessage: string | null
  onAssetCreated: () => void
}

function AssetsSection({
  projectId,
  assets,
  promptRuns,
  isLoadingAssets,
  errorMessage,
  onAssetCreated,
}: AssetsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<AssetFilterValue>('all')
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetFilterValue>('all')
  const [sourceTypeFilter, setSourceTypeFilter] = useState<AssetFilterValue>('all')
  const [promptRunLinkFilter, setPromptRunLinkFilter] =
    useState<PromptRunLinkFilter>('all')

  const assetTypeOptions = useMemo(
    () => buildStringOptions(assets.map((asset) => asset.asset_type)),
    [assets],
  )
  const sourceTypeOptions = useMemo(
    () => buildStringOptions(assets.map((asset) => asset.source_type)),
    [assets],
  )
  const statusOptions = useMemo(
    () => buildStringOptions(assets.map((asset) => asset.status)),
    [assets],
  )

  const filteredAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const matchesStatus =
          statusFilter === 'all' || asset.status === statusFilter
        const matchesAssetType =
          assetTypeFilter === 'all' || asset.asset_type === assetTypeFilter
        const matchesSourceType =
          sourceTypeFilter === 'all' || asset.source_type === sourceTypeFilter
        const matchesPromptRunLink =
          promptRunLinkFilter === 'all' ||
          (promptRunLinkFilter === 'linked' && Boolean(asset.prompt_run_id)) ||
          (promptRunLinkFilter === 'unlinked' && !asset.prompt_run_id)

        return (
          matchesStatus &&
          matchesAssetType &&
          matchesSourceType &&
          matchesPromptRunLink
        )
      }),
    [
      assets,
      assetTypeFilter,
      promptRunLinkFilter,
      sourceTypeFilter,
      statusFilter,
    ],
  )

  const resetFilters = () => {
    setStatusFilter('all')
    setAssetTypeFilter('all')
    setSourceTypeFilter('all')
    setPromptRunLinkFilter('all')
  }

  return (
    <section className="mt-8">
      <SectionHeader
        title="Assets"
        description="Google Flow 생성 결과와 외부 산출물을 prompt run에 연결합니다."
        countLabel={`${filteredAssets.length} / ${assets.length} assets`}
      />

      <AssetCreateForm
        projectId={projectId}
        promptRuns={promptRuns}
        onCreated={onAssetCreated}
      />

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Asset Filters</h3>
            <p className="mt-1 text-sm text-slate-500">
              상태, 유형, 출처, prompt_run 연결 여부로 Asset 목록을 필터링합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-700 hover:text-cyan-100"
          >
            Reset Filters
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <FilterSelect
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />
          <FilterSelect
            label="Asset Type"
            value={assetTypeFilter}
            options={assetTypeOptions}
            onChange={setAssetTypeFilter}
          />
          <FilterSelect
            label="Source Type"
            value={sourceTypeFilter}
            options={sourceTypeOptions}
            onChange={setSourceTypeFilter}
          />
          <label className="block">
            <span className="text-sm text-slate-400">Prompt Run Link</span>
            <select
              value={promptRunLinkFilter}
              onChange={(event) =>
                setPromptRunLinkFilter(event.target.value as PromptRunLinkFilter)
              }
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="all">all</option>
              <option value="linked">linked</option>
              <option value="unlinked">unlinked</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8">
        {isLoadingAssets && <p className="text-slate-400">Loading assets...</p>}

        {!isLoadingAssets && !errorMessage && assets.length === 0 && (
          <EmptyState>등록된 Asset이 없습니다.</EmptyState>
        )}

        {!isLoadingAssets &&
          !errorMessage &&
          assets.length > 0 &&
          filteredAssets.length === 0 && (
            <EmptyState>현재 필터 조건에 맞는 Asset이 없습니다.</EmptyState>
          )}

        <div className="grid gap-5">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </section>
  )
}

type FilterSelectProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function buildStringOptions(values: Array<string | null>) {
  const uniqueValues = Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  ).sort((firstValue, secondValue) => firstValue.localeCompare(secondValue))

  return ['all', ...uniqueValues]
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
      <SectionHeader
        title="Prompt Templates"
        description="Google Flow용 프롬프트 템플릿 목록"
        countLabel={`${promptTemplates.length} templates`}
      />

      {isLoadingPromptTemplates && (
        <p className="text-slate-400">Loading prompt templates...</p>
      )}

      {!isLoadingPromptTemplates && !errorMessage && promptTemplates.length === 0 && (
        <EmptyState>조회된 프롬프트 템플릿이 없습니다.</EmptyState>
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

type SectionHeaderProps = {
  title: string
  description: string
  countLabel: string
}

function SectionHeader({ title, description, countLabel }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
        {countLabel}
      </span>
    </div>
  )
}

type EmptyStateProps = {
  children: string
}

function EmptyState({ children }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
      {children}
    </div>
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

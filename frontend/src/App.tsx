import { useEffect, useState } from 'react'
import { getProjects, type Project } from './services/projectService'
import {
  getCharactersByProject,
  type CharacterWithWorldview,
} from './services/characterService'
import './App.css'

const ETERNAL_RIFT_PROJECT_ID = '00000000-0000-4000-8000-000000000001'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [characters, setCharacters] = useState<CharacterWithWorldview[]>([])
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterWithWorldview | null>(null)

  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true)
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
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
          Animation Agent
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Story IP Database Viewer
        </h1>

        <p className="mt-3 text-slate-400">
          Supabase에 저장된 프로젝트와 캐릭터 데이터를 React UI에서 조회하는 테스트 화면입니다.
        </p>

        {errorMessage && (
          <div className="mt-8 rounded-xl border border-red-500 bg-red-950 p-4 text-red-200">
            <p className="font-semibold">Supabase 조회 오류</p>
            <p className="mt-2 text-sm">{errorMessage}</p>
          </div>
        )}

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
              <article
                key={project.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">
                      {project.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {project.genre} / {project.target_platform} / {project.target_format}
                    </p>
                  </div>

                  <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
                    {project.status}
                  </span>
                </div>

                <p className="mt-5 leading-7 text-slate-300">
                  {project.synopsis}
                </p>

                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-500">Visual Style</p>
                  <p className="mt-1 text-slate-200">{project.visual_style}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
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
            {characters.map((character) => {
              const isSelected = selectedCharacter?.id === character.id

              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => setSelectedCharacter(character)}
                  className={`flex flex-col rounded-2xl border p-5 text-left shadow-lg shadow-black/20 transition ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/30'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {character.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {character.role ?? 'unknown role'}
                      </p>
                    </div>

                    <span className="rounded-full border border-blue-700 bg-blue-950 px-3 py-1 text-xs text-blue-200">
                      {character.age_range ?? 'N/A'}
                    </span>
                  </div>

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
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Goal
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-400">
                      {character.goal}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {selectedCharacter && (
          <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
                  Character Detail
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  {selectedCharacter.name}
                </h2>

                <p className="mt-2 text-slate-400">
                  {selectedCharacter.role} / {selectedCharacter.gender} / {selectedCharacter.age_range}
                </p>
              </div>

              <span className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300">
                {selectedCharacter.worldviews?.name ?? 'No worldview'}
              </span>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <DetailBlock title="Personality" value={selectedCharacter.personality} />
              <DetailBlock title="Speech Style" value={selectedCharacter.speech_style} />
              <DetailBlock title="Appearance" value={selectedCharacter.appearance} />
              <DetailBlock title="Outfit" value={selectedCharacter.outfit} />
              <DetailBlock title="Goal" value={selectedCharacter.goal} />
              <DetailBlock title="Weakness" value={selectedCharacter.weakness} />
              <DetailBlock title="Backstory" value={selectedCharacter.backstory} />
              <DetailBlock title="Forbidden Settings" value={selectedCharacter.forbidden_settings} />
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <DetailBlock
                title="Prompt Summary"
                value={selectedCharacter.prompt_summary}
                accent
              />
              <DetailBlock
                title="Negative Prompt"
                value={selectedCharacter.negative_prompt}
                accent
              />
            </div>

            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-slate-300">
                Signature Items
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCharacter.signature_items?.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

type DetailBlockProps = {
  title: string
  value: string | null
  accent?: boolean
}

function DetailBlock({ title, value, accent = false }: DetailBlockProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? 'border-cyan-900 bg-cyan-950/20'
          : 'border-slate-800 bg-slate-950'
      }`}
    >
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
        {value || 'No data'}
      </p>
    </div>
  )
}

export default App

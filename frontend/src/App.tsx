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
            {characters.map((character) => (
              <article
                key={character.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20"
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
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App

import { useEffect, useState } from 'react'
import { CharacterCard } from './components/characters/CharacterCard'
import { CharacterDetailPanel } from './components/characters/CharacterDetailPanel'
import { ProjectCard } from './components/projects/ProjectCard'
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
              <ProjectCard key={project.id} project={project} />
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
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={selectedCharacter?.id === character.id}
                onSelect={setSelectedCharacter}
              />
            ))}
          </div>
        </section>

        {selectedCharacter && (
          <CharacterDetailPanel character={selectedCharacter} />
        )}
      </div>
    </main>
  )
}

export default App

import { useEffect, useState } from 'react'
import { getProjects, type Project } from './services/projectService'
import './App.css'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
        setIsLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
          Animation Agent
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Story IP Database Viewer
        </h1>

        <p className="mt-3 text-slate-400">
          Supabase에 저장된 프로젝트 데이터를 React UI에서 조회하는 첫 번째 테스트 화면입니다.
        </p>

        {isLoading && (
          <p className="mt-8 text-slate-400">
            Loading projects...
          </p>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-xl border border-red-500 bg-red-950 p-4 text-red-200">
            <p className="font-semibold">Supabase 조회 오류</p>
            <p className="mt-2 text-sm">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && projects.length === 0 && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
            조회된 프로젝트가 없습니다.
          </div>
        )}

        <section className="mt-8 grid gap-4">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {project.title}
                  </h2>

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
        </section>
      </div>
    </main>
  )
}

export default App

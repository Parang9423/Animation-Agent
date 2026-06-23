import type { Project } from '../../services/projectService'

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold">{project.title}</h3>

          <p className="mt-2 text-sm text-slate-400">
            {project.genre} / {project.target_platform} / {project.target_format}
          </p>
        </div>

        <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
          {project.status}
        </span>
      </div>

      <p className="mt-5 leading-7 text-slate-300">{project.synopsis}</p>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-sm text-slate-500">Visual Style</p>
        <p className="mt-1 text-slate-200">{project.visual_style}</p>
      </div>
    </article>
  )
}

import { supabase } from '../lib/supabaseClient'

export type Project = {
  id: string
  title: string
  slug: string
  description: string | null
  genre: string | null
  target_platform: string | null
  target_format: string | null
  synopsis: string | null
  visual_style: string | null
  status: string
  created_at: string
  updated_at: string
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

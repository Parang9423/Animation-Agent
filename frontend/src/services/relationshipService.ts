import { supabase } from '../lib/supabaseClient'

type CharacterName = {
  id: string
  name: string
}

type CharacterRelationshipRow = {
  id: string
  project_id: string
  character_a_id: string
  character_b_id: string
  relationship_type: string | null
  emotion: string | null
  past_event: string | null
  current_conflict: string | null
  relationship_stage: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export type RelationshipWithCharacters = CharacterRelationshipRow & {
  character_a: CharacterName | null
  character_b: CharacterName | null
}

export async function getRelationshipsByProject(
  projectId: string,
): Promise<RelationshipWithCharacters[]> {
  const { data: relationships, error: relationshipError } = await supabase
    .from('character_relationships')
    .select('*')
    .eq('project_id', projectId)
    .order('relationship_type', { ascending: true })

  if (relationshipError) {
    throw relationshipError
  }

  const characterIds = Array.from(
    new Set(
      (relationships ?? []).flatMap((relationship) => [
        relationship.character_a_id,
        relationship.character_b_id,
      ]),
    ),
  )

  if (characterIds.length === 0) {
    return []
  }

  const { data: characters, error: characterError } = await supabase
    .from('characters')
    .select('id, name')
    .in('id', characterIds)

  if (characterError) {
    throw characterError
  }

  const characterById = new Map(
    (characters ?? []).map((character) => [character.id, character]),
  )

  return (relationships ?? []).map((relationship) => ({
    ...relationship,
    character_a: characterById.get(relationship.character_a_id) ?? null,
    character_b: characterById.get(relationship.character_b_id) ?? null,
  }))
}

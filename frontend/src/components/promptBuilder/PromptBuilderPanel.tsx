import { useEffect, useMemo, useState } from 'react'
import type { CharacterWithWorldview } from '../../services/characterService'
import type { LocationWithWorldview } from '../../services/locationService'
import type { PromptTemplate } from '../../services/promptTemplateService'
import type { StyleGuide } from '../../services/styleGuideService'

type PromptBuilderPanelProps = {
  characters: CharacterWithWorldview[]
  locations: LocationWithWorldview[]
  promptTemplates: PromptTemplate[]
  styleGuides: StyleGuide[]
  isLoadingStyleGuides: boolean
}

type BuilderMode = 'character' | 'location'

type CopyTarget = 'positive' | 'negative'

type CopyStatus = {
  target: CopyTarget | null
  status: 'idle' | 'copied' | 'failed'
}

export function PromptBuilderPanel({
  characters,
  locations,
  promptTemplates,
  styleGuides,
  isLoadingStyleGuides,
}: PromptBuilderPanelProps) {
  const [builderMode, setBuilderMode] = useState<BuilderMode>('character')
  const [selectedCharacterId, setSelectedCharacterId] = useState('')
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedStyleGuideId, setSelectedStyleGuideId] = useState('')
  const [copyStatus, setCopyStatus] = useState<CopyStatus>({
    target: null,
    status: 'idle',
  })

  const currentTemplates = useMemo(
    () => promptTemplates.filter((template) => template.template_type === builderMode),
    [builderMode, promptTemplates],
  )

  useEffect(() => {
    if (!selectedCharacterId && characters.length > 0) {
      setSelectedCharacterId(characters[0].id)
    }
  }, [characters, selectedCharacterId])

  useEffect(() => {
    if (!selectedLocationId && locations.length > 0) {
      setSelectedLocationId(locations[0].id)
    }
  }, [locations, selectedLocationId])

  useEffect(() => {
    if (currentTemplates.length === 0) {
      setSelectedTemplateId('')
      return
    }

    const selectedTemplateExists = currentTemplates.some(
      (template) => template.id === selectedTemplateId,
    )

    if (!selectedTemplateExists) {
      setSelectedTemplateId(currentTemplates[0].id)
    }
  }, [currentTemplates, selectedTemplateId])

  useEffect(() => {
    if (!selectedStyleGuideId && styleGuides.length > 0) {
      const defaultStyleGuide =
        styleGuides.find((styleGuide) => styleGuide.is_default) ?? styleGuides[0]

      setSelectedStyleGuideId(defaultStyleGuide.id)
    }
  }, [selectedStyleGuideId, styleGuides])

  const selectedCharacter =
    characters.find((character) => character.id === selectedCharacterId) ?? null

  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ?? null

  const selectedTemplate =
    currentTemplates.find((template) => template.id === selectedTemplateId) ?? null

  const selectedStyleGuide =
    styleGuides.find((styleGuide) => styleGuide.id === selectedStyleGuideId) ?? null

  const generatedPositivePrompt = useMemo(() => {
    if (!selectedTemplate?.template_body) {
      return ''
    }

    if (builderMode === 'character') {
      if (!selectedCharacter) {
        return ''
      }

      return buildPromptFromTemplate(
        selectedTemplate.template_body,
        buildCharacterPromptValues(selectedCharacter, selectedStyleGuide),
      )
    }

    if (!selectedLocation) {
      return ''
    }

    return buildPromptFromTemplate(
      selectedTemplate.template_body,
      buildLocationPromptValues(selectedLocation, selectedStyleGuide),
    )
  }, [builderMode, selectedCharacter, selectedLocation, selectedStyleGuide, selectedTemplate])

  const generatedNegativePrompt = useMemo(() => {
    return buildNegativePrompt(
      builderMode,
      selectedCharacter,
      selectedLocation,
      selectedStyleGuide,
      selectedTemplate,
    )
  }, [builderMode, selectedCharacter, selectedLocation, selectedStyleGuide, selectedTemplate])

  const unresolvedVariables = useMemo(() => {
    return Array.from(
      new Set(
        generatedPositivePrompt.match(/{{\s*[\w.]+\s*}}/g)?.map((variable) =>
          variable.replace(/[{}\s]/g, ''),
        ) ?? [],
      ),
    )
  }, [generatedPositivePrompt])

  const selectedSubjectName =
    builderMode === 'character'
      ? selectedCharacter?.name ?? 'No character'
      : selectedLocation?.name ?? 'No location'

  const handleCopy = async (target: CopyTarget, prompt: string) => {
    if (!prompt) {
      return
    }

    try {
      await navigator.clipboard.writeText(prompt)
      setCopyStatus({ target, status: 'copied' })
      window.setTimeout(
        () => setCopyStatus({ target: null, status: 'idle' }),
        2000,
      )
    } catch {
      setCopyStatus({ target, status: 'failed' })
      window.setTimeout(
        () => setCopyStatus({ target: null, status: 'idle' }),
        2000,
      )
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Prompt Builder</h2>
          <p className="mt-1 text-sm text-slate-500">
            캐릭터/장소 데이터, 스타일 가이드, Google Flow 템플릿을 조합해 최종 프롬프트를 생성합니다.
          </p>
        </div>

        <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
          {builderMode} MVP
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
          <p className="text-sm font-semibold text-slate-300">Builder Settings</p>

          <label className="mt-5 block">
            <span className="text-sm text-slate-400">Template Type</span>
            <select
              value={builderMode}
              onChange={(event) => setBuilderMode(event.target.value as BuilderMode)}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="character">character</option>
              <option value="location">location</option>
            </select>
          </label>

          {builderMode === 'character' && (
            <label className="mt-5 block">
              <span className="text-sm text-slate-400">Character</span>
              <select
                value={selectedCharacterId}
                onChange={(event) => setSelectedCharacterId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
              >
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {builderMode === 'location' && (
            <label className="mt-5 block">
              <span className="text-sm text-slate-400">Location</span>
              <select
                value={selectedLocationId}
                onChange={(event) => setSelectedLocationId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="mt-5 block">
            <span className="text-sm text-slate-400">Style Guide</span>
            <select
              value={selectedStyleGuideId}
              onChange={(event) => setSelectedStyleGuideId(event.target.value)}
              disabled={isLoadingStyleGuides || styleGuides.length === 0}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:text-slate-600"
            >
              {isLoadingStyleGuides && <option>Loading style guides...</option>}
              {!isLoadingStyleGuides && styleGuides.length === 0 && (
                <option>No style guides</option>
              )}
              {styleGuides.map((styleGuide) => (
                <option key={styleGuide.id} value={styleGuide.id}>
                  {styleGuide.name}
                  {styleGuide.is_default ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-5 block">
            <span className="text-sm text-slate-400">Prompt Template</span>
            <select
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
              disabled={currentTemplates.length === 0}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:text-slate-600"
            >
              {currentTemplates.length === 0 && <option>No templates</option>}
              {currentTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-slate-300">
              Style Prompt Prefix
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isLoadingStyleGuides
                ? 'Loading style prompt prefix...'
                : selectedStyleGuide?.prompt_prefix ?? 'No style prompt prefix'}
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-slate-300">
              Negative Prompt Sources
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {builderMode === 'character' ? 'Character' : 'Location'}:{' '}
              {builderMode === 'character'
                ? selectedCharacter?.negative_prompt ?? 'No character negative prompt'
                : selectedLocation?.negative_prompt ?? 'No location negative prompt'}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Style:{' '}
              {isLoadingStyleGuides
                ? 'Loading...'
                : selectedStyleGuide?.negative_style ?? 'No style negative prompt'}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Template: {selectedTemplate?.negative_prompt ?? 'No template negative prompt'}
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-slate-300">
              Style Details
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Animation:{' '}
              {isLoadingStyleGuides
                ? 'Loading...'
                : selectedStyleGuide?.animation_style ?? 'No animation style'}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Lighting:{' '}
              {isLoadingStyleGuides
                ? 'Loading...'
                : selectedStyleGuide?.lighting_style ?? 'No lighting style'}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Mood:{' '}
              {isLoadingStyleGuides
                ? 'Loading...'
                : selectedStyleGuide?.mood ?? 'No mood'}
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-slate-300">
              Selected Data
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Mode: {builderMode}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Subject: {selectedSubjectName}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Style:{' '}
              {isLoadingStyleGuides
                ? 'Loading...'
                : selectedStyleGuide?.name ?? 'No style guide'}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Template: {selectedTemplate?.name ?? 'No template'}
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <PromptPreviewCard
            title="Positive Prompt Preview"
            description="Google Flow의 Prompt 영역에 넣을 최종 프롬프트입니다."
            prompt={generatedPositivePrompt}
            emptyText="Positive Prompt를 생성하려면 대상, 스타일, 템플릿 데이터가 필요합니다."
            copyLabel={getCopyButtonLabel(copyStatus, 'positive', 'Copy Positive')}
            onCopy={() => handleCopy('positive', generatedPositivePrompt)}
          />

          {unresolvedVariables.length > 0 && (
            <div className="rounded-xl border border-yellow-700 bg-yellow-950/30 p-4 text-yellow-100">
              <p className="text-sm font-semibold">Unresolved Variables</p>
              <p className="mt-2 text-sm text-yellow-200/80">
                아래 변수는 현재 Builder에서 치환되지 않았습니다.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {unresolvedVariables.map((variable) => (
                  <span
                    key={variable}
                    className="rounded-full border border-yellow-700 bg-yellow-950 px-3 py-1 text-sm"
                  >
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          )}

          <PromptPreviewCard
            title="Negative Prompt Preview"
            description="Google Flow에서 피해야 할 스타일, 대상 표현, 생성 오류를 분리한 프롬프트입니다."
            prompt={generatedNegativePrompt}
            emptyText="Negative Prompt를 생성하려면 대상 또는 스타일의 negative 데이터가 필요합니다."
            copyLabel={getCopyButtonLabel(copyStatus, 'negative', 'Copy Negative')}
            onCopy={() => handleCopy('negative', generatedNegativePrompt)}
          />
        </div>
      </div>
    </section>
  )
}

type PromptPreviewCardProps = {
  title: string
  description: string
  prompt: string
  emptyText: string
  copyLabel: string
  onCopy: () => void
}

function PromptPreviewCard({
  title,
  description,
  prompt,
  emptyText,
  copyLabel,
  onCopy,
}: PromptPreviewCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-300">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          disabled={!prompt}
          className="rounded-xl border border-cyan-700 bg-cyan-950 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-950 disabled:text-slate-600"
        >
          {copyLabel}
        </button>
      </div>

      <pre className="mt-5 min-h-[260px] whitespace-pre-wrap break-words rounded-xl border border-cyan-900 bg-cyan-950/20 p-5 text-sm leading-7 text-slate-300">
        {prompt || emptyText}
      </pre>
    </div>
  )
}

function getCopyButtonLabel(
  copyStatus: CopyStatus,
  target: CopyTarget,
  defaultLabel: string,
) {
  if (copyStatus.target !== target) {
    return defaultLabel
  }

  if (copyStatus.status === 'copied') {
    return 'Copied'
  }

  if (copyStatus.status === 'failed') {
    return 'Copy Failed'
  }

  return defaultLabel
}

function buildPromptFromTemplate(
  templateBody: string,
  values: Record<string, string>,
) {
  return templateBody.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => {
    return values[key] ?? `{{${key}}}`
  })
}

function buildNegativePrompt(
  builderMode: BuilderMode,
  character: CharacterWithWorldview | null,
  location: LocationWithWorldview | null,
  styleGuide: StyleGuide | null,
  template: PromptTemplate | null,
) {
  return [
    template?.negative_prompt,
    builderMode === 'character' ? character?.negative_prompt : location?.negative_prompt,
    styleGuide?.negative_style,
    styleGuide?.prompt_suffix,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join('\n\n')
}

function buildStylePromptValues(styleGuide: StyleGuide | null) {
  return {
    'style.name': styleGuide?.name ?? '',
    'style.animation_style': styleGuide?.animation_style ?? '',
    'style.color_palette': styleGuide?.color_palette ?? '',
    'style.camera_style': styleGuide?.camera_style ?? '',
    'style.lighting_style': styleGuide?.lighting_style ?? '',
    'style.mood': styleGuide?.mood ?? '',
    'style.reference_keywords': styleGuide?.reference_keywords?.join(', ') ?? '',
    'style.negative_style': styleGuide?.negative_style ?? '',
    'style.prompt_prefix': styleGuide?.prompt_prefix ?? '',
    'style.prompt_suffix': styleGuide?.prompt_suffix ?? '',
  }
}

function buildCharacterPromptValues(
  character: CharacterWithWorldview,
  styleGuide: StyleGuide | null,
) {
  return {
    ...buildStylePromptValues(styleGuide),
    'character.name': character.name,
    'character.role': character.role ?? '',
    'character.gender': character.gender ?? '',
    'character.age_range': character.age_range ?? '',
    'character.personality': character.personality ?? '',
    'character.speech_style': character.speech_style ?? '',
    'character.appearance': character.appearance ?? '',
    'character.outfit': character.outfit ?? '',
    'character.goal': character.goal ?? '',
    'character.weakness': character.weakness ?? '',
    'character.backstory': character.backstory ?? '',
    'character.forbidden_settings': character.forbidden_settings ?? '',
    'character.prompt_summary': character.prompt_summary ?? '',
    'character.negative_prompt': character.negative_prompt ?? '',
    'character.signature_items': character.signature_items?.join(', ') ?? '',
    'character.worldview': character.worldviews?.name ?? '',
  }
}

function buildLocationPromptValues(
  location: LocationWithWorldview,
  styleGuide: StyleGuide | null,
) {
  return {
    ...buildStylePromptValues(styleGuide),
    'location.name': location.name,
    'location.type': location.type ?? '',
    'location.description': location.description ?? '',
    'location.atmosphere': location.atmosphere ?? '',
    'location.visual_elements': location.visual_elements?.join(', ') ?? '',
    'location.related_factions': location.related_factions?.join(', ') ?? '',
    'location.related_characters': location.related_characters?.join(', ') ?? '',
    'location.prompt_summary': location.prompt_summary ?? '',
    'location.negative_prompt': location.negative_prompt ?? '',
    'location.worldview': location.worldviews?.name ?? '',
  }
}

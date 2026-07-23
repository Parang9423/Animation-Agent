import { useEffect, useMemo, useState } from 'react'
import type { CharacterWithWorldview } from '../../services/characterService'
import type { LocationWithWorldview } from '../../services/locationService'
import {
  createPromptRun,
  type PromptRunType,
} from '../../services/promptRunService'
import type { PromptTemplate } from '../../services/promptTemplateService'
import {
  getScenesByProject,
  type SceneWithDetails,
} from '../../services/sceneService'
import type { StyleGuide } from '../../services/styleGuideService'

type PromptBuilderPanelProps = {
  projectId: string
  characters: CharacterWithWorldview[]
  locations: LocationWithWorldview[]
  promptTemplates: PromptTemplate[]
  styleGuides: StyleGuide[]
  isLoadingStyleGuides: boolean
  onPromptRunCreated?: () => void
}

type BuilderMode = 'character' | 'location' | 'scene'
type CopyTarget = 'positive' | 'negative'

type CopyStatus = {
  target: CopyTarget | null
  status: 'idle' | 'copied' | 'failed'
}

type SaveStatus = {
  status: 'idle' | 'saving' | 'saved' | 'failed'
  message: string | null
}

type ScenePromptFields = {
  action: string
  emotion: string
  camera_shot: string
  camera_angle: string
  lighting: string
  time_weather: string
  additional_notes: string
  negative_notes: string
}

const DEFAULT_SCENE_FIELDS: ScenePromptFields = {
  action:
    'The character pauses in the scene, confronting a hidden truth connected to the location.',
  emotion: 'quiet shock, restrained fear, tragic curiosity',
  camera_shot: 'wide cinematic shot',
  camera_angle: 'slightly low angle',
  lighting: 'cold blue backlight with soft volumetric fog',
  time_weather: 'night, frozen air, drifting snow',
  additional_notes:
    'Focus on environmental storytelling, emotional restraint, and strong silhouette composition.',
  negative_notes:
    'no inconsistent character design, no location mismatch, no comedic tone, no bright cheerful colors, no low-detail background',
}

export function PromptBuilderPanel({
  projectId,
  characters,
  locations,
  promptTemplates,
  styleGuides,
  isLoadingStyleGuides,
  onPromptRunCreated,
}: PromptBuilderPanelProps) {
  const [builderMode, setBuilderMode] = useState<BuilderMode>('character')
  const [selectedCharacterId, setSelectedCharacterId] = useState('')
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [selectedSceneId, setSelectedSceneId] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedStyleGuideId, setSelectedStyleGuideId] = useState('')
  const [scenes, setScenes] = useState<SceneWithDetails[]>([])
  const [isLoadingScenes, setIsLoadingScenes] = useState(false)
  const [sceneFields, setSceneFields] =
    useState<ScenePromptFields>(DEFAULT_SCENE_FIELDS)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>({
    target: null,
    status: 'idle',
  })
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'idle',
    message: null,
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
    setIsLoadingScenes(true)
    getScenesByProject(projectId)
      .then((data) => setScenes(data))
      .catch(() => setScenes([]))
      .finally(() => setIsLoadingScenes(false))
  }, [projectId])

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
  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId) ?? null
  const selectedTemplate =
    currentTemplates.find((template) => template.id === selectedTemplateId) ?? null
  const selectedStyleGuide =
    styleGuides.find((styleGuide) => styleGuide.id === selectedStyleGuideId) ?? null

  const generatedPositivePrompt = useMemo(() => {
    if (!selectedTemplate?.template_body) {
      return ''
    }

    if (builderMode === 'character') {
      if (!selectedCharacter) return ''
      return buildPromptFromTemplate(
        selectedTemplate.template_body,
        buildCharacterPromptValues(selectedCharacter, selectedStyleGuide),
      )
    }

    if (builderMode === 'location') {
      if (!selectedLocation) return ''
      return buildPromptFromTemplate(
        selectedTemplate.template_body,
        buildLocationPromptValues(selectedLocation, selectedStyleGuide),
      )
    }

    if (!selectedCharacter || !selectedLocation) {
      return ''
    }

    return buildPromptFromTemplate(
      selectedTemplate.template_body,
      buildScenePromptValues(
        selectedCharacter,
        selectedLocation,
        selectedStyleGuide,
        sceneFields,
        selectedScene,
      ),
    )
  }, [
    builderMode,
    sceneFields,
    selectedCharacter,
    selectedLocation,
    selectedScene,
    selectedStyleGuide,
    selectedTemplate,
  ])

  const generatedNegativePrompt = useMemo(() => {
    return buildNegativePrompt(
      builderMode,
      selectedCharacter,
      selectedLocation,
      selectedStyleGuide,
      selectedTemplate,
      sceneFields,
    )
  }, [
    builderMode,
    sceneFields,
    selectedCharacter,
    selectedLocation,
    selectedStyleGuide,
    selectedTemplate,
  ])

  const unresolvedVariables = useMemo(() => {
    return Array.from(
      new Set(
        generatedPositivePrompt.match(/{{\s*[\w.]+\s*}}/g)?.map((variable) =>
          variable.replace(/[{}\s]/g, ''),
        ) ?? [],
      ),
    )
  }, [generatedPositivePrompt])

  const selectedSubjectName = getSelectedSubjectName(
    builderMode,
    selectedCharacter,
    selectedLocation,
    selectedScene,
  )

  const handleSceneFieldChange = (
    key: keyof ScenePromptFields,
    value: string,
  ) => {
    setSceneFields((currentFields) => ({
      ...currentFields,
      [key]: value,
    }))
  }

  const handleSceneSelectionChange = (nextSceneId: string) => {
    setSelectedSceneId(nextSceneId)

    const nextScene = scenes.find((scene) => scene.id === nextSceneId) ?? null

    if (!nextScene) {
      return
    }

    if (nextScene.character_id) {
      setSelectedCharacterId(nextScene.character_id)
    }

    if (nextScene.location_id) {
      setSelectedLocationId(nextScene.location_id)
    }

    setSceneFields({
      action: nextScene.action ?? DEFAULT_SCENE_FIELDS.action,
      emotion: nextScene.emotion ?? DEFAULT_SCENE_FIELDS.emotion,
      camera_shot: nextScene.camera_shot ?? DEFAULT_SCENE_FIELDS.camera_shot,
      camera_angle: nextScene.camera_angle ?? DEFAULT_SCENE_FIELDS.camera_angle,
      lighting: nextScene.lighting ?? DEFAULT_SCENE_FIELDS.lighting,
      time_weather: nextScene.time_weather ?? DEFAULT_SCENE_FIELDS.time_weather,
      additional_notes:
        nextScene.prompt_summary ??
        nextScene.description ??
        DEFAULT_SCENE_FIELDS.additional_notes,
      negative_notes: nextScene.negative_prompt ?? DEFAULT_SCENE_FIELDS.negative_notes,
    })
  }

  const handleCopy = async (target: CopyTarget, prompt: string) => {
    if (!prompt) return

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

  const handleSavePromptRun = async () => {
    if (!generatedPositivePrompt || !selectedTemplate) {
      setSaveStatus({
        status: 'failed',
        message: 'Positive prompt와 template이 필요합니다.',
      })
      return
    }

    if (builderMode === 'character' && !selectedCharacter) {
      setSaveStatus({
        status: 'failed',
        message: 'Character를 선택해야 저장할 수 있습니다.',
      })
      return
    }

    if (builderMode === 'location' && !selectedLocation) {
      setSaveStatus({
        status: 'failed',
        message: 'Location을 선택해야 저장할 수 있습니다.',
      })
      return
    }

    if (builderMode === 'scene' && (!selectedCharacter || !selectedLocation)) {
      setSaveStatus({
        status: 'failed',
        message: 'Scene 저장에는 Character와 Location이 모두 필요합니다.',
      })
      return
    }

    setSaveStatus({ status: 'saving', message: 'Saving prompt run...' })

    try {
      const promptRun = await createPromptRun({
        project_id: projectId,
        prompt_type: builderMode as PromptRunType,
        target_tool: selectedTemplate.target_tool ?? 'google_flow',
        template_id: selectedTemplate.id,
        style_guide_id: selectedStyleGuide?.id ?? null,
        character_id:
          builderMode === 'character' || builderMode === 'scene'
            ? selectedCharacter?.id ?? null
            : null,
        location_id:
          builderMode === 'location' || builderMode === 'scene'
            ? selectedLocation?.id ?? null
            : null,
        scene_id: builderMode === 'scene' ? selectedScene?.id ?? null : null,
        positive_prompt: generatedPositivePrompt,
        negative_prompt: generatedNegativePrompt || null,
        input_snapshot: buildInputSnapshot(
          builderMode,
          selectedCharacter,
          selectedLocation,
          selectedScene,
          selectedStyleGuide,
          selectedTemplate,
          sceneFields,
        ),
        output_status: 'draft',
      })

      setSaveStatus({
        status: 'saved',
        message: `Saved prompt run: ${promptRun.id.slice(0, 8)}`,
      })

      if (onPromptRunCreated) {
        onPromptRunCreated()
      } else {
        window.setTimeout(() => window.location.reload(), 700)
      }
    } catch (error) {
      setSaveStatus({
        status: 'failed',
        message:
          error instanceof Error
            ? error.message
            : 'Prompt run 저장 중 오류가 발생했습니다.',
      })
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Prompt Builder</h2>
          <p className="mt-1 text-sm text-slate-500">
            캐릭터/장소/장면 데이터, 스타일 가이드, Google Flow 템플릿을 조합해 최종 프롬프트를 생성합니다.
          </p>
        </div>
        <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
          {builderMode} MVP
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
          <p className="text-sm font-semibold text-slate-300">Builder Settings</p>

          <SelectField
            label="Template Type"
            value={builderMode}
            options={['character', 'location', 'scene']}
            onChange={(value) => setBuilderMode(value as BuilderMode)}
          />

          {builderMode === 'scene' && (
            <SelectField
              label="Scene"
              value={selectedSceneId}
              options={['', ...scenes.map((scene) => scene.id)]}
              optionLabels={{
                '': isLoadingScenes ? 'Loading scenes...' : 'Manual scene fields',
                ...Object.fromEntries(
                  scenes.map((scene) => [
                    scene.id,
                    `#${scene.sequence_no} ${scene.title}`,
                  ]),
                ),
              }}
              onChange={handleSceneSelectionChange}
              disabled={isLoadingScenes}
              emptyLabel={isLoadingScenes ? 'Loading scenes...' : 'No scenes'}
            />
          )}

          {(builderMode === 'character' || builderMode === 'scene') && (
            <SelectField
              label="Character"
              value={selectedCharacterId}
              options={characters.map((character) => character.id)}
              optionLabels={Object.fromEntries(
                characters.map((character) => [character.id, character.name]),
              )}
              onChange={setSelectedCharacterId}
            />
          )}

          {(builderMode === 'location' || builderMode === 'scene') && (
            <SelectField
              label="Location"
              value={selectedLocationId}
              options={locations.map((location) => location.id)}
              optionLabels={Object.fromEntries(
                locations.map((location) => [location.id, location.name]),
              )}
              onChange={setSelectedLocationId}
            />
          )}

          <SelectField
            label="Style Guide"
            value={selectedStyleGuideId}
            options={styleGuides.map((styleGuide) => styleGuide.id)}
            optionLabels={Object.fromEntries(
              styleGuides.map((styleGuide) => [
                styleGuide.id,
                `${styleGuide.name}${styleGuide.is_default ? ' (default)' : ''}`,
              ]),
            )}
            onChange={setSelectedStyleGuideId}
            disabled={isLoadingStyleGuides || styleGuides.length === 0}
            emptyLabel={isLoadingStyleGuides ? 'Loading style guides...' : 'No style guides'}
          />

          <SelectField
            label="Prompt Template"
            value={selectedTemplateId}
            options={currentTemplates.map((template) => template.id)}
            optionLabels={Object.fromEntries(
              currentTemplates.map((template) => [template.id, template.name]),
            )}
            onChange={setSelectedTemplateId}
            disabled={currentTemplates.length === 0}
            emptyLabel="No templates"
          />

          {builderMode === 'scene' && (
            <SceneDirectionFields
              sceneFields={sceneFields}
              onChange={handleSceneFieldChange}
            />
          )}

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-slate-300">Save Prompt Run</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              현재 Positive / Negative Prompt와 선택 데이터를 prompt_runs 테이블에 draft 상태로 저장합니다.
            </p>
            <button
              type="button"
              onClick={handleSavePromptRun}
              disabled={saveStatus.status === 'saving' || !generatedPositivePrompt}
              className="mt-4 w-full rounded-xl border border-emerald-700 bg-emerald-950 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-950 disabled:text-slate-600"
            >
              {saveStatus.status === 'saving' ? 'Saving...' : 'Save Prompt Run'}
            </button>
            {saveStatus.message && (
              <p
                className={`mt-3 text-sm ${
                  saveStatus.status === 'failed'
                    ? 'text-red-300'
                    : saveStatus.status === 'saved'
                      ? 'text-emerald-300'
                      : 'text-slate-400'
                }`}
              >
                {saveStatus.message}
              </p>
            )}
          </div>

          <InfoPanel
            title="Selected Data"
            lines={[
              `Mode: ${builderMode}`,
              ...(builderMode === 'scene'
                ? [`Scene: ${selectedScene?.title ?? 'Manual scene fields'}`]
                : []),
              `Subject: ${selectedSubjectName}`,
              `Style: ${selectedStyleGuide?.name ?? 'No style guide'}`,
              `Template: ${selectedTemplate?.name ?? 'No template'}`,
            ]}
          />

          <InfoPanel
            title="Negative Prompt Sources"
            lines={[
              `Character: ${selectedCharacter?.negative_prompt ?? 'No character negative prompt'}`,
              `Location: ${selectedLocation?.negative_prompt ?? 'No location negative prompt'}`,
              ...(builderMode === 'scene'
                ? [`Scene: ${sceneFields.negative_notes || 'No scene negative notes'}`]
                : []),
              `Style: ${selectedStyleGuide?.negative_style ?? 'No style negative prompt'}`,
              `Template: ${selectedTemplate?.negative_prompt ?? 'No template negative prompt'}`,
            ]}
          />
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

type SelectFieldProps = {
  label: string
  value: string
  options: string[]
  optionLabels?: Record<string, string>
  onChange: (value: string) => void
  disabled?: boolean
  emptyLabel?: string
}

function SelectField({
  label,
  value,
  options,
  optionLabels,
  onChange,
  disabled,
  emptyLabel = 'No options',
}: SelectFieldProps) {
  return (
    <label className="mt-5 block">
      <span className="text-sm text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || options.length === 0}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:text-slate-600"
      >
        {options.length === 0 && <option value="">{emptyLabel}</option>}
        {options.map((option) => (
          <option key={option || 'empty-option'} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  )
}

type SceneDirectionFieldsProps = {
  sceneFields: ScenePromptFields
  onChange: (key: keyof ScenePromptFields, value: string) => void
}

function SceneDirectionFields({ sceneFields, onChange }: SceneDirectionFieldsProps) {
  return (
    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm font-semibold text-slate-300">Scene Direction</p>
      <TextAreaField
        label="Scene Action"
        value={sceneFields.action}
        onChange={(value) => onChange('action', value)}
      />
      <InputField
        label="Scene Emotion"
        value={sceneFields.emotion}
        onChange={(value) => onChange('emotion', value)}
      />
      <SelectField
        label="Camera Shot"
        value={sceneFields.camera_shot}
        options={[
          'wide cinematic shot',
          'medium shot',
          'close-up shot',
          'establishing shot',
          'over-the-shoulder shot',
        ]}
        onChange={(value) => onChange('camera_shot', value)}
      />
      <SelectField
        label="Camera Angle"
        value={sceneFields.camera_angle}
        options={[
          'eye level',
          'slightly low angle',
          'low angle',
          'high angle',
          'side view',
          'Dutch angle',
        ]}
        onChange={(value) => onChange('camera_angle', value)}
      />
      <InputField
        label="Lighting"
        value={sceneFields.lighting}
        onChange={(value) => onChange('lighting', value)}
      />
      <InputField
        label="Time / Weather"
        value={sceneFields.time_weather}
        onChange={(value) => onChange('time_weather', value)}
      />
      <TextAreaField
        label="Additional Notes"
        value={sceneFields.additional_notes}
        onChange={(value) => onChange('additional_notes', value)}
      />
      <TextAreaField
        label="Scene Negative Notes"
        value={sceneFields.negative_notes}
        onChange={(value) => onChange('negative_notes', value)}
      />
    </div>
  )
}

type InputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function InputField({ label, value, onChange }: InputFieldProps) {
  return (
    <label className="mt-4 block">
      <span className="text-xs text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
      />
    </label>
  )
}

function TextAreaField({ label, value, onChange }: InputFieldProps) {
  return (
    <label className="mt-4 block">
      <span className="text-xs text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-200 outline-none focus:border-cyan-500"
      />
    </label>
  )
}

type InfoPanelProps = {
  title: string
  lines: string[]
}

function InfoPanel({ title, lines }: InfoPanelProps) {
  return (
    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {lines.map((line) => (
        <p key={line} className="mt-3 text-sm leading-6 text-slate-400">
          {line}
        </p>
      ))}
    </div>
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
  if (copyStatus.target !== target) return defaultLabel
  if (copyStatus.status === 'copied') return 'Copied'
  if (copyStatus.status === 'failed') return 'Copy Failed'
  return defaultLabel
}

function getSelectedSubjectName(
  builderMode: BuilderMode,
  character: CharacterWithWorldview | null,
  location: LocationWithWorldview | null,
  scene: SceneWithDetails | null,
) {
  if (builderMode === 'character') return character?.name ?? 'No character'
  if (builderMode === 'location') return location?.name ?? 'No location'
  if (scene) return `#${scene.sequence_no} ${scene.title}`
  return `${character?.name ?? 'No character'} @ ${location?.name ?? 'No location'}`
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
  sceneFields: ScenePromptFields,
) {
  const subjectNegativePrompt =
    builderMode === 'character'
      ? character?.negative_prompt
      : builderMode === 'location'
        ? location?.negative_prompt
        : [character?.negative_prompt, location?.negative_prompt]
            .filter((value): value is string => Boolean(value?.trim()))
            .join('\n\n')

  return [
    template?.negative_prompt,
    subjectNegativePrompt,
    styleGuide?.negative_style,
    styleGuide?.prompt_suffix,
    builderMode === 'scene' ? sceneFields.negative_notes : null,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join('\n\n')
}

function buildInputSnapshot(
  builderMode: BuilderMode,
  character: CharacterWithWorldview | null,
  location: LocationWithWorldview | null,
  scene: SceneWithDetails | null,
  styleGuide: StyleGuide | null,
  template: PromptTemplate | null,
  sceneFields: ScenePromptFields,
): Record<string, unknown> {
  return {
    builder_mode: builderMode,
    target_tool: template?.target_tool ?? 'google_flow',
    template: template
      ? {
          id: template.id,
          name: template.name,
          template_type: template.template_type,
        }
      : null,
    style_guide: styleGuide
      ? {
          id: styleGuide.id,
          name: styleGuide.name,
          prompt_prefix: styleGuide.prompt_prefix,
          prompt_suffix: styleGuide.prompt_suffix,
        }
      : null,
    character: character
      ? {
          id: character.id,
          name: character.name,
          role: character.role,
          prompt_summary: character.prompt_summary,
          negative_prompt: character.negative_prompt,
        }
      : null,
    location: location
      ? {
          id: location.id,
          name: location.name,
          type: location.type,
          atmosphere: location.atmosphere,
          prompt_summary: location.prompt_summary,
          negative_prompt: location.negative_prompt,
        }
      : null,
    scene: scene
      ? {
          id: scene.id,
          sequence_no: scene.sequence_no,
          title: scene.title,
          scene_type: scene.scene_type,
          status: scene.status,
          prompt_summary: scene.prompt_summary,
        }
      : null,
    scene_fields: builderMode === 'scene' ? sceneFields : null,
  }
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
    'character.age': character.age_text ?? '',
    'character.personality': character.personality ?? '',
    'character.visual_description': character.visual_description ?? '',
    'character.costume': character.costume ?? '',
    'character.signature_items': character.signature_items?.join(', ') ?? '',
    'character.prompt_summary': character.prompt_summary ?? '',
    'character.negative_prompt': character.negative_prompt ?? '',
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

function buildScenePromptValues(
  character: CharacterWithWorldview,
  location: LocationWithWorldview,
  styleGuide: StyleGuide | null,
  sceneFields: ScenePromptFields,
  scene: SceneWithDetails | null,
) {
  return {
    ...buildCharacterPromptValues(character, styleGuide),
    ...buildLocationPromptValues(location, styleGuide),
    'scene.id': scene?.id ?? '',
    'scene.sequence_no': scene?.sequence_no ? String(scene.sequence_no) : '',
    'scene.title': scene?.title ?? '',
    'scene.type': scene?.scene_type ?? '',
    'scene.description': scene?.description ?? '',
    'scene.prompt_summary': scene?.prompt_summary ?? '',
    'scene.action': sceneFields.action,
    'scene.emotion': sceneFields.emotion,
    'scene.camera_shot': sceneFields.camera_shot,
    'scene.camera_angle': sceneFields.camera_angle,
    'scene.lighting': sceneFields.lighting,
    'scene.time_weather': sceneFields.time_weather,
    'scene.additional_notes': sceneFields.additional_notes,
    'scene.negative_notes': sceneFields.negative_notes,
  }
}

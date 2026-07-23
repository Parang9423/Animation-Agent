import { useMemo, useState } from 'react'
import type { CharacterWithWorldview } from '../../services/characterService'
import type { LocationWithWorldview } from '../../services/locationService'
import {
  createScene,
  type SceneStatus,
  type SceneType,
} from '../../services/sceneService'

type SceneCreateFormProps = {
  projectId: string
  characters: CharacterWithWorldview[]
  locations: LocationWithWorldview[]
  nextSequenceNo: number
  onCreated?: () => void
}

type SaveState = 'idle' | 'saving' | 'saved' | 'failed'

const SCENE_TYPES: SceneType[] = [
  'story',
  'character_intro',
  'location_establishing',
  'action',
  'dialogue',
  'transition',
  'other',
]

const SCENE_STATUSES: SceneStatus[] = [
  'draft',
  'prompt_ready',
  'image_generated',
  'approved',
  'video_ready',
  'archived',
]

export function SceneCreateForm({
  projectId,
  characters,
  locations,
  nextSequenceNo,
  onCreated,
}: SceneCreateFormProps) {
  const [sequenceNo, setSequenceNo] = useState(nextSequenceNo.toString())
  const [title, setTitle] = useState('')
  const [characterId, setCharacterId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [sceneType, setSceneType] = useState<SceneType>('story')
  const [status, setStatus] = useState<SceneStatus>('draft')
  const [action, setAction] = useState('')
  const [emotion, setEmotion] = useState('')
  const [cameraShot, setCameraShot] = useState('')
  const [cameraAngle, setCameraAngle] = useState('')
  const [lighting, setLighting] = useState('')
  const [timeWeather, setTimeWeather] = useState('')
  const [description, setDescription] = useState('')
  const [promptSummary, setPromptSummary] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [memo, setMemo] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const sortedCharacters = useMemo(
    () => [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    [characters],
  )
  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => a.name.localeCompare(b.name)),
    [locations],
  )

  const resetForm = () => {
    setSequenceNo((nextSequenceNo + 1).toString())
    setTitle('')
    setCharacterId('')
    setLocationId('')
    setSceneType('story')
    setStatus('draft')
    setAction('')
    setEmotion('')
    setCameraShot('')
    setCameraAngle('')
    setLighting('')
    setTimeWeather('')
    setDescription('')
    setPromptSummary('')
    setNegativePrompt('')
    setMemo('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedSequenceNo = Number(sequenceNo)

    if (!Number.isFinite(parsedSequenceNo) || parsedSequenceNo <= 0) {
      setSaveState('failed')
      setMessage('Sequence No는 1 이상의 숫자로 입력해야 합니다.')
      return
    }

    if (!title.trim()) {
      setSaveState('failed')
      setMessage('Scene title은 필수입니다.')
      return
    }

    setSaveState('saving')
    setMessage('Saving scene...')

    try {
      await createScene({
        project_id: projectId,
        sequence_no: parsedSequenceNo,
        title: title.trim(),
        character_id: characterId || null,
        location_id: locationId || null,
        scene_type: sceneType,
        action: toNullableText(action),
        emotion: toNullableText(emotion),
        camera_shot: toNullableText(cameraShot),
        camera_angle: toNullableText(cameraAngle),
        lighting: toNullableText(lighting),
        time_weather: toNullableText(timeWeather),
        description: toNullableText(description),
        prompt_summary: toNullableText(promptSummary),
        negative_prompt: toNullableText(negativePrompt),
        status,
        memo: toNullableText(memo),
      })

      setSaveState('saved')
      setMessage('Scene saved.')
      resetForm()
      onCreated?.()

      window.setTimeout(() => {
        setSaveState('idle')
        setMessage(null)
      }, 2000)
    } catch (error) {
      setSaveState('failed')
      setMessage(
        error instanceof Error
          ? error.message
          : 'Scene 저장 중 오류가 발생했습니다.',
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">New Scene</h3>
          <p className="mt-1 text-sm text-slate-500">
            앱에서 장면 데이터를 생성하고 scenes 테이블에 저장합니다.
          </p>
        </div>
        <span className="rounded-full border border-cyan-800 bg-cyan-950 px-3 py-1 text-xs font-semibold text-cyan-100">
          scenes insert
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <TextInput
          label="Sequence No"
          value={sequenceNo}
          onChange={setSequenceNo}
          type="number"
          required
        />
        <TextInput label="Title" value={title} onChange={setTitle} required />
        <SelectInput
          label="Scene Type"
          value={sceneType}
          options={SCENE_TYPES}
          onChange={(value) => setSceneType(value as SceneType)}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <SelectInput
          label="Character"
          value={characterId}
          options={[
            { value: '', label: 'No character' },
            ...sortedCharacters.map((character) => ({
              value: character.id,
              label: character.name,
            })),
          ]}
          onChange={setCharacterId}
        />
        <SelectInput
          label="Location"
          value={locationId}
          options={[
            { value: '', label: 'No location' },
            ...sortedLocations.map((location) => ({
              value: location.id,
              label: location.name,
            })),
          ]}
          onChange={setLocationId}
        />
        <SelectInput
          label="Status"
          value={status}
          options={SCENE_STATUSES}
          onChange={(value) => setStatus(value as SceneStatus)}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextInput label="Action" value={action} onChange={setAction} />
        <TextInput label="Emotion" value={emotion} onChange={setEmotion} />
        <TextInput label="Camera Shot" value={cameraShot} onChange={setCameraShot} />
        <TextInput label="Camera Angle" value={cameraAngle} onChange={setCameraAngle} />
        <TextInput label="Lighting" value={lighting} onChange={setLighting} />
        <TextInput label="Time / Weather" value={timeWeather} onChange={setTimeWeather} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TextArea label="Description" value={description} onChange={setDescription} />
        <TextArea
          label="Prompt Summary"
          value={promptSummary}
          onChange={setPromptSummary}
        />
        <TextArea
          label="Negative Prompt"
          value={negativePrompt}
          onChange={setNegativePrompt}
        />
        <TextArea label="Memo" value={memo} onChange={setMemo} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saveState === 'saving'}
          className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {saveState === 'saving' ? 'Saving...' : 'Save Scene'}
        </button>
        {message && (
          <p
            className={`text-sm ${
              saveState === 'failed'
                ? 'text-red-300'
                : saveState === 'saved'
                  ? 'text-emerald-300'
                  : 'text-slate-400'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  )
}

type TextInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: TextInputProps) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
      />
    </label>
  )
}

type SelectOption = string | { value: string; label: string }

type SelectInputProps = {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

function SelectInput({ label, value, options, onChange }: SelectInputProps) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
      >
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const label = typeof option === 'string' ? option : option.label

          return (
            <option key={value || 'none'} value={value}>
              {label}
            </option>
          )
        })}
      </select>
    </label>
  )
}

type TextAreaProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function TextArea({ label, value, onChange }: TextAreaProps) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-200 outline-none focus:border-cyan-500"
      />
    </label>
  )
}

function toNullableText(value: string) {
  const trimmedValue = value.trim()

  return trimmedValue.length > 0 ? trimmedValue : null
}

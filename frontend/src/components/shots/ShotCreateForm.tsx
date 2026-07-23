import { useState, type FormEvent } from 'react'
import {
  createShot,
  type CreateShotInput,
  type Shot,
  type ShotStatus,
  type ShotType,
} from '../../services/shotService'

type ShotCreateFormProps = {
  projectId: string
  sceneId: string
  nextShotOrder: number
  onCreated: (shot: Shot) => void
}

type SaveStatus = {
  status: 'idle' | 'saving' | 'saved' | 'failed'
  message: string | null
}

const SHOT_TYPE_OPTIONS: ShotType[] = [
  'story',
  'establishing',
  'character_action',
  'dialogue',
  'reaction',
  'insert',
  'transition',
  'other',
]

const SHOT_STATUS_OPTIONS: ShotStatus[] = [
  'draft',
  'prompt_ready',
  'image_generated',
  'video_prompt_ready',
  'video_generated',
  'approved',
  'archived',
]

export function ShotCreateForm({
  projectId,
  sceneId,
  nextShotOrder,
  onCreated,
}: ShotCreateFormProps) {
  const [shotOrder, setShotOrder] = useState(nextShotOrder)
  const [title, setTitle] = useState('')
  const [shotType, setShotType] = useState<ShotType>('story')
  const [status, setStatus] = useState<ShotStatus>('draft')
  const [durationSec, setDurationSec] = useState('4')
  const [cameraShot, setCameraShot] = useState('medium shot')
  const [cameraAngle, setCameraAngle] = useState('eye level')
  const [cameraMovement, setCameraMovement] = useState('slow push-in')
  const [action, setAction] = useState('')
  const [dialogue, setDialogue] = useState('')
  const [emotion, setEmotion] = useState('')
  const [visualPrompt, setVisualPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [videoPrompt, setVideoPrompt] = useState('')
  const [memo, setMemo] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'idle',
    message: null,
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      setSaveStatus({ status: 'failed', message: 'Shot title은 필수입니다.' })
      return
    }

    const duration = durationSec.trim() ? Number(durationSec) : null

    if (duration !== null && Number.isNaN(duration)) {
      setSaveStatus({
        status: 'failed',
        message: 'Duration은 숫자 형식으로 입력해야 합니다.',
      })
      return
    }

    setSaveStatus({ status: 'saving', message: 'Saving shot...' })

    try {
      const payload: CreateShotInput = {
        project_id: projectId,
        scene_id: sceneId,
        shot_order: shotOrder,
        title: title.trim(),
        shot_type: shotType,
        status,
        duration_sec: duration,
        camera_shot: cameraShot.trim() || null,
        camera_angle: cameraAngle.trim() || null,
        camera_movement: cameraMovement.trim() || null,
        action: action.trim() || null,
        dialogue: dialogue.trim() || null,
        emotion: emotion.trim() || null,
        visual_prompt: visualPrompt.trim() || null,
        negative_prompt: negativePrompt.trim() || null,
        video_prompt: videoPrompt.trim() || null,
        memo: memo.trim() || null,
      }

      const createdShot = await createShot(payload)
      onCreated(createdShot)
      setSaveStatus({
        status: 'saved',
        message: `Saved shot: ${createdShot.id.slice(0, 8)}`,
      })
      setShotOrder(shotOrder + 1)
      setTitle('')
      setAction('')
      setDialogue('')
      setEmotion('')
      setVisualPrompt('')
      setNegativePrompt('')
      setVideoPrompt('')
      setMemo('')
    } catch (error) {
      setSaveStatus({
        status: 'failed',
        message:
          error instanceof Error
            ? error.message
            : 'Shot 저장 중 오류가 발생했습니다.',
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-300">New Shot</p>
          <p className="mt-1 text-xs text-slate-500">
            현재 Scene을 영상 제작 가능한 Shot 단위로 분해합니다.
          </p>
        </div>
        <button
          type="submit"
          disabled={saveStatus.status === 'saving'}
          className="rounded-xl border border-emerald-700 bg-emerald-950 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-600"
        >
          {saveStatus.status === 'saving' ? 'Saving...' : 'Save Shot'}
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InputField
          label="Shot Order"
          type="number"
          value={String(shotOrder)}
          onChange={(value) => setShotOrder(Number(value))}
        />
        <InputField label="Title" value={title} onChange={setTitle} />
        <SelectField
          label="Shot Type"
          value={shotType}
          options={SHOT_TYPE_OPTIONS}
          onChange={(value) => setShotType(value as ShotType)}
        />
        <SelectField
          label="Status"
          value={status}
          options={SHOT_STATUS_OPTIONS}
          onChange={(value) => setStatus(value as ShotStatus)}
        />
        <InputField
          label="Duration Sec"
          type="number"
          value={durationSec}
          onChange={setDurationSec}
        />
        <InputField label="Camera Shot" value={cameraShot} onChange={setCameraShot} />
        <InputField label="Camera Angle" value={cameraAngle} onChange={setCameraAngle} />
        <InputField
          label="Camera Movement"
          value={cameraMovement}
          onChange={setCameraMovement}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextAreaField label="Action" value={action} onChange={setAction} />
        <TextAreaField label="Dialogue" value={dialogue} onChange={setDialogue} />
        <TextAreaField label="Emotion" value={emotion} onChange={setEmotion} />
        <TextAreaField label="Memo" value={memo} onChange={setMemo} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <TextAreaField
          label="Visual Prompt"
          value={visualPrompt}
          onChange={setVisualPrompt}
          rows={4}
        />
        <TextAreaField
          label="Video Prompt"
          value={videoPrompt}
          onChange={setVideoPrompt}
          rows={4}
        />
        <TextAreaField
          label="Negative Prompt"
          value={negativePrompt}
          onChange={setNegativePrompt}
          rows={4}
        />
      </div>

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
    </form>
  )
}

type InputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}

function InputField({ label, value, onChange, type = 'text' }: InputFieldProps) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
      />
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

type TextAreaFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}

function TextAreaField({ label, value, onChange, rows = 3 }: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-200 outline-none focus:border-cyan-500"
      />
    </label>
  )
}

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  createAsset,
  uploadAssetFile,
  type Asset,
  type CreateAssetInput,
} from '../../services/assetService'
import type { PromptRunWithDetails } from '../../services/promptRunService'

type AssetCreateFormProps = {
  projectId: string
  promptRuns: PromptRunWithDetails[]
  onCreated: (asset: Asset) => void
}

type SaveStatus = {
  status: 'idle' | 'saving' | 'saved' | 'failed'
  message: string | null
}

type UploadStatus = {
  status: 'idle' | 'uploading' | 'uploaded' | 'failed'
  message: string | null
}

const ASSET_TYPE_OPTIONS = [
  'character_image',
  'location_image',
  'scene_image',
  'video',
  'reference',
  'other',
]

const SOURCE_TYPE_OPTIONS = [
  'google_flow',
  'manual_upload',
  'external',
  'reference',
]

const STATUS_OPTIONS = ['candidate', 'approved', 'rejected', 'archived']
const PROJECT_SLUG = 'eternal-rift'

export function AssetCreateForm({
  projectId,
  promptRuns,
  onCreated,
}: AssetCreateFormProps) {
  const [promptRunId, setPromptRunId] = useState('')
  const [assetType, setAssetType] = useState('scene_image')
  const [sourceType, setSourceType] = useState('google_flow')
  const [status, setStatus] = useState('candidate')
  const [relatedEntityType, setRelatedEntityType] = useState('scene')
  const [relatedEntityId, setRelatedEntityId] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [storagePath, setStoragePath] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const [promptUsed, setPromptUsed] = useState('')
  const [metadataText, setMetadataText] = useState(`{
  "selected_candidate": true
}`)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'idle',
    message: null,
  })
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: null,
  })

  const selectedPromptRun = useMemo(
    () => promptRuns.find((promptRun) => promptRun.id === promptRunId) ?? null,
    [promptRunId, promptRuns],
  )

  const handlePromptRunChange = (nextPromptRunId: string) => {
    setPromptRunId(nextPromptRunId)

    const nextPromptRun =
      promptRuns.find((promptRun) => promptRun.id === nextPromptRunId) ?? null

    if (!nextPromptRun) {
      return
    }

    setPromptUsed(nextPromptRun.positive_prompt)

    if (nextPromptRun.prompt_type === 'character') {
      setAssetType('character_image')
      setRelatedEntityType('character')
      setRelatedEntityId(nextPromptRun.character_id ?? '')
    }

    if (nextPromptRun.prompt_type === 'location') {
      setAssetType('location_image')
      setRelatedEntityType('location')
      setRelatedEntityId(nextPromptRun.location_id ?? '')
    }

    if (nextPromptRun.prompt_type === 'scene') {
      setAssetType('scene_image')
      setRelatedEntityType('scene')
      setRelatedEntityId('')
    }

    setMetadataText(
      JSON.stringify(
        {
          prompt_run_id: nextPromptRun.id,
          prompt_type: nextPromptRun.prompt_type,
          character_id: nextPromptRun.character_id,
          character_name: nextPromptRun.characters?.name ?? null,
          location_id: nextPromptRun.location_id,
          location_name: nextPromptRun.locations?.name ?? null,
          selected_candidate: true,
        },
        null,
        2,
      ),
    )
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedFileName(file.name)
    setUploadStatus({ status: 'uploading', message: 'Uploading file...' })

    try {
      const uploadedFile = await uploadAssetFile({
        file,
        projectSlug: PROJECT_SLUG,
        assetType,
        promptRunId,
      })

      setStoragePath(uploadedFile.storage_path)
      setExternalUrl(uploadedFile.public_url)
      setSourceType('manual_upload')
      setUploadStatus({
        status: 'uploaded',
        message: `Uploaded to ${uploadedFile.storage_path}`,
      })
      mergeMetadata({
        storage_bucket: uploadedFile.bucket,
        uploaded_file_name: file.name,
        uploaded_file_size: file.size,
        uploaded_file_type: file.type || null,
      })
    } catch (error) {
      setUploadStatus({
        status: 'failed',
        message:
          error instanceof Error
            ? error.message
            : '파일 업로드 중 오류가 발생했습니다.',
      })
    }
  }

  const mergeMetadata = (nextMetadata: Record<string, unknown>) => {
    try {
      const currentMetadata = metadataText.trim() ? JSON.parse(metadataText) : {}
      setMetadataText(
        JSON.stringify(
          {
            ...currentMetadata,
            ...nextMetadata,
          },
          null,
          2,
        ),
      )
    } catch {
      setMetadataText(JSON.stringify(nextMetadata, null, 2))
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!externalUrl.trim() && !storagePath.trim()) {
      setSaveStatus({
        status: 'failed',
        message: 'external_url 또는 storage_path 중 하나는 입력해야 합니다.',
      })
      return
    }

    let generationMetadata: Record<string, unknown> = {}

    try {
      generationMetadata = metadataText.trim() ? JSON.parse(metadataText) : {}
    } catch {
      setSaveStatus({
        status: 'failed',
        message: 'Generation Metadata JSON 형식이 올바르지 않습니다.',
      })
      return
    }

    setSaveStatus({ status: 'saving', message: 'Saving asset...' })

    try {
      const payload: CreateAssetInput = {
        project_id: projectId,
        prompt_run_id: promptRunId || null,
        related_entity_type: relatedEntityType || null,
        related_entity_id: relatedEntityId || null,
        asset_type: assetType,
        source_type: sourceType,
        external_url: externalUrl.trim() || null,
        storage_path: storagePath.trim() || null,
        prompt_used: promptUsed.trim() || selectedPromptRun?.positive_prompt || null,
        generation_metadata: generationMetadata,
        status,
      }

      const createdAsset = await createAsset(payload)
      onCreated(createdAsset)
      setSaveStatus({
        status: 'saved',
        message: `Saved asset: ${createdAsset.id.slice(0, 8)}`,
      })
      setExternalUrl('')
      setStoragePath('')
      setSelectedFileName('')
      setUploadStatus({ status: 'idle', message: null })
    } catch (error) {
      setSaveStatus({
        status: 'failed',
        message:
          error instanceof Error
            ? error.message
            : 'Asset 저장 중 오류가 발생했습니다.',
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Add Asset</h2>
          <p className="mt-1 text-sm text-slate-500">
            Google Flow 생성 결과를 기존 prompt_run과 연결해 수동 등록합니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-400">Prompt Run</span>
          <select
            value={promptRunId}
            onChange={(event) => handlePromptRunChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
          >
            <option value="">No prompt run</option>
            {promptRuns.map((promptRun) => (
              <option key={promptRun.id} value={promptRun.id}>
                {getPromptRunLabel(promptRun)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">Asset Type</span>
          <select
            value={assetType}
            onChange={(event) => setAssetType(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
          >
            {ASSET_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">Source Type</span>
          <select
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
          >
            {SOURCE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">Related Entity Type</span>
          <select
            value={relatedEntityType}
            onChange={(event) => setRelatedEntityType(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
          >
            <option value="scene">scene</option>
            <option value="character">character</option>
            <option value="location">location</option>
            <option value="project">project</option>
            <option value="reference">reference</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">Related Entity ID</span>
          <input
            value={relatedEntityId}
            onChange={(event) => setRelatedEntityId(event.target.value)}
            placeholder="optional uuid"
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
          />
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">
            Upload Asset File
          </span>
          <p className="mt-1 text-xs text-slate-500">
            Google Flow에서 다운로드한 이미지/영상 파일을 Supabase Storage assets bucket에 업로드합니다.
          </p>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={uploadStatus.status === 'uploading'}
            className="mt-3 block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-100 hover:file:bg-cyan-900 disabled:cursor-not-allowed"
          />
        </label>

        {selectedFileName && (
          <p className="mt-2 text-xs text-slate-500">
            Selected file: {selectedFileName}
          </p>
        )}

        {uploadStatus.message && (
          <p
            className={`mt-3 text-sm ${
              uploadStatus.status === 'failed'
                ? 'text-red-300'
                : uploadStatus.status === 'uploaded'
                  ? 'text-emerald-300'
                  : 'text-slate-400'
            }`}
          >
            {uploadStatus.message}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-400">External URL</span>
          <input
            value={externalUrl}
            onChange={(event) => setExternalUrl(event.target.value)}
            placeholder="https://..."
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">Storage Path</span>
          <input
            value={storagePath}
            onChange={(event) => setStoragePath(event.target.value)}
            placeholder="assets/eternal-rift/..."
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm text-slate-400">Prompt Used</span>
        <textarea
          value={promptUsed}
          onChange={(event) => setPromptUsed(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-200 outline-none focus:border-cyan-500"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm text-slate-400">Generation Metadata JSON</span>
        <textarea
          value={metadataText}
          onChange={(event) => setMetadataText(event.target.value)}
          rows={6}
          className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-200 outline-none focus:border-cyan-500"
        />
      </label>

      <button
        type="submit"
        disabled={saveStatus.status === 'saving'}
        className="mt-5 rounded-xl border border-emerald-700 bg-emerald-950 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-950 disabled:text-slate-600"
      >
        {saveStatus.status === 'saving' ? 'Saving...' : 'Save Asset'}
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
    </form>
  )
}

function getPromptRunLabel(promptRun: PromptRunWithDetails) {
  const characterName = promptRun.characters?.name
  const locationName = promptRun.locations?.name
  const subject =
    characterName && locationName
      ? `${characterName} @ ${locationName}`
      : characterName ?? locationName ?? promptRun.prompt_type

  return `${subject} · ${promptRun.output_status} · ${promptRun.id.slice(0, 8)}`
}

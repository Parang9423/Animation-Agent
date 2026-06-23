import { useEffect, useMemo, useState } from 'react'
import type { CharacterWithWorldview } from '../../services/characterService'
import type { PromptTemplate } from '../../services/promptTemplateService'

const DEFAULT_STYLE_PROMPT_PREFIX =
  'cinematic anime dark fantasy, highly detailed anime key visual, dramatic lighting, cold blue atmosphere, Google Flow-ready composition'

type PromptBuilderPanelProps = {
  characters: CharacterWithWorldview[]
  promptTemplates: PromptTemplate[]
}

export function PromptBuilderPanel({
  characters,
  promptTemplates,
}: PromptBuilderPanelProps) {
  const characterTemplates = useMemo(
    () => promptTemplates.filter((template) => template.template_type === 'character'),
    [promptTemplates],
  )

  const [selectedCharacterId, setSelectedCharacterId] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  )

  useEffect(() => {
    if (!selectedCharacterId && characters.length > 0) {
      setSelectedCharacterId(characters[0].id)
    }
  }, [characters, selectedCharacterId])

  useEffect(() => {
    if (!selectedTemplateId && characterTemplates.length > 0) {
      setSelectedTemplateId(characterTemplates[0].id)
    }
  }, [characterTemplates, selectedTemplateId])

  const selectedCharacter =
    characters.find((character) => character.id === selectedCharacterId) ?? null

  const selectedTemplate =
    characterTemplates.find((template) => template.id === selectedTemplateId) ?? null

  const generatedPrompt = useMemo(() => {
    if (!selectedCharacter || !selectedTemplate?.template_body) {
      return ''
    }

    return buildCharacterPrompt(
      selectedTemplate.template_body,
      selectedCharacter,
      DEFAULT_STYLE_PROMPT_PREFIX,
    )
  }, [selectedCharacter, selectedTemplate])

  const handleCopy = async () => {
    if (!generatedPrompt) {
      return
    }

    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopyStatus('copied')
      window.setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('failed')
      window.setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Prompt Builder</h2>
          <p className="mt-1 text-sm text-slate-500">
            캐릭터 데이터와 Google Flow Character 템플릿을 조합해 최종 프롬프트를 생성합니다.
          </p>
        </div>

        <span className="rounded-full border border-cyan-700 bg-cyan-950 px-3 py-1 text-sm text-cyan-200">
          character MVP
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
          <p className="text-sm font-semibold text-slate-300">Builder Settings</p>

          <label className="mt-5 block">
            <span className="text-sm text-slate-400">Template Type</span>
            <input
              value="character"
              readOnly
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none"
            />
          </label>

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

          <label className="mt-5 block">
            <span className="text-sm text-slate-400">Prompt Template</span>
            <select
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
            >
              {characterTemplates.map((template) => (
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
              {DEFAULT_STYLE_PROMPT_PREFIX}
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-slate-300">
              Selected Data
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Character: {selectedCharacter?.name ?? 'No character'}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Template: {selectedTemplate?.name ?? 'No template'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-300">
                Generated Prompt Preview
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Google Flow에 바로 복사해 테스트할 수 있는 최종 프롬프트입니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!generatedPrompt}
              className="rounded-xl border border-cyan-700 bg-cyan-950 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-950 disabled:text-slate-600"
            >
              {copyStatus === 'copied'
                ? 'Copied'
                : copyStatus === 'failed'
                  ? 'Copy Failed'
                  : 'Copy Prompt'}
            </button>
          </div>

          <pre className="mt-5 min-h-[520px] whitespace-pre-wrap break-words rounded-xl border border-cyan-900 bg-cyan-950/20 p-5 text-sm leading-7 text-slate-300">
            {generatedPrompt || '프롬프트를 생성하려면 캐릭터와 템플릿 데이터가 필요합니다.'}
          </pre>
        </div>
      </div>
    </section>
  )
}

function buildCharacterPrompt(
  templateBody: string,
  character: CharacterWithWorldview,
  stylePromptPrefix: string,
) {
  const values: Record<string, string> = {
    'style.prompt_prefix': stylePromptPrefix,
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

  return templateBody.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => {
    return values[key] ?? `{{${key}}}`
  })
}

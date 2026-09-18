"use client"

import { useEffect, useState } from "react"
import { ChevronDown, LoaderCircle, Mic } from "lucide-react"
import { LanguagePicker } from "@/components/language-picker"
import { autoLanguage, languages } from "@/lib/languages"
import type { Language } from "@/lib/translation-types"

type SourceEditorProps = {
  sourceLanguage: Language
  phrase: string
  phraseRevision: number
  isLoading: boolean
  isListening: boolean
  onSourceChange: (language: Language) => void
  onPhraseChange: (phrase: string) => void
  onTranslate: () => void
  onToggleListening: () => void
}

export function SourceEditor({
  sourceLanguage,
  phrase: externalPhrase,
  phraseRevision,
  isLoading,
  isListening,
  onSourceChange,
  onPhraseChange,
  onTranslate,
  onToggleListening,
}: SourceEditorProps) {
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [phrase, setPhrase] = useState(externalPhrase)
  const [previousRevision, setPreviousRevision] = useState(phraseRevision)

  if (phraseRevision !== previousRevision) {
    setPreviousRevision(phraseRevision)
    setPhrase(externalPhrase)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") setKeyboardFocus(true)
    }
    const onPointerDown = () => setKeyboardFocus(false)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("pointerdown", onPointerDown)
    }
  }, [])

  return (
    <section className="min-w-0" aria-label="Original text">
      <div className="mb-3 flex min-h-[39px] items-center justify-between gap-3 text-[13px] font-bold text-muted-ink [&>span]:pl-[11px]">
        <span>Translate from</span>
        <LanguagePicker
          items={[autoLanguage, ...languages]}
          onSelect={onSourceChange}
        >
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-2 text-xs font-bold whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Source language"
          >
            {sourceLanguage.name} <ChevronDown size={15} />
          </button>
        </LanguagePicker>
      </div>
      <div
        className={`flex min-h-[316px] flex-col rounded-2xl border border-line bg-paper px-[22px] pt-[22px] pb-[18px] transition-[border-color,box-shadow] duration-150 max-[900px]:min-h-[240px] max-[600px]:px-[17px] max-[600px]:pt-[17px] max-[600px]:pb-[10px] ${keyboardFocus ? "focus-within:border-primary focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_16%,transparent)]" : ""}`}
      >
        <textarea
          aria-label="Text to translate"
          className={`field-sizing-content min-h-60 w-full flex-none resize-none border-0 bg-transparent leading-normal font-medium tracking-[-0.035em] text-ink outline-none placeholder:text-muted-ink max-[900px]:min-h-42 ${
            phrase.length > 600
              ? "text-base"
              : phrase.length > 250
                ? "text-[19px]"
                : "text-[clamp(16px,2vw,26px)] max-[600px]:text-[21px]"
          }`}
          value={phrase}
          onChange={(event) => {
            setPhrase(event.target.value)
            onPhraseChange(event.target.value)
          }}
          onKeyDown={(event) => {
            if (
              (event.ctrlKey || event.metaKey) &&
              typeof event.key === "string" &&
              event.key.toLowerCase() === "enter"
            ) {
              event.preventDefault()
              event.stopPropagation()
              onTranslate()
            }
          }}
          maxLength={5000}
          placeholder="Enter text"
        />
        <div className="mt-5 flex items-center justify-between text-xs font-semibold text-muted-ink">
          <button
            className={`grid size-9 place-items-center rounded-[9px] text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isListening ? "bg-hover" : ""}`}
            onClick={onToggleListening}
            title="Dictate text"
            aria-label="Dictate text"
          >
            <Mic size={18} />
          </button>
          <span>{phrase.length} / 5,000</span>
        </div>
      </div>
      <button
        className="mt-[19px] inline-flex h-[47px] min-w-[152px] items-center justify-center gap-[9px] rounded-[11px] bg-primary px-6 text-sm font-[750] text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#172042]"
        onClick={() => onTranslate()}
        disabled={isLoading || !phrase.trim()}
      >
        {isLoading && <LoaderCircle className="animate-quick-spin" size={18} />}
        {isLoading ? "Translating" : "Translate"}
      </button>
      <p className="mt-[10px] text-[11px] font-medium text-muted-ink">
        Ctrl + Enter to translate
      </p>
    </section>
  )
}

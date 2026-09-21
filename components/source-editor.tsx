"use client"

import { useEffect, useState } from "react"
import { ChevronDown, LoaderCircle, Mic } from "lucide-react"
import { LanguagePicker } from "@/components/language-picker"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { autoLanguage, languages } from "@/lib/languages"
import type { Language } from "@/lib/translation-types"
import { getTranslationTextSize } from "@/lib/translation-text-size"

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
      <div className="mb-3 flex min-h-9.75 items-center justify-between gap-3 text-[13px] font-bold text-muted-ink [&>span]:pl-2.75">
        <span>Translate from</span>
        <LanguagePicker
          items={[autoLanguage, ...languages]}
          onSelect={onSourceChange}
        >
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg border-line bg-paper px-3 text-xs font-bold whitespace-nowrap text-ink hover:bg-hover hover:text-ink"
            aria-label="Source language"
          >
            {sourceLanguage.name} <ChevronDown data-icon="inline-end" />
          </Button>
        </LanguagePicker>
      </div>
      <div
        className={`flex min-h-79 flex-col rounded-2xl border border-line bg-paper px-5.5 pt-5.5 pb-4.5 transition-[border-color,box-shadow] duration-150 max-[900px]:min-h-60 max-[600px]:px-4.25 max-[600px]:pt-4.25 max-[600px]:pb-2.5 ${keyboardFocus ? "focus-within:border-primary focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_16%,transparent)]" : ""}`}
      >
        <Textarea
          aria-label="Text to translate"
          className={`min-h-60 w-full flex-none resize-none rounded-none border-0 bg-transparent p-0 leading-normal font-medium tracking-[-0.035em] text-ink shadow-none outline-none placeholder:text-muted-ink focus-visible:ring-0 max-[900px]:min-h-42 ${getTranslationTextSize(phrase.length)}`}
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
          <Button
            variant="ghost"
            size="icon"
            className={`size-9 rounded-[9px] text-primary hover:bg-hover ${isListening ? "bg-hover" : ""}`}
            onClick={onToggleListening}
            title="Dictate text"
            aria-label="Dictate text"
          >
            <Mic />
          </Button>
          <span>{phrase.length} / 5,000</span>
        </div>
      </div>
      <Button
        variant="default"
        size="lg"
        className="mt-4.75 h-11.75 min-w-38 rounded-[11px] bg-primary px-6 text-sm font-[750] text-white hover:bg-primary-hover dark:text-[#172042]"
        onClick={() => onTranslate()}
        disabled={isLoading || !phrase.trim()}
      >
        {isLoading && (
          <LoaderCircle
            data-icon="inline-start"
            className="animate-quick-spin"
          />
        )}
        {isLoading ? "Translating" : "Translate"}
      </Button>
      <p className="mt-2.5 ml-2.5 text-[11px] font-medium text-muted-ink">
        Ctrl + Enter to translate
      </p>
    </section>
  )
}

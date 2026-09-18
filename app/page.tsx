"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus } from "lucide-react"
import { Reorder } from "framer-motion"
import { LanguagePicker } from "@/components/language-picker"
import { SourceEditor } from "@/components/source-editor"
import { WorkspaceHeader } from "@/components/workspace-header"
import { TranslationCard } from "@/components/translation-card"
import { languages, autoLanguage, fallback } from "@/lib/languages"
import type {
  Language,
  Translation,
  SavedItem,
  HistoryItem,
} from "@/lib/translation-types"

type SpeechRecognitionResultLike = { 0: { transcript: string } }
type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>
}
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  onresult: (event: SpeechRecognitionEventLike) => void
  onend: () => void
  start: () => void
  stop: () => void
}

const cleanupAbortReason = "component cleanup"
const supersededAbortReason = "translation superseded"

function readLocal<T>(key: string): T[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]")
    return Array.isArray(value) ? (value as T[]) : []
  } catch {
    return []
  }
}

export default function Page() {
  const spanish = languages.find((item) => item.locale === "es")!
  const [phrase, setPhrase] = useState("Hello, how are you?")
  const phraseRef = useRef(phrase)
  const [phraseRevision, setPhraseRevision] = useState(0)
  const [sourceLanguage, setSourceLanguage] = useState<Language>(autoLanguage)
  const [submittedPhrase, setSubmittedPhrase] = useState(phrase)
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([
    spanish,
  ])
  const [translations, setTranslations] = useState<Translation[]>([
    fallback(phrase, spanish),
  ])
  const [saved, setSaved] = useState<SavedItem[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultsRef = useRef<HTMLElement>(null)
  const pendingHistoryDeletes = useRef(new Set<string>())
  const historyRef = useRef<HistoryItem[]>([])
  const historyTouchedRef = useRef(false)
  const translationRequestRef = useRef<AbortController | null>(null)
  const [languagesReady, setLanguagesReady] = useState(false)

  function commitHistory(next: HistoryItem[], persist = true) {
    historyRef.current = next
    setHistory(next)
    if (persist) {
      try {
        localStorage.setItem("multilingo-history", JSON.stringify(next))
      } catch {
        // Keep the in-memory list usable when storage is unavailable.
      }
    }
  }

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (!active) return
      try {
        const preferences = JSON.parse(
          localStorage.getItem("multilingo-languages") ?? "null"
        )
        const source = [autoLanguage, ...languages].find(
          (item) => item.locale === preferences?.source
        )
        const targets = Array.isArray(preferences?.targets)
          ? [...new Set(preferences.targets as string[])]
              .map((locale) => languages.find((item) => item.locale === locale))
              .filter((item): item is Language => Boolean(item))
          : null
        if (source) setSourceLanguage(source)
        if (targets) {
          setSelectedLanguages(targets)
          setTranslations(
            targets.map((item) => fallback("Hello, how are you?", item))
          )
        }
      } catch {
        /* Ignore invalid preferences. */
      }
      setLanguagesReady(true)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (languagesReady) {
      try {
        localStorage.setItem(
          "multilingo-languages",
          JSON.stringify({
            source: sourceLanguage.locale,
            targets: selectedLanguages.map((item) => item.locale),
          })
        )
      } catch {
        // Storage may be unavailable in private browsing.
      }
    }
  }, [languagesReady, sourceLanguage, selectedLanguages])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    queueMicrotask(() => {
      if (!active) return
      setSaved(readLocal<SavedItem>("multilingo-saved"))
      if (!historyTouchedRef.current)
        commitHistory(readLocal<HistoryItem>("multilingo-history"), false)
    })
    void fetch("/api/history", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data?.signedIn && !historyTouchedRef.current)
          commitHistory(Array.isArray(data.history) ? data.history : [], false)
      })
      .catch(() => undefined)
    return () => {
      active = false
      controller.abort(cleanupAbortReason)
      translationRequestRef.current?.abort(cleanupAbortReason)
      recognitionRef.current?.stop()
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])
  const availableLanguages = useMemo(
    () =>
      languages.filter(
        (language) =>
          !selectedLanguages.some(
            (selected) => selected.locale === language.locale
          )
      ),
    [selectedLanguages]
  )
  function openHistory(item: HistoryItem) {
    translationRequestRef.current?.abort(supersededAbortReason)
    setIsLoading(false)
    setPhrase(item.phrase)
    setPhraseRevision((revision) => revision + 1)
    phraseRef.current = item.phrase
    setSourceLanguage(autoLanguage)
    setSubmittedPhrase(item.phrase)
    setSelectedLanguages(item.translations)
    setTranslations(item.translations)
  }
  function recordHistory(nextPhrase: string, nextTranslations: Translation[]) {
    historyTouchedRef.current = true
    const item = {
      id: crypto.randomUUID(),
      phrase: nextPhrase,
      translations: nextTranslations,
      createdAt: new Date().toISOString(),
    }
    const next = [
      item,
      ...historyRef.current.filter((entry) => entry.phrase !== nextPhrase),
    ].slice(0, 100)
    commitHistory(next)
    void fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phrase: nextPhrase,
        translations: nextTranslations,
      }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data?.id) return
        if (pendingHistoryDeletes.current.delete(item.id)) {
          void fetch("/api/history", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: data.id }),
          }).catch(() => undefined)
          return
        }
        commitHistory(
          historyRef.current.map((entry) =>
            entry.id === item.id ? { ...entry, id: String(data.id) } : entry
          )
        )
      })
      .catch(() => undefined)
  }
  function deleteHistory(item: HistoryItem) {
    historyTouchedRef.current = true
    if (!/^\d+$/.test(String(item.id)))
      pendingHistoryDeletes.current.add(item.id)
    const next = historyRef.current.filter((entry) => entry.id !== item.id)
    commitHistory(next)
    if (/^\d+$/.test(String(item.id))) {
      void fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      }).catch(() => undefined)
    }
  }
  function reorderLanguages(nextLanguages: Language[]) {
    setSelectedLanguages(nextLanguages)
    setTranslations((items) =>
      nextLanguages.map(
        (language) =>
          items.find((item) => item.locale === language.locale) ??
          fallback(submittedPhrase, language)
      )
    )
  }
  function scrollToResults() {
    if (window.matchMedia("(max-width: 900px)").matches) {
      resultsRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      })
    }
  }
  async function translate(
    nextLanguages = selectedLanguages,
    source = sourceLanguage
  ) {
    const nextPhrase = phraseRef.current.trim() || submittedPhrase
    if (!nextPhrase || nextLanguages.length === 0) return
    translationRequestRef.current?.abort(supersededAbortReason)
    const controller = new AbortController()
    translationRequestRef.current = controller
    setIsLoading(true)
    setSubmittedPhrase(nextPhrase)
    scrollToResults()
    let nextTranslations: Translation[]
    try {
      const response = await fetch("/api/translate", {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase: nextPhrase,
          sourceLanguage: source.locale === "auto" ? undefined : source.locale,
          targetLanguages: nextLanguages.map(({ locale }) => locale),
        }),
      })
      if (!response.ok) throw new Error("Translation request failed")
      const data = await response.json()
      nextTranslations = nextLanguages.map((language) => ({
        ...language,
        text:
          data.translations?.find(
            (item: { locale: string }) => item.locale === language.locale
          )?.text ?? fallback(nextPhrase, language).text,
      }))
    } catch {
      if (controller.signal.aborted) {
        if (translationRequestRef.current === controller) {
          translationRequestRef.current = null
        }
        return
      }
      nextTranslations = nextLanguages.map((language) =>
        fallback(nextPhrase, language)
      )
    }
    if (controller.signal.aborted) {
      if (translationRequestRef.current === controller) {
        translationRequestRef.current = null
      }
      return
    }
    setTranslations(nextTranslations)
    recordHistory(nextPhrase, nextTranslations)
    if (translationRequestRef.current === controller) {
      translationRequestRef.current = null
    }
    setIsLoading(false)
  }
  function addLanguage(language: Language) {
    const next = [...selectedLanguages, language]
    setSelectedLanguages(next)
    setTranslations((items) => [...items, fallback(submittedPhrase, language)])
    void translate(next)
  }
  function changeLanguage(index: number, language: Language) {
    const next = selectedLanguages.map((item, i) =>
      i === index ? language : item
    )
    setSelectedLanguages(next)
    setTranslations((items) =>
      items.map((item, i) =>
        i === index ? fallback(submittedPhrase, language) : item
      )
    )
    void translate(next)
  }
  function removeLanguage(index: number) {
    const nextLanguages = selectedLanguages.filter((_, i) => i !== index)
    setSelectedLanguages(nextLanguages)
    setTranslations((items) => items.filter((_, i) => i !== index))
    if (isLoading && nextLanguages.length > 0) {
      void translate(nextLanguages)
    } else if (isLoading) {
      translationRequestRef.current?.abort(supersededAbortReason)
      setIsLoading(false)
    }
  }
  function persistSaved(next: SavedItem[]) {
    setSaved(next)
    try {
      localStorage.setItem("multilingo-saved", JSON.stringify(next))
    } catch {
      // Keep saved items available for the current session.
    }
  }
  function toggleSaved(translation: Translation) {
    const id = `${submittedPhrase}::${translation.locale}`
    persistSaved(
      saved.some((item) => item.id === id)
        ? saved.filter((item) => item.id !== id)
        : [
            {
              id,
              phrase: submittedPhrase,
              translation,
              createdAt: new Date().toISOString(),
            },
            ...saved,
          ]
    )
  }
  async function copy(translation: Translation) {
    await navigator.clipboard.writeText(translation.text)
    setCopied(translation.locale)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(null), 1200)
  }
  async function share(translation: Translation) {
    const text = `${submittedPhrase}\n${translation.text}`
    if (navigator.share)
      await navigator
        .share({ title: `${translation.name} translation`, text })
        .catch(() => undefined)
    else await navigator.clipboard.writeText(text)
  }
  function speak(text: string, locale: string) {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = locale
    speechSynthesis.speak(utterance)
  }
  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const SpeechRecognition = (
      window as typeof window & {
        webkitSpeechRecognition?: new () => SpeechRecognitionLike
      }
    ).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang =
      sourceLanguage.locale === "auto" ? "en-US" : sourceLanguage.locale
    recognition.interimResults = true
    recognition.onresult = (event) => {
      const nextPhrase = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")
      phraseRef.current = nextPhrase
      setPhrase(nextPhrase)
      setPhraseRevision((revision) => revision + 1)
    }

    recognition.onend = () => setIsListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <WorkspaceHeader
        history={history}
        saved={saved}
        openHistory={openHistory}
        deleteHistory={deleteHistory}
      />
      <section
        id="workspace"
        className="mx-auto grid min-h-[calc(100vh-74px)] w-[min(1320px,calc(100%-48px))] grid-cols-2 items-stretch gap-3 py-6 pb-8 max-[900px]:flex max-[900px]:w-[min(680px,calc(100%-28px))] max-[900px]:flex-col max-[900px]:pt-3.5 max-[600px]:w-[calc(100%-20px)] max-[600px]:gap-2.5 max-[600px]:pt-2.5"
      >
        <SourceEditor
          sourceLanguage={sourceLanguage}
          phrase={phrase}
          phraseRevision={phraseRevision}
          isLoading={isLoading}
          isListening={isListening}
          onSourceChange={(language) => {
            setSourceLanguage(language)
            void translate(selectedLanguages, language)
          }}
          onPhraseChange={(value) => {
            phraseRef.current = value
          }}
          onTranslate={() => void translate()}
          onToggleListening={toggleListening}
        />
        <section
          ref={resultsRef}
          className="min-w-0 max-[900px]:scroll-mt-3.5"
          aria-label="Translations"
        >
          <div className="mb-3 flex min-h-9.75 items-center justify-between gap-3.5 text-[13px] font-bold text-muted-ink max-[360px]:flex-wrap max-[360px]:gap-2 [&>span]:pl-2.75">
            <span>Translate to</span>
            <LanguagePicker items={availableLanguages} onSelect={addLanguage}>
              <button
                className="inline-flex h-9.5 items-center justify-center gap-1.75 rounded-[9px] border border-line bg-paper px-3.25 text-xs font-[750] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:px-2.25 max-[600px]:text-[11px] max-[360px]:ml-auto"
                disabled={availableLanguages.length === 0}
              >
                <Plus size={17} /> Add language
              </button>
            </LanguagePicker>
          </div>
          <Reorder.Group
            axis="y"
            values={selectedLanguages}
            onReorder={reorderLanguages}
            className="grid content-start gap-3.25"
          >
            {selectedLanguages.map((language, index) => {
              const translation =
                translations.find((item) => item.locale === language.locale) ??
                fallback(submittedPhrase, language)
              return (
                <TranslationCard
                  key={language.locale}
                  language={language}
                  translation={translation}
                  index={index}
                  selectedLanguages={selectedLanguages}
                  isStarred={saved.some(
                    (item) =>
                      item.id === `${submittedPhrase}::${translation.locale}`
                  )}
                  copied={copied}
                  isLoading={isLoading}
                  changeLanguage={changeLanguage}
                  reorderLanguages={reorderLanguages}
                  removeLanguage={removeLanguage}
                  toggleSaved={toggleSaved}
                  copy={copy}
                  share={share}
                  speak={speak}
                />
              )
            })}
            {selectedLanguages.length === 0 && (
              <div className="grid min-h-52.5 place-content-center justify-items-center rounded-[15px] border border-dashed border-line text-muted-ink [&_button]:inline-flex [&_button]:items-center [&_button]:gap-1.5 [&_button]:rounded-lg [&_button]:bg-teal-soft [&_button]:px-3 [&_button]:py-2 [&_button]:font-bold [&_button]:text-primary">
                <p>No target languages yet.</p>
                <LanguagePicker
                  items={availableLanguages}
                  onSelect={addLanguage}
                >
                  <button>
                    <Plus size={17} /> Add a language
                  </button>
                </LanguagePicker>
              </div>
            )}
          </Reorder.Group>
        </section>
      </section>
    </main>
  )
}

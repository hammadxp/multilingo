"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  ArrowDown,
  ArrowUp,
  GripVertical,
  Globe2,
  Heart,
  LoaderCircle,
  Menu,
  Mic,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Star,
  Sun,
  Trash2,
  Volume2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Reorder } from "framer-motion"
import { AuthControls } from "@/components/auth-controls"
import { SiteHeader } from "@/components/site-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Language = { code: string; name: string; locale: string }
type Translation = Language & { text: string }
type SavedItem = {
  id: string
  phrase: string
  translation: Translation
  createdAt: string
}
type HistoryItem = {
  id: string
  phrase: string
  translations: Translation[]
  createdAt: string
}
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

const languageData = [
  ["AF", "Afrikaans", "af"],
  ["SQ", "Albanian", "sq"],
  ["AM", "Amharic", "am"],
  ["AR", "Arabic", "ar"],
  ["HY", "Armenian", "hy"],
  ["AS", "Assamese", "as"],
  ["AY", "Aymara", "ay"],
  ["AZ", "Azerbaijani", "az"],
  ["BM", "Bambara", "bm"],
  ["EU", "Basque", "eu"],
  ["BE", "Belarusian", "be"],
  ["BN", "Bengali", "bn"],
  ["BHO", "Bhojpuri", "bho"],
  ["BS", "Bosnian", "bs"],
  ["BG", "Bulgarian", "bg"],
  ["CA", "Catalan", "ca"],
  ["CEB", "Cebuano", "ceb"],
  ["ZH", "Chinese (Simplified)", "zh-CN"],
  ["ZH", "Chinese (Traditional)", "zh-TW"],
  ["CO", "Corsican", "co"],
  ["HR", "Croatian", "hr"],
  ["CS", "Czech", "cs"],
  ["DA", "Danish", "da"],
  ["DV", "Dhivehi", "dv"],
  ["DOI", "Dogri", "doi"],
  ["NL", "Dutch", "nl"],
  ["EO", "Esperanto", "eo"],
  ["ET", "Estonian", "et"],
  ["EE", "Ewe", "ee"],
  ["FIL", "Filipino", "tl"],
  ["FI", "Finnish", "fi"],
  ["FR", "French", "fr"],
  ["FY", "Frisian", "fy"],
  ["GL", "Galician", "gl"],
  ["KA", "Georgian", "ka"],
  ["DE", "German", "de"],
  ["EL", "Greek", "el"],
  ["GN", "Guarani", "gn"],
  ["GU", "Gujarati", "gu"],
  ["HT", "Haitian Creole", "ht"],
  ["HA", "Hausa", "ha"],
  ["HAW", "Hawaiian", "haw"],
  ["HE", "Hebrew", "iw"],
  ["HI", "Hindi", "hi"],
  ["HMN", "Hmong", "hmn"],
  ["HU", "Hungarian", "hu"],
  ["IS", "Icelandic", "is"],
  ["IG", "Igbo", "ig"],
  ["ILO", "Ilocano", "ilo"],
  ["ID", "Indonesian", "id"],
  ["GA", "Irish", "ga"],
  ["IT", "Italian", "it"],
  ["JA", "Japanese", "ja"],
  ["JV", "Javanese", "jw"],
  ["KN", "Kannada", "kn"],
  ["KK", "Kazakh", "kk"],
  ["KM", "Khmer", "km"],
  ["RW", "Kinyarwanda", "rw"],
  ["KOK", "Konkani", "gom"],
  ["KO", "Korean", "ko"],
  ["KR", "Krio", "kri"],
  ["KU", "Kurdish (Kurmanji)", "ku"],
  ["CKB", "Kurdish (Sorani)", "ckb"],
  ["KY", "Kyrgyz", "ky"],
  ["LO", "Lao", "lo"],
  ["LA", "Latin", "la"],
  ["LV", "Latvian", "lv"],
  ["LN", "Lingala", "ln"],
  ["LT", "Lithuanian", "lt"],
  ["LG", "Luganda", "lg"],
  ["LB", "Luxembourgish", "lb"],
  ["MK", "Macedonian", "mk"],
  ["MAI", "Maithili", "mai"],
  ["MG", "Malagasy", "mg"],
  ["MS", "Malay", "ms"],
  ["ML", "Malayalam", "ml"],
  ["MT", "Maltese", "mt"],
  ["MI", "Maori", "mi"],
  ["MR", "Marathi", "mr"],
  ["MN", "Mongolian", "mn"],
  ["MY", "Myanmar (Burmese)", "my"],
  ["NE", "Nepali", "ne"],
  ["NO", "Norwegian", "no"],
  ["NY", "Nyanja", "ny"],
  ["OR", "Odia", "or"],
  ["OM", "Oromo", "om"],
  ["PS", "Pashto", "ps"],
  ["FA", "Persian", "fa"],
  ["PL", "Polish", "pl"],
  ["PT", "Portuguese", "pt"],
  ["PA", "Punjabi", "pa"],
  ["QU", "Quechua", "qu"],
  ["RO", "Romanian", "ro"],
  ["RU", "Russian", "ru"],
  ["SM", "Samoan", "sm"],
  ["SA", "Sanskrit", "sa"],
  ["GD", "Scots Gaelic", "gd"],
  ["NSO", "Sepedi", "nso"],
  ["SR", "Serbian", "sr"],
  ["ST", "Sesotho", "st"],
  ["SN", "Shona", "sn"],
  ["SD", "Sindhi", "sd"],
  ["SI", "Sinhala", "si"],
  ["SK", "Slovak", "sk"],
  ["SL", "Slovenian", "sl"],
  ["SO", "Somali", "so"],
  ["ES", "Spanish", "es"],
  ["SU", "Sundanese", "su"],
  ["SW", "Swahili", "sw"],
  ["SV", "Swedish", "sv"],
  ["TG", "Tajik", "tg"],
  ["TA", "Tamil", "ta"],
  ["TT", "Tatar", "tt"],
  ["TE", "Telugu", "te"],
  ["TH", "Thai", "th"],
  ["TI", "Tigrinya", "ti"],
  ["TS", "Tsonga", "ts"],
  ["TR", "Turkish", "tr"],
  ["TK", "Turkmen", "tk"],
  ["AK", "Twi", "ak"],
  ["UK", "Ukrainian", "uk"],
  ["UR", "Urdu", "ur"],
  ["UG", "Uyghur", "ug"],
  ["UZ", "Uzbek", "uz"],
  ["VI", "Vietnamese", "vi"],
  ["CY", "Welsh", "cy"],
  ["XH", "Xhosa", "xh"],
  ["YI", "Yiddish", "yi"],
  ["YO", "Yoruba", "yo"],
  ["ZU", "Zulu", "zu"],
] as const
const languageRegions: Record<string, string> = {
  af: "ZA",
  am: "ET",
  ar: "SA",
  as: "IN",
  bn: "BD",
  bho: "IN",
  ceb: "PH",
  ckb: "IQ",
  dv: "MV",
  fil: "PH",
  fy: "NL",
  gu: "IN",
  ha: "NG",
  haw: "US",
  he: "IL",
  hi: "IN",
  hmn: "CN",
  ig: "NG",
  ilo: "PH",
  iw: "IL",
  jv: "ID",
  kn: "IN",
  kok: "IN",
  kr: "LR",
  ku: "TR",
  la: "VA",
  lg: "UG",
  ln: "CD",
  mai: "IN",
  ml: "IN",
  mn: "MN",
  my: "MM",
  ne: "NP",
  nso: "ZA",
  ny: "MW",
  om: "ET",
  or: "IN",
  pa: "IN",
  ps: "AF",
  qu: "PE",
  rw: "RW",
  sa: "IN",
  sd: "PK",
  si: "LK",
  sn: "ZW",
  so: "SO",
  st: "LS",
  su: "ID",
  sw: "KE",
  ta: "IN",
  te: "IN",
  ti: "ER",
  tl: "PH",
  ts: "ZA",
  ur: "PK",
  ug: "CN",
  uz: "UZ",
  xh: "ZA",
  yi: "IL",
  yo: "NG",
  zu: "ZA",
}
function flagForLocale(locale: string) {
  const region = languageRegions[locale] ?? new Intl.Locale(locale).maximize().region
  return /^[a-z]{2}$/i.test(region ?? "") ? region.toLowerCase() : "un"
}
function LanguageFlag({ locale }: { locale: string }) {
  if (locale === "auto") {
    return <span className="language-flag language-flag-auto" aria-hidden="true"><Globe2 size={16} /></span>
  }

  return (
    <span className="language-flag" aria-hidden="true">
      <Image
        src={`https://flagcdn.com/${flagForLocale(locale)}.svg`}
        width={24}
        height={18}
        alt=""
        unoptimized={false}
      />
    </span>
  )
}
const languages: Language[] = languageData.map(([code, name, locale]) => ({
  code,
  name,
  locale,
}))
const autoLanguage: Language = {
  code: "AUTO",
  name: "Auto detect",
  locale: "auto",
}
const demos: Record<string, string> = {
  es: "Hola, ¿cómo estás?",
  fr: "Bonjour, comment allez-vous ?",
  de: "Hallo, wie geht es dir?",
  ja: "こんにちは、お元気ですか？",
  ko: "안녕하세요, 잘 지내세요?",
  ar: "مرحبًا، كيف حالك؟",
  it: "Ciao, come stai?",
  pt: "Olá, como você está?",
  "zh-CN": "你好，你好吗？",
  hi: "नमस्ते, आप कैसे हैं?",
}
function fallback(phrase: string, language: Language): Translation {
  return {
    ...language,
    text:
      phrase.trim().toLowerCase() === "hello, how are you?"
        ? (demos[language.locale] ?? phrase)
        : `${phrase} · ${language.name}`,
  }
}
function readLocal<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]")
  } catch {
    return []
  }
}

export default function Page() {
  const { resolvedTheme, setTheme } = useTheme()
  const spanish = languages.find((item) => item.locale === "es")!
  const [phrase, setPhrase] = useState("Hello, how are you?")
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
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resultsRef = useRef<HTMLElement>(null)
  const pendingHistoryDeletes = useRef(new Set<string>())
  const [languagesReady, setLanguagesReady] = useState(false)
  const [themeReady, setThemeReady] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      setThemeReady(true)
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
  }, [])

  useEffect(() => {
    if (languagesReady)
      localStorage.setItem(
        "multilingo-languages",
        JSON.stringify({
          source: sourceLanguage.locale,
          targets: selectedLanguages.map((item) => item.locale),
        })
      )
  }, [languagesReady, sourceLanguage, selectedLanguages])

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

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const resize = () => {
      textarea.style.height = "0px"
      textarea.style.height = `${Math.max(240, textarea.scrollHeight)}px`
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [phrase])

  useEffect(() => {
    queueMicrotask(() => {
      setSaved(readLocal<SavedItem>("multilingo-saved"))
      setHistory(readLocal<HistoryItem>("multilingo-history"))
    })
    void fetch("/api/history")
      .then((response) => response.json())
      .then((data) => {
        if (data.signedIn) setHistory(data.history ?? [])
      })
      .catch(() => undefined)
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
    setPhrase(item.phrase)
    setSourceLanguage(autoLanguage)
    setSubmittedPhrase(item.phrase)
    setSelectedLanguages(item.translations)
    setTranslations(item.translations)
  }
  function recordHistory(nextPhrase: string, nextTranslations: Translation[]) {
    const item = {
      id: crypto.randomUUID(),
      phrase: nextPhrase,
      translations: nextTranslations,
      createdAt: new Date().toISOString(),
    }
    const next = [
      item,
      ...history.filter((entry) => entry.phrase !== nextPhrase),
    ].slice(0, 100)
    setHistory(next)
    localStorage.setItem("multilingo-history", JSON.stringify(next))
    void fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phrase: nextPhrase,
        translations: nextTranslations,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.id) return
        if (pendingHistoryDeletes.current.delete(item.id)) {
          void fetch("/api/history", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: data.id }),
          }).catch(() => undefined)
          return
        }
        setHistory((current) => {
          const updated = current.map((entry) =>
            entry.id === item.id ? { ...entry, id: String(data.id) } : entry
          )
          localStorage.setItem("multilingo-history", JSON.stringify(updated))
          return updated
        })
      })
      .catch(() => undefined)
  }
  function deleteHistory(item: HistoryItem) {
    if (!/^\d+$/.test(String(item.id)))
      pendingHistoryDeletes.current.add(item.id)
    const next = history.filter((entry) => entry.id !== item.id)
    setHistory(next)
    localStorage.setItem("multilingo-history", JSON.stringify(next))
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
    const nextPhrase = phrase.trim() || submittedPhrase
    if (!nextPhrase || nextLanguages.length === 0) return
    if (isLoading) return
    setIsLoading(true)
    setSubmittedPhrase(nextPhrase)
    scrollToResults()
    let nextTranslations: Translation[]
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase: nextPhrase,
          sourceLanguage: source.locale === "auto" ? undefined : source.locale,
          targetLanguages: nextLanguages.map(({ locale }) => locale),
        }),
      })
      const data = await response.json()
      nextTranslations = nextLanguages.map((language) => ({
        ...language,
        text:
          data.translations?.find(
            (item: { locale: string }) => item.locale === language.locale
          )?.text ?? fallback(nextPhrase, language).text,
      }))
    } catch {
      nextTranslations = nextLanguages.map((language) =>
        fallback(nextPhrase, language)
      )
    }
    setTranslations(nextTranslations)
    recordHistory(nextPhrase, nextTranslations)
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
    setSelectedLanguages((items) => items.filter((_, i) => i !== index))
    setTranslations((items) => items.filter((_, i) => i !== index))
  }
  function persistSaved(next: SavedItem[]) {
    setSaved(next)
    localStorage.setItem("multilingo-saved", JSON.stringify(next))
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
    window.setTimeout(() => setCopied(null), 1200)
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
    recognition.onresult = (event) =>
      setPhrase(
        Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("")
      )
    recognition.onend = () => setIsListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  return (
    <main className="app-shell">
      <SiteHeader>
        <div className="nav-right">
          <button className="donate-button nav-desktop-action" type="button" aria-label="Donate to Multilingo">
            <Heart size={16} /> Donate
          </button>
          <HistoryMenu
            items={history}
            onSelect={openHistory}
            onDelete={deleteHistory}
          />
          <SavedMenu
            items={saved}
            onSelect={(item) =>
              openHistory({
                id: item.id,
                phrase: item.phrase,
                translations: [item.translation],
                createdAt: item.createdAt,
              })
            }
          />
          <button
            className="theme-toggle"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label={
              themeReady
                ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`
                : "Toggle color mode"
            }
            title="Toggle color mode"
          >
            {themeReady && resolvedTheme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
            <AuthControls />
          ) : (
            <button className="auth-button">Sign in</button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="nav-mobile-menu" aria-label="Open navigation menu">
              <Menu size={19} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="nav-menu mobile-nav-menu" align="end">
              <DropdownMenuItem className="mobile-nav-item" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                {themeReady && resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {themeReady && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
              <DropdownMenuItem className="mobile-nav-item" render={<Link href="/saved" />}>
                <Star size={16} /> Saved <span className="nav-count">{saved.length}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="mobile-nav-item" render={<Link href="/history" />}>
                <Clock3 size={16} /> History <span className="nav-count">{history.length}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="mobile-nav-item">
                <Heart size={16} /> Donate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SiteHeader>
      <section id="workspace" className="workspace">
        <section className="source-pane" aria-label="Original text">
          <div className="pane-heading">
            <span>Translate from</span>
            <LanguagePicker
              items={[autoLanguage, ...languages]}
              onSelect={(language) => {
                setSourceLanguage(language)
                void translate(selectedLanguages, language)
              }}
            >
              <button className="source-language" aria-label="Source language">
                {sourceLanguage.name} <ChevronDown size={15} />
              </button>
            </LanguagePicker>
          </div>
          <div
            className={`source-editor ${keyboardFocus ? "keyboard-focus" : ""}`}
          >
            <textarea
              ref={textareaRef}
              aria-label="Text to translate"
              className={
                phrase.length > 600
                  ? "text-small"
                  : phrase.length > 250
                    ? "text-medium"
                    : ""
              }
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              onKeyDown={(event) => {
                if (
                  (event.ctrlKey || event.metaKey) &&
                  typeof event.key === "string" &&
                  event.key.toLowerCase() === "enter"
                ) {
                  event.preventDefault()
                  event.stopPropagation()
                  void translate()
                }
              }}
              maxLength={5000}
              placeholder="Enter text"
            />
            <div className="source-footer">
              <button
                className={`icon-button ${isListening ? "is-active" : ""}`}
                onClick={toggleListening}
                title="Dictate text"
                aria-label="Dictate text"
              >
                <Mic size={18} />
              </button>
              <span>{phrase.length} / 5,000</span>
            </div>
          </div>
          <button
            className="translate-button"
            onClick={() => void translate()}
            disabled={isLoading || !phrase.trim()}
          >
            {isLoading && <LoaderCircle className="spin" size={18} />}
            {isLoading ? "Translating" : "Translate"}
          </button>
          <p className="keyboard-hint">Ctrl + Enter to translate</p>
        </section>
        <section
          ref={resultsRef}
          className="results-pane"
          aria-label="Translations"
        >
          <div className="results-header">
            <span className="to-label">Translate to</span>
            <LanguagePicker items={availableLanguages} onSelect={addLanguage}>
              <button
                className="add-language"
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
            className="results-list"
          >
            {selectedLanguages.map((language, index) => {
              const translation =
                translations.find((item) => item.locale === language.locale) ??
                fallback(submittedPhrase, language)
              const isStarred = saved.some(
                (item) =>
                  item.id === `${submittedPhrase}::${translation.locale}`
              )
              const choices = languages.filter(
                (language) =>
                  language.locale === translation.locale ||
                  !selectedLanguages.some(
                    (selected) => selected.locale === language.locale
                  )
              )
              return (
                <Reorder.Item
                  value={language}
                  className="translation-card"
                  key={translation.locale}
                  layout="position"
                  transition={{ layout: { type: "spring", stiffness: 320, damping: 30 } }}
                  whileDrag={{ scale: 1.01, zIndex: 1 }}
                >
                  <div className="card-heading">
                    <button
                      className="drag-handle"
                      aria-label={`Reorder ${translation.name} translation`}
                      title="Drag to reorder"
                    >
                      <GripVertical size={17} />
                    </button>
                    <LanguageFlag locale={translation.locale} />
                    <LanguagePicker
                      items={choices}
                      onSelect={(language) => changeLanguage(index, language)}
                    >
                      <button className="language-button">
                        {translation.name}
                        <ChevronDown size={15} />
                      </button>
                    </LanguagePicker>
                    <div className="card-actions">
                      <button
                        className="card-action"
                        onClick={() => void copy(translation)}
                        aria-label={
                          copied === translation.locale
                            ? "Copied"
                            : "Copy translation"
                        }
                        title={
                          copied === translation.locale
                            ? "Copied"
                            : "Copy translation"
                        }
                      >
                        {copied === translation.locale ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        className="card-action"
                        onClick={() =>
                          speak(translation.text, translation.locale)
                        }
                        aria-label="Listen to translation"
                        title="Listen to translation"
                      >
                        <Volume2 size={17} />
                      </button>
                      <button
                        className={`card-action ${isStarred ? "starred" : ""}`}
                        onClick={() => toggleSaved(translation)}
                        aria-label={
                          isStarred ? "Remove from saved" : "Save translation"
                        }
                        title={
                          isStarred ? "Remove from saved" : "Save translation"
                        }
                      >
                        <Star
                          size={16}
                          fill={isStarred ? "currentColor" : "none"}
                        />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="more-button"
                          aria-label={`More actions for ${translation.name}`}
                          title="More actions"
                        >
                          <MoreHorizontal size={20} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="action-menu"
                          align="end"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              const next = [...selectedLanguages]
                              next.splice(index - 1, 0, ...next.splice(index, 1))
                              reorderLanguages(next)
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp size={16} /> Move up
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const next = [...selectedLanguages]
                              next.splice(index + 1, 0, ...next.splice(index, 1))
                              reorderLanguages(next)
                            }}
                            disabled={index === selectedLanguages.length - 1}
                          >
                            <ArrowDown size={16} /> Move down
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => void share(translation)}
                          >
                            <Share2 size={16} /> Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            render={
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(translation.text)}`}
                                target="_blank"
                                rel="noreferrer"
                              />
                            }
                          >
                            <Search size={16} /> Search the web
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => removeLanguage(index)}
                            className="remove-action"
                          >
                            <Trash2 size={16} /> Remove language
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div
                    className={`translation-text ${translation.text.length > 600 ? "text-small" : translation.text.length > 250 ? "text-medium" : ""}`}
                    lang={translation.locale}
                    dir={translation.locale === "ar" ? "rtl" : "auto"}
                  >
                    {isLoading ? (
                      <span
                        className="loading-dots"
                        role="status"
                        aria-label="Translating"
                      >
                        <span aria-hidden="true">.</span>
                        <span aria-hidden="true">.</span>
                        <span aria-hidden="true">.</span>
                      </span>
                    ) : (
                      translation.text
                    )}
                  </div>
                </Reorder.Item>
              )
            })}
            {selectedLanguages.length === 0 && (
              <div className="no-results">
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

function LanguagePicker({
  items,
  onSelect,
  children,
}: {
  items: Language[]
  onSelect: (language: Language) => void
  children: React.ReactElement
}) {
  const [query, setQuery] = useState("")
  const filtered = items.filter((language) =>
    language.name.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setQuery("")
      }}
    >
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent className="language-menu" align="start">
        <div className="language-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Search languages"
            aria-label="Search languages"
            autoFocus
          />
        </div>
        <div className="language-list">
          {filtered.length ? (
            filtered.map((language) => (
              <DropdownMenuItem
                key={language.locale}
                onClick={() => onSelect(language)}
              >
                <LanguageFlag locale={language.locale} />
                <span>{language.name}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <p>No languages found</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
function HistoryMenu({
  items,
  onSelect,
  onDelete,
}: {
  items: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onDelete: (item: HistoryItem) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="nav-action nav-desktop-action">
        <Clock3 size={17} /> History{" "}
        <span className="nav-count">{items.length}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="nav-menu" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Recent translations</DropdownMenuLabel>
        </DropdownMenuGroup>
        {items.length ? (
          items.slice(0, 5).map((item, index) => (
            <div
              className="history-row"
              key={`${item.id ?? item.phrase}-${index}`}
            >
              <DropdownMenuItem
                className="history-item"
                onClick={() => onSelect(item)}
              >
                <span>
                  <b>{item.phrase}</b>
                  {item.translations
                    .map((translation) => translation.name)
                    .join(", ")}
                </span>
              </DropdownMenuItem>
              <button
                className="history-delete"
                onClick={() => onDelete(item)}
                aria-label={`Delete history: ${item.phrase}`}
                title="Delete from history"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <p className="empty-state">Your recent translations appear here.</p>
        )}
        {items.length > 0 && (
          <DropdownMenuItem
            className="view-all-item"
            render={<Link href="/history" />}
          >
            View all history <ChevronRight size={15} />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
function SavedMenu({
  items,
  onSelect,
}: {
  items: SavedItem[]
  onSelect: (item: SavedItem) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="nav-action nav-desktop-action">
        <Star size={17} /> Saved{" "}
        <span className="nav-count">{items.length}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="nav-menu" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Saved translations</DropdownMenuLabel>
        </DropdownMenuGroup>
        {items.length ? (
          items.slice(0, 5).map((item, index) => (
            <DropdownMenuItem
              key={`${item.id ?? item.phrase}-${index}`}
              className="history-item"
              onClick={() => onSelect(item)}
            >
              <span>
                <b>{item.translation.name}</b>
                {item.translation.text}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="empty-state">Star a translation to keep it close.</p>
        )}
        {items.length > 0 && (
          <DropdownMenuItem
            className="view-all-item"
            render={<Link href="/saved" />}
          >
            View all saved <ChevronRight size={15} />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

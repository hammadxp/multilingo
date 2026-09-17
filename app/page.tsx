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
  const region =
    languageRegions[locale] ?? new Intl.Locale(locale).maximize().region
  return /^[a-z]{2}$/i.test(region ?? "") ? region.toLowerCase() : "un"
}
function LanguageFlag({ locale }: { locale: string }) {
  if (locale === "auto") {
    return (
      <span
        className="grid h-[18px] w-6 flex-none place-items-center overflow-hidden rounded-[2px] leading-none text-muted-ink shadow-[0_0_0_1px_rgba(28,41,72,0.12)] shadow-none [&_img]:block [&_img]:size-full [&_img]:object-cover"
        aria-hidden="true"
      >
        <Globe2 size={16} />
      </span>
    )
  }

  return (
    <span
      className="grid h-[18px] w-6 flex-none place-items-center overflow-hidden rounded-[2px] leading-none shadow-[0_0_0_1px_rgba(28,41,72,0.12)] [&_img]:block [&_img]:size-full [&_img]:object-cover"
      aria-hidden="true"
    >
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
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader>
        <div className="flex items-center gap-[9px] max-[600px]:gap-0.5">
          <button
            className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[10px] px-[11px] text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden"
            type="button"
            aria-label="Donate to Multilingo"
          >
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
            className="inline-flex size-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-line text-[13px] font-[650] text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden"
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
            <button className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-line bg-paper px-[14px] text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:h-[34px] max-[600px]:px-2 max-[600px]:text-xs">
              Sign in
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hidden size-[38px] items-center justify-center rounded-[9px] border border-line bg-paper p-0 text-ink max-[768px]:inline-flex"
              aria-label="Open navigation menu"
            >
              <Menu size={19} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="!max-h-[470px] !w-[170px] !w-[min(370px,calc(100vw-24px))] overflow-hidden !rounded-[13px] !border !border-line !bg-[var(--popover)] !text-ink !shadow-[0_15px_34px_rgba(18,28,59,0.18)] [&_[data-slot=dropdown-menu-item]]:cursor-pointer [&_[data-slot=dropdown-menu-item]]:transition-colors [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary [&_[data-slot=dropdown-menu-label]]:font-[650]"
              align="end"
            >
              <DropdownMenuItem
                className="cursor-pointer !gap-[9px] [&>span]:ml-auto"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                {themeReady && resolvedTheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <Moon size={16} />
                )}
                {themeReady && resolvedTheme === "dark"
                  ? "Light mode"
                  : "Dark mode"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer !gap-[9px] [&>span]:ml-auto"
                render={<Link href="/saved" />}
              >
                <Star size={16} /> Saved{" "}
                <span className="grid h-[21px] min-w-[21px] place-items-center rounded-[7px] bg-hover px-[5px] text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
                  {saved.length}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer !gap-[9px] [&>span]:ml-auto"
                render={<Link href="/history" />}
              >
                <Clock3 size={16} /> History{" "}
                <span className="grid h-[21px] min-w-[21px] place-items-center rounded-[7px] bg-hover px-[5px] text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
                  {history.length}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer !gap-[9px] [&>span]:ml-auto">
                <Heart size={16} /> Donate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SiteHeader>
      <section
        id="workspace"
        className="mx-auto grid min-h-[calc(100vh-74px)] w-[min(1320px,calc(100%-48px))] grid-cols-2 items-stretch gap-3 py-6 pb-8 max-[900px]:flex max-[900px]:w-[min(680px,calc(100%-28px))] max-[900px]:flex-col max-[900px]:pt-[14px] max-[600px]:w-[calc(100%-20px)] max-[600px]:gap-[10px] max-[600px]:pt-[10px]"
      >
        <section className="min-w-0" aria-label="Original text">
          <div className="mb-3 flex min-h-[39px] items-center justify-between gap-3 text-[13px] font-bold text-muted-ink [&>span]:pl-[11px]">
            <span>Translate from</span>
            <LanguagePicker
              items={[autoLanguage, ...languages]}
              onSelect={(language) => {
                setSourceLanguage(language)
                void translate(selectedLanguages, language)
              }}
            >
              <button
                className="inline-flex items-center gap-1.5 rounded-[9px] border border-line bg-paper px-[11px] py-2 text-xs font-bold whitespace-nowrap text-ink hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
              ref={textareaRef}
              aria-label="Text to translate"
              className={`h-[240px] min-h-[240px] w-full flex-none resize-none overflow-hidden border-0 bg-transparent leading-normal font-medium tracking-[-0.035em] text-ink outline-none placeholder:text-muted-ink max-[900px]:h-[167px] max-[900px]:min-h-[167px] ${
                phrase.length > 600
                  ? "text-base"
                  : phrase.length > 250
                    ? "text-[19px]"
                    : "text-[clamp(16px,2vw,26px)] max-[600px]:text-[21px]"
              }`}
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
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-muted-ink">
              <button
                className={`grid size-9 place-items-center rounded-[9px] text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isListening ? "bg-hover" : ""}`}
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
            className="mt-[19px] inline-flex h-[47px] min-w-[152px] items-center justify-center gap-[9px] rounded-[11px] bg-primary px-6 text-sm font-[750] text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#172042]"
            onClick={() => void translate()}
            disabled={isLoading || !phrase.trim()}
          >
            {isLoading && (
              <LoaderCircle className="animate-quick-spin" size={18} />
            )}
            {isLoading ? "Translating" : "Translate"}
          </button>
          <p className="mt-[10px] text-[11px] font-medium text-muted-ink">
            Ctrl + Enter to translate
          </p>
        </section>
        <section
          ref={resultsRef}
          className="min-w-0 max-[900px]:scroll-mt-[14px]"
          aria-label="Translations"
        >
          <div className="mb-3 flex min-h-[39px] items-center justify-between gap-[14px] text-[13px] font-bold text-muted-ink max-[360px]:flex-wrap max-[360px]:gap-2 [&>span]:pl-[11px]">
            <span>Translate to</span>
            <LanguagePicker items={availableLanguages} onSelect={addLanguage}>
              <button
                className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[9px] border border-line bg-paper px-[13px] text-xs font-[750] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:px-[9px] max-[600px]:text-[11px] max-[360px]:ml-auto"
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
            className="grid content-start gap-[13px]"
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
                  className="flex min-h-[218px] flex-col rounded-[15px] border border-line bg-paper px-[19px] pt-[17px] pb-[13px] focus-within:border-[color-mix(in_srgb,var(--primary)_35%,var(--line))] hover:border-[color-mix(in_srgb,var(--primary)_35%,var(--line))] max-[600px]:px-[14px] max-[600px]:pt-[14px] max-[600px]:pb-[10px]"
                  key={translation.locale}
                  layout="position"
                  transition={{
                    layout: { type: "spring", stiffness: 320, damping: 30 },
                  }}
                  whileDrag={{ scale: 1.01, zIndex: 1 }}
                >
                  <div className="flex items-center gap-2 max-[600px]:gap-1">
                    <button
                      className="grid h-[30px] w-[25px] flex-none cursor-grab place-items-center rounded-[7px] p-0 text-muted-ink hover:bg-hover hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:cursor-grabbing"
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
                      <button className="mr-auto inline-flex items-center gap-1.5 rounded-[9px] border border-transparent bg-transparent px-[11px] py-2 text-[13px] font-bold whitespace-nowrap text-ink hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        {translation.name}
                        <ChevronDown size={15} />
                      </button>
                    </LanguagePicker>
                    <div className="ml-auto flex items-center gap-0.5">
                      <button
                        className="grid size-8 place-items-center rounded-lg p-0 text-muted-ink hover:bg-hover hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:size-[29px]"
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
                        className="grid size-8 place-items-center rounded-lg p-0 text-muted-ink hover:bg-hover hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:size-[29px]"
                        onClick={() =>
                          speak(translation.text, translation.locale)
                        }
                        aria-label="Listen to translation"
                        title="Listen to translation"
                      >
                        <Volume2 size={17} />
                      </button>
                      <button
                        className={`grid size-8 place-items-center rounded-lg p-0 text-muted-ink hover:bg-hover hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:size-[29px] ${isStarred ? "bg-hover text-primary" : ""}`}
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
                          className="grid size-[34px] place-items-center rounded-[9px] p-0 text-muted-ink hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:size-[29px]"
                          aria-label={`More actions for ${translation.name}`}
                          title="More actions"
                        >
                          <MoreHorizontal size={20} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="!min-w-[186px] !rounded-[13px] !border !border-line !bg-[var(--popover)] !text-ink !shadow-[0_15px_34px_rgba(18,28,59,0.18)] [&_[data-slot=dropdown-menu-item]]:cursor-pointer [&_[data-slot=dropdown-menu-item]]:rounded-lg [&_[data-slot=dropdown-menu-item]]:transition-colors [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary"
                          align="end"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              const next = [...selectedLanguages]
                              next.splice(
                                index - 1,
                                0,
                                ...next.splice(index, 1)
                              )
                              reorderLanguages(next)
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp size={16} /> Move up
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const next = [...selectedLanguages]
                              next.splice(
                                index + 1,
                                0,
                                ...next.splice(index, 1)
                              )
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
                            className="!text-[#bd4a53] dark:!text-[#ffabb3]"
                          >
                            <Trash2 size={16} /> Remove language
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div
                    className={`min-h-[116px] flex-none px-1 pt-[21px] pb-5 text-[clamp(16px,2vw,26px)] leading-normal font-[550] tracking-[-0.03em] wrap-anywhere text-ink ${translation.text.length > 600 ? "text-base" : translation.text.length > 250 ? "text-[19px]" : ""}`}
                    lang={translation.locale}
                    dir={translation.locale === "ar" ? "rtl" : "auto"}
                  >
                    {isLoading ? (
                      <span
                        className="inline-flex min-w-[2.2em] items-baseline text-[1.2em] font-extrabold tracking-[0.12em] text-primary [&_span]:animate-dot-pulse [&_span:nth-child(2)]:[animation-delay:0.18s] [&_span:nth-child(3)]:[animation-delay:0.36s]"
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
              <div className="grid min-h-[210px] place-content-center justify-items-center rounded-[15px] border border-dashed border-line text-muted-ink [&_button]:inline-flex [&_button]:items-center [&_button]:gap-1.5 [&_button]:rounded-lg [&_button]:bg-teal-soft [&_button]:px-3 [&_button]:py-2 [&_button]:font-bold [&_button]:text-primary">
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
      <DropdownMenuContent
        className="!h-[min(420px,var(--available-height))] !w-[290px] overflow-hidden !rounded-[13px] !border !border-line !bg-[var(--popover)] !p-0 !text-ink !shadow-[0_15px_34px_rgba(18,28,59,0.18)] max-[600px]:!w-[min(290px,calc(100vw-24px))] [&_[data-slot=dropdown-menu-item]]:cursor-pointer [&_[data-slot=dropdown-menu-item]]:transition-colors [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary"
        align="start"
      >
        <div className="m-[9px] flex items-center gap-[9px] rounded-[9px] border border-line px-[11px] text-muted-ink">
          <Search size={15} />
          <input
            className="h-[39px] w-full border-0 bg-transparent text-[13px] text-ink outline-none focus:outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Search languages"
            aria-label="Search languages"
            autoFocus
          />
        </div>
        <div className="max-h-[350px] [scrollbar-width:thin] [scrollbar-color:var(--line)_transparent] overflow-y-auto px-1.5 pb-[7px] [&_[data-slot=dropdown-menu-item]]:rounded-lg [&_[data-slot=dropdown-menu-item]]:p-[9px] [&_[data-slot=dropdown-menu-item]]:text-[13px] [&_[data-slot=dropdown-menu-item]]:font-medium [&_p]:m-[14px] [&_p]:text-xs [&_p]:text-muted-ink">
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
      <DropdownMenuTrigger className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[10px] px-[11px] text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden max-[600px]:gap-[3px] max-[600px]:px-[5px] max-[600px]:text-[0] max-[360px]:px-[3px]">
        <Clock3 size={17} /> History{" "}
        <span className="grid h-[21px] min-w-[21px] place-items-center rounded-[7px] bg-hover px-[5px] text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
          {items.length}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="!max-h-[470px] !w-[min(370px,calc(100vw-24px))] overflow-hidden !rounded-[13px] !border !border-line !bg-[var(--popover)] !text-ink !shadow-[0_15px_34px_rgba(18,28,59,0.18)] [&_[data-slot=dropdown-menu-item]]:cursor-pointer [&_[data-slot=dropdown-menu-item]]:transition-colors [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary [&_[data-slot=dropdown-menu-label]]:font-[650]"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Recent translations</DropdownMenuLabel>
        </DropdownMenuGroup>
        {items.length ? (
          items.slice(0, 5).map((item, index) => (
            <div
              className="flex items-center gap-0.5"
              key={`${item.id ?? item.phrase}-${index}`}
            >
              <DropdownMenuItem
                className="min-w-0 flex-1 cursor-pointer justify-between rounded-lg font-normal transition-colors hover:bg-hover hover:text-ink [&_b]:overflow-hidden [&_b]:text-[13px] [&_b]:font-[650] [&_b]:text-ellipsis [&_b]:text-ink [&_span]:grid [&_span]:min-w-0 [&_span]:gap-[3px] [&_span]:overflow-hidden [&_span]:text-xs [&_span]:text-ellipsis [&_span]:whitespace-nowrap [&_span]:text-muted-ink"
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
                className="grid size-[34px] flex-none place-items-center rounded-lg text-muted-ink hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => onDelete(item)}
                aria-label={`Delete history: ${item.phrase}`}
                title="Delete from history"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <p className="mx-3 mt-1.5 mb-[15px] text-xs text-muted-ink">
            Your recent translations appear here.
          </p>
        )}
        {items.length > 0 && (
          <DropdownMenuItem
            className="mt-4 mb-1 !justify-between !rounded-none border-t border-line !font-bold !text-primary transition-colors hover:!bg-hover hover:!text-primary-hover"
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
      <DropdownMenuTrigger className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[10px] px-[11px] text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden max-[600px]:gap-[3px] max-[600px]:px-[5px] max-[600px]:text-[0] max-[360px]:px-[3px]">
        <Star size={17} /> Saved{" "}
        <span className="grid h-[21px] min-w-[21px] place-items-center rounded-[7px] bg-hover px-[5px] text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
          {items.length}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="!max-h-[470px] !w-[min(370px,calc(100vw-24px))] overflow-hidden !rounded-[13px] !border !border-line !bg-[var(--popover)] !text-ink !shadow-[0_15px_34px_rgba(18,28,59,0.18)] [&_[data-slot=dropdown-menu-item]]:cursor-pointer [&_[data-slot=dropdown-menu-item]]:transition-colors [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary [&_[data-slot=dropdown-menu-label]]:font-[650]"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Saved translations</DropdownMenuLabel>
        </DropdownMenuGroup>
        {items.length ? (
          items.slice(0, 5).map((item, index) => (
            <DropdownMenuItem
              key={`${item.id ?? item.phrase}-${index}`}
              className="min-w-0 flex-1 cursor-pointer justify-between rounded-lg font-normal transition-colors hover:bg-hover hover:text-ink [&_b]:overflow-hidden [&_b]:text-[13px] [&_b]:font-[650] [&_b]:text-ellipsis [&_b]:text-ink [&_span]:grid [&_span]:min-w-0 [&_span]:gap-[3px] [&_span]:overflow-hidden [&_span]:text-xs [&_span]:text-ellipsis [&_span]:whitespace-nowrap [&_span]:text-muted-ink"
              onClick={() => onSelect(item)}
            >
              <span>
                <b>{item.translation.name}</b>
                {item.translation.text}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="mx-3 mt-1.5 mb-[15px] text-xs text-muted-ink">
            Star a translation to keep it close.
          </p>
        )}
        {items.length > 0 && (
          <DropdownMenuItem
            className="mt-4 mb-1 !justify-between !rounded-none border-t border-line !font-bold !text-primary transition-colors hover:!bg-hover hover:!text-primary-hover"
            render={<Link href="/saved" />}
          >
            View all saved <ChevronRight size={15} />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

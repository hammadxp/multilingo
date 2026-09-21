"use client"

import { Reorder } from "framer-motion"
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  GripVertical,
  MoreHorizontal,
  Search,
  Share2,
  Star,
  Trash2,
  Volume2,
} from "lucide-react"
import { LanguageFlag } from "@/components/language-flag"
import { LanguagePicker } from "@/components/language-picker"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { languages } from "@/lib/languages"
import type { Language, Translation } from "@/lib/translation-types"
import { getTranslationTextSize } from "@/lib/translation-text-size"

type TranslationCardProps = {
  language: Language
  translation: Translation
  index: number
  selectedLanguages: Language[]
  isStarred: boolean
  copied: string | null
  isLoading: boolean
  changeLanguage: (index: number, language: Language) => void
  reorderLanguages: (languages: Language[]) => void
  removeLanguage: (index: number) => void
  toggleSaved: (translation: Translation) => void
  copy: (translation: Translation) => void
  share: (translation: Translation) => void
  speak: (text: string, locale: string) => void
}

export function TranslationCard({
  language,
  translation,
  index,
  selectedLanguages,
  isStarred,
  copied,
  isLoading,
  changeLanguage,
  reorderLanguages,
  removeLanguage,
  toggleSaved,
  copy,
  share,
  speak,
}: TranslationCardProps) {
  const selectedLocales = new Set(selectedLanguages.map((item) => item.locale))
  const choices = languages.filter(
    (item) =>
      item.locale === language.locale || !selectedLocales.has(item.locale)
  )
  return (
    <Reorder.Item
      value={language}
      className="flex min-h-54.5 flex-col rounded-[15px] border border-line bg-paper px-4.75 pt-4.25 pb-3.25 focus-within:border-[color-mix(in_srgb,var(--primary)_35%,var(--line))] hover:border-[color-mix(in_srgb,var(--primary)_35%,var(--line))] max-[600px]:px-3.5 max-[600px]:pt-3.5 max-[600px]:pb-2.5"
      layout="position"
      transition={{
        layout: { type: "spring", stiffness: 320, damping: 30 },
      }}
      whileDrag={{ scale: 1.01, zIndex: 1 }}
    >
      <div className="flex items-center gap-2 max-[600px]:gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          className="h-7.5 w-6.25 flex-none cursor-grab rounded-[7px] p-0 text-muted-ink hover:bg-hover hover:text-primary active:cursor-grabbing"
          aria-label={`Reorder ${translation.name} translation`}
          title="Drag to reorder"
        >
          <GripVertical />
        </Button>
        <LanguageFlag locale={translation.locale} />
        <LanguagePicker
          items={choices}
          onSelect={(language) => changeLanguage(index, language)}
        >
          <Button
            variant="ghost"
            size="sm"
            className="mr-auto h-auto rounded-[9px] border-transparent bg-transparent px-2.75 py-2 text-[13px] font-bold whitespace-nowrap text-ink hover:bg-hover hover:text-ink"
          >
            {translation.name}
            <ChevronDown data-icon="inline-end" />
          </Button>
        </LanguagePicker>
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-lg p-0 text-muted-ink hover:bg-hover hover:text-primary max-[600px]:size-7.25"
            onClick={() => void copy(translation)}
            aria-label={
              copied === translation.locale ? "Copied" : "Copy translation"
            }
            title={
              copied === translation.locale ? "Copied" : "Copy translation"
            }
          >
            {copied === translation.locale ? <Check /> : <Copy />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-lg p-0 text-muted-ink hover:bg-hover hover:text-primary max-[600px]:size-7.25"
            onClick={() => speak(translation.text, translation.locale)}
            aria-label="Listen to translation"
            title="Listen to translation"
          >
            <Volume2 />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className={`size-8 rounded-lg p-0 text-muted-ink hover:bg-hover hover:text-primary max-[600px]:size-7.25 ${isStarred ? "bg-hover text-primary" : ""}`}
            onClick={() => toggleSaved(translation)}
            aria-label={isStarred ? "Remove from saved" : "Save translation"}
            title={isStarred ? "Remove from saved" : "Save translation"}
          >
            <Star fill={isStarred ? "currentColor" : "none"} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="grid size-8.5 place-items-center rounded-[9px] p-0 text-muted-ink hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:size-7.25"
              aria-label={`More actions for ${translation.name}`}
              title="More actions"
            >
              <MoreHorizontal size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-46.5 rounded-[13px] border border-line bg-popover text-ink shadow-[0_15px_34px_rgba(18,28,59,0.18)] **:data-[slot=dropdown-menu-item]:cursor-pointer **:data-[slot=dropdown-menu-item]:rounded-lg **:data-[slot=dropdown-menu-item]:transition-colors [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary"
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
              <DropdownMenuItem onClick={() => void share(translation)}>
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
                className="text-[#bd4a53] dark:text-[#ffabb3]"
              >
                <Trash2 size={16} /> Remove language
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div
        className={`min-h-29 flex-none px-1 pt-5.25 pb-5 leading-normal font-[550] tracking-[-0.03em] wrap-anywhere text-ink ${getTranslationTextSize(translation.text.length)}`}
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
}

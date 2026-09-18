"use client"

import { useState, type ReactElement } from "react"
import { Search } from "lucide-react"
import { LanguageFlag } from "@/components/language-flag"
import type { Language } from "@/lib/translation-types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type LanguagePickerProps = {
  items: Language[]
  onSelect: (language: Language) => void
  children: ReactElement
}

export function LanguagePicker({
  items,
  onSelect,
  children,
}: LanguagePickerProps) {
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
        className="h-[min(420px,var(--available-height))] w-[290px] overflow-hidden rounded-[13px] border border-line bg-[var(--popover)] p-0 text-ink shadow-[0_15px_34px_rgba(18,28,59,0.18)] max-[600px]:w-[min(290px,calc(100vw-24px))] [&_[data-slot=dropdown-menu-item]]:cursor-pointer [&_[data-slot=dropdown-menu-item]]:transition-colors [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary"
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

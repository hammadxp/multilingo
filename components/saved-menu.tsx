"use client"

import Link from "next/link"
import { ChevronRight, Star } from "lucide-react"
import type { SavedItem } from "@/lib/translation-types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SavedMenuProps = {
  items: SavedItem[]
  onSelect: (item: SavedItem) => void
}

export function SavedMenu({ items, onSelect }: SavedMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9.5 items-center justify-center gap-1.75 rounded-[10px] px-2.75 text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden max-[600px]:gap-0.75 max-[600px]:px-1.25 max-[600px]:text-[0] max-[360px]:px-0.75">
        <Star size={17} /> Saved{" "}
        <span className="grid h-5.25 min-w-5.25 place-items-center rounded-[7px] bg-hover px-1.25 text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
          {items.length}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-h-117.5 w-[min(370px,calc(100vw-24px))] overflow-hidden rounded-[13px] border border-line bg-popover text-ink shadow-[0_15px_34px_rgba(18,28,59,0.18)] **:data-[slot=dropdown-menu-item]:cursor-pointer **:data-[slot=dropdown-menu-item]:transition-colors [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary **:data-[slot=dropdown-menu-label]:font-[650]"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Saved translations</DropdownMenuLabel>
        </DropdownMenuGroup>
        {items.length ? (
          items.slice(0, 5).map((item, index) => (
            <DropdownMenuItem
              key={`${item.id ?? item.phrase}-${index}`}
              className="min-w-0 flex-1 cursor-pointer justify-between rounded-lg font-normal transition-colors hover:bg-hover hover:text-ink [&_b]:overflow-hidden [&_b]:text-[13px] [&_b]:font-[650] [&_b]:text-ellipsis [&_b]:text-ink [&_span]:grid [&_span]:min-w-0 [&_span]:gap-0.75 [&_span]:overflow-hidden [&_span]:text-xs [&_span]:text-ellipsis [&_span]:whitespace-nowrap [&_span]:text-muted-ink"
              onClick={() => onSelect(item)}
            >
              <span>
                <b>{item.translation.name}</b>
                {item.translation.text}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="mx-3 mt-1.5 mb-3.75 text-xs text-muted-ink">
            Star a translation to keep it close.
          </p>
        )}
        {items.length > 0 && (
          <DropdownMenuItem
            className="mt-4 mb-1 justify-between rounded-none border-t border-line font-bold text-primary transition-colors hover:bg-hover hover:text-primary-hover"
            render={<Link href="/saved" />}
          >
            View all saved <ChevronRight size={15} />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

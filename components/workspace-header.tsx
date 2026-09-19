"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Clock3, Heart, Menu, Moon, Star, Sun } from "lucide-react"
import { AuthControls } from "@/components/auth-controls"
import { HistoryMenu } from "@/components/history-menu"
import { SavedMenu } from "@/components/saved-menu"
import { SiteHeader } from "@/components/site-nav"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { HistoryItem, SavedItem } from "@/lib/translation-types"

type WorkspaceHeaderProps = {
  history: HistoryItem[]
  saved: SavedItem[]
  openHistory: (item: HistoryItem) => void
  deleteHistory: (item: HistoryItem) => void
}

export function WorkspaceHeader({
  history,
  saved,
  openHistory,
  deleteHistory,
}: WorkspaceHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [themeReady, setThemeReady] = useState(false)
  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (active) setThemeReady(true)
    })
    return () => {
      active = false
    }
  }, [])
  return (
    <SiteHeader>
      <div className="flex items-center gap-2.25 max-[600px]:gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-9.5 rounded-[10px] px-2.75 text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover max-[768px]:hidden [&_svg]:size-4"
          type="button"
          aria-label="Donate to Multilingo"
        >
          <Heart data-icon="inline-start" /> Donate
        </Button>
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
        <Button
          variant="outline"
          size="icon"
        className="size-9.5 rounded-[10px] border-line bg-paper text-[13px] font-[650] text-ink hover:bg-hover hover:text-ink max-[768px]:hidden"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label={
            themeReady
              ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`
              : "Toggle color mode"
          }
          title="Toggle color mode"
        >
          {themeReady && resolvedTheme === "dark" ? (
            <Sun />
          ) : (
            <Moon />
          )}
        </Button>
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
          <AuthControls />
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-9.5 rounded-[10px] border-line bg-paper px-3.5 text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover hover:text-ink max-[600px]:h-8.5 max-[600px]:px-2 max-[600px]:text-xs"
          >
            Sign in
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="hidden size-9.5 items-center justify-center rounded-[10px] border border-line bg-paper p-0 text-ink max-[768px]:inline-flex"
            aria-label="Open navigation menu"
          >
            <Menu size={19} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="max-h-117.5 w-[min(370px,calc(100vw-24px))] overflow-hidden rounded-[13px] border border-line bg-popover text-ink shadow-[0_15px_34px_rgba(18,28,59,0.18)] **:data-[slot=dropdown-menu-item]:cursor-pointer **:data-[slot=dropdown-menu-item]:transition-colors [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary **:data-[slot=dropdown-menu-label]:font-[650]"
            align="end"
          >
            <DropdownMenuItem
              className="cursor-pointer gap-2.25 [&>span]:ml-auto"
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
              className="cursor-pointer gap-2.25 [&>span]:ml-auto"
              render={<Link href="/saved" />}
            >
              <Star size={16} /> Saved{" "}
              <span className="grid h-5.25 min-w-5.25 place-items-center rounded-[7px] bg-hover px-1.25 text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
                {saved.length}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2.25 [&>span]:ml-auto"
              render={<Link href="/history" />}
            >
              <Clock3 size={16} /> History{" "}
              <span className="grid h-5.25 min-w-5.25 place-items-center rounded-[7px] bg-hover px-1.25 text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
                {history.length}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2.25 [&>span]:ml-auto">
              <Heart size={16} /> Donate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SiteHeader>
  )
}

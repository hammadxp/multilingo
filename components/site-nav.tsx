"use client"

import Link from "next/link"
import { Clock3, Heart, Menu, Moon, Star, Sun } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { AuthControls } from "@/components/auth-controls"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

function readCount(key: string) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]")
    return Array.isArray(value) ? value.length : 0
  } catch {
    return 0
  }
}

function DefaultNavActions() {
  const { resolvedTheme, setTheme } = useTheme()
  const [themeReady, setThemeReady] = useState(false)
  const [counts, setCounts] = useState({ history: 0, saved: 0 })

  useEffect(() => {
    const refreshCounts = () =>
      setCounts({
        history: readCount("multilingo-history"),
        saved: readCount("multilingo-saved"),
      })

    queueMicrotask(() => {
      setThemeReady(true)
      refreshCounts()
    })
    window.addEventListener("storage", refreshCounts)
    return () => window.removeEventListener("storage", refreshCounts)
  }, [])

  return (
    <div className="flex items-center gap-2.25 max-[600px]:gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        className="h-9.5 gap-1.75 rounded-[10px] px-2.75 text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover max-[768px]:hidden [&_svg]:size-4.25"
        type="button"
        aria-label="Donate to Multilingo"
      >
        <Heart /> Donate
      </Button>
      <Link
        href="/history"
        className="inline-flex h-9.5 items-center justify-center gap-1.75 rounded-[10px] px-2.75 text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden max-[600px]:gap-0.75 max-[600px]:px-1.25 max-[600px]:text-[0] max-[360px]:px-0.75"
      >
        <Clock3 size={17} /> History{" "}
        <span className="grid h-5.25 min-w-5.25 place-items-center rounded-[7px] bg-hover px-1.25 text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
          {counts.history}
        </span>
      </Link>
      <Link
        href="/saved"
        className="inline-flex h-9.5 items-center justify-center gap-1.75 rounded-[10px] px-2.75 text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden max-[600px]:gap-0.75 max-[600px]:px-1.25 max-[600px]:text-[0] max-[360px]:px-0.75"
      >
        <Star size={17} /> Saved{" "}
        <span className="grid h-5.25 min-w-5.25 place-items-center rounded-[7px] bg-hover px-1.25 text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
          {counts.saved}
        </span>
      </Link>
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
        {themeReady && resolvedTheme === "dark" ? <Sun /> : <Moon />}
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
          className="max-h-117.5 w-[min(370px,calc(100vw-24px))] overflow-hidden rounded-[13px] border border-line bg-popover text-ink shadow-[0_15px_34px_rgba(18,28,59,0.18)] **:data-[slot=dropdown-menu-item]:cursor-pointer **:data-[slot=dropdown-menu-item]:transition-colors **:data-[slot=dropdown-menu-label]:font-[650] [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:bg-hover [&_[data-slot=dropdown-menu-item]:not([data-disabled]):hover]:text-primary"
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
              {counts.saved}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2.25 [&>span]:ml-auto"
            render={<Link href="/history" />}
          >
            <Clock3 size={16} /> History{" "}
            <span className="grid h-5.25 min-w-5.25 place-items-center rounded-[7px] bg-hover px-1.25 text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
              {counts.history}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2.25 [&>span]:ml-auto">
            <Heart size={16} /> Donate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function SiteBrand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink no-underline max-[600px]:gap-1.75 max-[600px]:text-lg max-[360px]:text-base"
    >
      <div className="h-10 w-10">
        <Image
          src="/multilingo.png"
          alt="Logo of Multilingo app"
          width={200}
          height={200}
        />
      </div>
      <span>
        multi<span className="text-primary">lingo</span>
      </span>
    </Link>
  )
}

function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <nav className="relative z-30 flex h-18.5 items-center justify-between gap-5 border-b border-line bg-canvas px-[max(28px,calc((100vw-1320px)/2))] max-[600px]:h-16.5 max-[600px]:gap-1.25 max-[600px]:px-3.25">
      <SiteBrand />
      {children ?? <DefaultNavActions />}
    </nav>
  )
}

export { SiteBrand, SiteHeader }

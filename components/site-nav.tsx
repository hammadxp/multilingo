"use client"

import Link from "next/link"
import { Clock3, Heart, Languages, Menu, Moon, Star, Sun } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { AuthControls } from "@/components/auth-controls"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    <div className="flex items-center gap-[9px] max-[600px]:gap-0.5">
      <button
        className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[10px] px-[11px] text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden"
        type="button"
        aria-label="Donate to Multilingo"
      >
        <Heart size={16} /> Donate
      </button>
      <Link
        href="/history"
        className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[10px] px-[11px] text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden max-[600px]:gap-[3px] max-[600px]:px-[5px] max-[600px]:text-[0] max-[360px]:px-[3px]"
      >
        <Clock3 size={17} /> History{" "}
        <span className="grid h-[21px] min-w-[21px] place-items-center rounded-[7px] bg-hover px-[5px] text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
          {counts.history}
        </span>
      </Link>
      <Link
        href="/saved"
        className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[10px] px-[11px] text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden max-[600px]:gap-[3px] max-[600px]:px-[5px] max-[600px]:text-[0] max-[360px]:px-[3px]"
      >
        <Star size={17} /> Saved{" "}
        <span className="grid h-[21px] min-w-[21px] place-items-center rounded-[7px] bg-hover px-[5px] text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
          {counts.saved}
        </span>
      </Link>
      <button
        className="inline-flex size-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-line text-[13px] font-[650] text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[768px]:hidden"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
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
              {counts.saved}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer !gap-[9px] [&>span]:ml-auto"
            render={<Link href="/history" />}
          >
            <Clock3 size={16} /> History{" "}
            <span className="grid h-[21px] min-w-[21px] place-items-center rounded-[7px] bg-hover px-[5px] text-[11px] font-[750] text-primary max-[600px]:text-[10px] max-[360px]:hidden">
              {counts.history}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer !gap-[9px] [&>span]:ml-auto">
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
      className="inline-flex items-center gap-[11px] text-[22px] font-extrabold tracking-[-0.065em] whitespace-nowrap text-ink no-underline max-[600px]:gap-[7px] max-[600px]:text-lg max-[360px]:text-base"
    >
      <span className="relative grid size-[38px] place-items-center rounded-[11px] bg-primary text-white after:absolute after:-top-[3px] after:-right-[3px] after:size-[10px] after:rounded-full after:border-2 after:border-paper after:bg-peach max-[600px]:size-8 max-[600px]:rounded-[9px] dark:text-[#192048] max-[600px]:[&_svg]:w-[18px]">
        <Languages size={20} strokeWidth={2.3} />
      </span>
      <span>
        multi<span className="text-primary">lingo</span>
      </span>
    </Link>
  )
}

function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <nav className="relative z-30 flex h-[74px] items-center justify-between gap-5 border-b border-line bg-canvas px-[max(28px,calc((100vw-1320px)/2))] max-[600px]:h-[66px] max-[600px]:gap-[5px] max-[600px]:px-[13px]">
      <SiteBrand />
      {children ?? <DefaultNavActions />}
    </nav>
  )
}

export { SiteBrand, SiteHeader }

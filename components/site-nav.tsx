"use client"

import Link from "next/link"
import { Clock3, Heart, Languages, Menu, Moon, Star, Sun } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { AuthControls } from "@/components/auth-controls"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
    <div className="nav-right">
      <button className="donate-button nav-desktop-action" type="button" aria-label="Donate to Multilingo">
        <Heart size={16} /> Donate
      </button>
      <Link href="/history" className="nav-action nav-desktop-action">
        <Clock3 size={17} /> History <span className="nav-count">{counts.history}</span>
      </Link>
      <Link href="/saved" className="nav-action nav-desktop-action">
        <Star size={17} /> Saved <span className="nav-count">{counts.saved}</span>
      </Link>
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
            <Star size={16} /> Saved <span className="nav-count">{counts.saved}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="mobile-nav-item" render={<Link href="/history" />}>
            <Clock3 size={16} /> History <span className="nav-count">{counts.history}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="mobile-nav-item">
            <Heart size={16} /> Donate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function SiteBrand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">
        <Languages size={20} strokeWidth={2.3} />
      </span>
      <span>
        multi<span className="brand-accent">lingo</span>
      </span>
    </Link>
  )
}

function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <nav className="topbar">
      <SiteBrand />
      {children ?? <DefaultNavActions />}
    </nav>
  )
}

export { SiteBrand, SiteHeader }

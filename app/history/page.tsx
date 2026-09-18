"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SiteHeader } from "@/components/site-nav"
import type { HistoryItem } from "@/lib/translation-types"

const PAGE_SIZE = 12
const cleanupAbortReason = "component cleanup"

function readLocalHistory() {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("multilingo-history") ?? "[]"
    )
    return Array.isArray(value) ? (value as HistoryItem[]) : []
  } catch {
    return []
  }
}

export default function HistoryPage() {
  const [localItems, setLocalItems] = useState<HistoryItem[]>([])
  const [items, setItems] = useState<HistoryItem[]>([])
  const [remoteMode, setRemoteMode] = useState<boolean | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const loadingRef = useRef(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const local = readLocalHistory()
    queueMicrotask(() => {
      if (!active) return
      setLocalItems(local)
      setItems(local.slice(0, PAGE_SIZE))
      setHasMore(local.length > PAGE_SIZE)
    })

    void fetch(`/api/history?limit=${PAGE_SIZE}&offset=0`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("History request failed")
        return response.json()
      })
      .then((data) => {
        if (!active) return
        if (!data.signedIn) {
          setRemoteMode(false)
          return
        }
        setRemoteMode(true)
        setItems(Array.isArray(data.history) ? data.history : [])
        setHasMore(Boolean(data.hasMore))
      })
      .catch(() => {
        if (active) setRemoteMode(false)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
      controller.abort(cleanupAbortReason)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return
    loadingRef.current = true
    try {
      if (remoteMode) {
        const response = await fetch(
          `/api/history?limit=${PAGE_SIZE}&offset=${items.length}`
        )
        if (!response.ok) throw new Error("History request failed")
        const data = await response.json()
        setItems((current) => [
          ...current,
          ...(Array.isArray(data.history) ? data.history : []),
        ])
        setHasMore(Boolean(data.hasMore))
      } else {
        const next = localItems.slice(0, items.length + PAGE_SIZE)
        setItems(next)
        setHasMore(next.length < localItems.length)
      }
    } catch {
      // Keep the current page visible when loading another page fails.
    } finally {
      loadingRef.current = false
    }
  }, [hasMore, items.length, localItems, remoteMode])

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasMore || isLoading) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { rootMargin: "240px" }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="mx-auto w-[min(900px,calc(100%-48px))] py-14.5 pb-20 max-[600px]:w-[calc(100%-28px)] max-[600px]:pt-9">
        <div className="mb-7 flex items-end justify-between gap-4.5 [&_h1]:text-[clamp(32px,5vw,48px)] [&_h1]:tracking-[-0.06em] [&_h1]:text-ink">
          <div>
            <p className="mb-1.75 text-xs font-extrabold tracking-[0.08em] text-primary uppercase">
              Your translations
            </p>
            <h1>History</h1>
          </div>
          <span className="text-xs font-bold text-muted-ink">
            {items.length} shown
          </span>
        </div>
        {isLoading ? (
          <div className="grid min-h-55 place-items-center rounded-2xl border border-dashed border-line text-sm text-muted-ink">
            Loading history…
          </div>
        ) : items.length ? (
          <div className="grid gap-3">
            {items.map((item) => (
              <article
                className="rounded-2xl border border-line bg-paper px-6 pt-5.5 pb-6 max-[600px]:p-4.5 [&_h2]:mt-4.25 [&_h2]:mb-3.75 [&_h2]:text-[clamp(20px,3vw,27px)] [&_h2]:leading-[1.35] [&_h2]:font-semibold [&_h2]:tracking-[-0.04em] [&_h2]:text-ink"
                key={item.id}
              >
                <div className="flex justify-between gap-3.5 text-[11px] font-bold text-muted-ink max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-1.25">
                  <time dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                  <span>
                    {item.translations.map((item) => item.name).join(", ")}
                  </span>
                </div>
                <h2>{item.phrase}</h2>
                <div className="grid gap-2 border-t border-line pt-3.75 [&_b]:text-[11px] [&_b]:font-extrabold [&_b]:tracking-[0.04em] [&_b]:text-primary [&_b]:uppercase [&_p]:grid [&_p]:gap-1.25 [&_p]:text-[15px] [&_p]:leading-[1.6] [&_p]:text-ink">
                  {item.translations.map((translation) => (
                    <p key={translation.locale ?? translation.name}>
                      <b>{translation.name}</b>
                      {translation.text}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-55 place-items-center rounded-2xl border border-dashed border-line text-sm text-muted-ink">
            Your recent translations appear here.
          </div>
        )}
        <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
        {hasMore && (
          <p className="mt-4.5 text-center text-xs text-muted-ink">
            Loading more…
          </p>
        )}
      </section>
    </main>
  )
}

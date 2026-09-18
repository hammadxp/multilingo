"use client"

import { useEffect, useRef, useState } from "react"
import { SiteHeader } from "@/components/site-nav"
import type { SavedItem } from "@/lib/translation-types"

const PAGE_SIZE = 12

function readSaved() {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("multilingo-saved") ?? "[]"
    )
    return Array.isArray(value) ? (value as SavedItem[]) : []
  } catch {
    return []
  }
}

export default function SavedPage() {
  const [allItems, setAllItems] = useState<SavedItem[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const items = allItems.slice(0, visibleCount)
  const hasMore = visibleCount < allItems.length

  useEffect(() => {
    let active = true
    const saved = readSaved()
    queueMicrotask(() => {
      if (active) setAllItems(saved)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting)
          setVisibleCount((count) =>
            Math.min(count + PAGE_SIZE, allItems.length)
          )
      },
      { rootMargin: "240px" }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [allItems.length, hasMore])

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="mx-auto w-[min(900px,calc(100%-48px))] py-14.5 pb-20 max-[600px]:w-[calc(100%-28px)] max-[600px]:pt-9">
        <div className="mb-7 flex items-end justify-between gap-4.5 [&_h1]:text-[clamp(32px,5vw,48px)] [&_h1]:tracking-[-0.06em] [&_h1]:text-ink">
          <div>
            <p className="mb-1.75 text-xs font-extrabold tracking-[0.08em] text-primary uppercase">
              Keep the useful bits
            </p>
            <h1>Saved</h1>
          </div>
          <span className="text-xs font-bold text-muted-ink">
            {items.length} shown
          </span>
        </div>
        {items.length ? (
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
                  <span>{item.translation.name}</span>
                </div>
                <h2>{item.phrase}</h2>
                <div className="grid gap-2 border-t border-line pt-3.75 [&_b]:text-[11px] [&_b]:font-extrabold [&_b]:tracking-[0.04em] [&_b]:text-primary [&_b]:uppercase [&_p]:grid [&_p]:gap-1.25 [&_p]:text-[15px] [&_p]:leading-[1.6] [&_p]:text-ink">
                  <p>
                    <b>{item.translation.name}</b>
                    {item.translation.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-55 place-items-center rounded-2xl border border-dashed border-line text-sm text-muted-ink">
            Star a translation to keep it close.
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

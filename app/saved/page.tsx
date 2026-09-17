"use client"

import { useEffect, useRef, useState } from "react"
import { SiteHeader } from "@/components/site-nav"

type Translation = { name: string; text: string }
type SavedItem = {
  id: string
  phrase: string
  translation: Translation
  createdAt: string
}

const PAGE_SIZE = 12

function readSaved() {
  try {
    return JSON.parse(
      localStorage.getItem("multilingo-saved") ?? "[]"
    ) as SavedItem[]
  } catch {
    return []
  }
}

export default function SavedPage() {
  const [allItems, setAllItems] = useState<SavedItem[]>([])
  const [items, setItems] = useState<SavedItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = readSaved()
    queueMicrotask(() => {
      setAllItems(saved)
      setItems(saved.slice(0, PAGE_SIZE))
      setHasMore(saved.length > PAGE_SIZE)
    })
  }, [])

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || !hasMore) return
        setItems((current) => {
          const next = allItems.slice(0, current.length + PAGE_SIZE)
          setHasMore(next.length < allItems.length)
          return next
        })
      },
      { rootMargin: "240px" }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [allItems, hasMore])

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <section className="mx-auto w-[min(900px,calc(100%-48px))] py-[58px] pb-20 max-[600px]:w-[calc(100%-28px)] max-[600px]:pt-9">
        <div className="mb-7 flex items-end justify-between gap-[18px] [&_h1]:text-[clamp(32px,5vw,48px)] [&_h1]:tracking-[-0.06em] [&_h1]:text-ink">
          <div>
            <p className="mb-[7px] text-xs font-extrabold tracking-[0.08em] text-primary uppercase">
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
            {items.map((item, itemIndex) => (
              <article
                className="rounded-2xl border border-line bg-paper px-6 pt-[22px] pb-6 max-[600px]:p-[18px] [&_h2]:mt-[17px] [&_h2]:mb-[15px] [&_h2]:text-[clamp(20px,3vw,27px)] [&_h2]:leading-[1.35] [&_h2]:font-semibold [&_h2]:tracking-[-0.04em] [&_h2]:text-ink"
                key={`saved-${item.id ?? item.createdAt ?? item.phrase ?? "item"}-${itemIndex}`}
              >
                <div className="flex justify-between gap-[14px] text-[11px] font-bold text-muted-ink max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-[5px]">
                  <time dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                  <span>{item.translation.name}</span>
                </div>
                <h2>{item.phrase}</h2>
                <div className="grid gap-2 border-t border-line pt-[15px] [&_b]:text-[11px] [&_b]:font-extrabold [&_b]:tracking-[0.04em] [&_b]:text-primary [&_b]:uppercase [&_p]:grid [&_p]:gap-[5px] [&_p]:text-[15px] [&_p]:leading-[1.6] [&_p]:text-ink">
                  <p>
                    <b>{item.translation.name}</b>
                    {item.translation.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-[220px] place-items-center rounded-2xl border border-dashed border-line text-sm text-muted-ink">
            Star a translation to keep it close.
          </div>
        )}
        <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
        {hasMore && (
          <p className="mt-[18px] text-center text-xs text-muted-ink">
            Loading more…
          </p>
        )}
      </section>
    </main>
  )
}

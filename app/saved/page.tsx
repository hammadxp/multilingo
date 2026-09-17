"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Star } from "lucide-react"
import Link from "next/link"

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
    <main className="app-shell library-page">
      <nav className="topbar">
        <Link href="/#workspace" className="brand">
          <span className="brand-mark">
            <Star size={20} strokeWidth={2.3} />
          </span>
          <span>
            multi<span className="brand-accent">lingo</span>
          </span>
        </Link>
        <Link href="/#workspace" className="library-back-link">
          <ArrowLeft size={16} /> Back to translator
        </Link>
      </nav>
      <section className="library-main">
        <div className="library-heading">
          <div>
            <p className="library-kicker">Keep the useful bits</p>
            <h1>Saved</h1>
          </div>
          <span className="library-count">{items.length} shown</span>
        </div>
        {items.length ? (
          <div className="library-list">
            {items.map((item) => (
              <article className="library-item" key={item.id}>
                <div className="library-item-meta">
                  <time dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                  <span>{item.translation.name}</span>
                </div>
                <h2>{item.phrase}</h2>
                <div className="library-translations">
                  <p>
                    <b>{item.translation.name}</b>
                    {item.translation.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="library-empty">Star a translation to keep it close.</div>
        )}
        <div ref={loadMoreRef} className="library-sentinel" aria-hidden="true" />
        {hasMore && <p className="library-loading">Loading more…</p>}
      </section>
    </main>
  )
}

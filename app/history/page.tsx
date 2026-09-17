"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, Clock3 } from "lucide-react"
import Link from "next/link"

type Translation = { name: string; text: string }
type HistoryItem = {
  id: string
  phrase: string
  translations: Translation[]
  createdAt: string
}

const PAGE_SIZE = 12

function readLocalHistory() {
  try {
    return JSON.parse(
      localStorage.getItem("multilingo-history") ?? "[]"
    ) as HistoryItem[]
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
    const local = readLocalHistory()
    queueMicrotask(() => {
      setLocalItems(local)
      setItems(local.slice(0, PAGE_SIZE))
      setHasMore(local.length > PAGE_SIZE)
    })

    void fetch(`/api/history?limit=${PAGE_SIZE}&offset=0`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.signedIn) {
          setRemoteMode(false)
          return
        }
        setRemoteMode(true)
        setItems(data.history ?? [])
        setHasMore(Boolean(data.hasMore))
      })
      .catch(() => setRemoteMode(false))
      .finally(() => setIsLoading(false))
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return
    loadingRef.current = true
    if (remoteMode) {
      const response = await fetch(
        `/api/history?limit=${PAGE_SIZE}&offset=${items.length}`
      ).catch(() => null)
      const data = response?.ok ? await response.json() : null
      if (data) {
        setItems((current) => [...current, ...(data.history ?? [])])
        setHasMore(Boolean(data.hasMore))
      }
    } else {
      const next = localItems.slice(0, items.length + PAGE_SIZE)
      setItems(next)
      setHasMore(next.length < localItems.length)
    }
    loadingRef.current = false
  }, [hasMore, items.length, localItems, remoteMode])

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { rootMargin: "240px" }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <main className="app-shell library-page">
      <nav className="topbar">
        <Link href="/#workspace" className="brand">
          <span className="brand-mark">
            <Clock3 size={20} strokeWidth={2.3} />
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
            <p className="library-kicker">Your translations</p>
            <h1>History</h1>
          </div>
          <span className="library-count">{items.length} shown</span>
        </div>
        {isLoading ? (
          <div className="library-empty">Loading history…</div>
        ) : items.length ? (
          <div className="library-list">
            {items.map((item) => (
              <article className="library-item" key={item.id}>
                <div className="library-item-meta">
                  <time dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                  <span>{item.translations.map((item) => item.name).join(", ")}</span>
                </div>
                <h2>{item.phrase}</h2>
                <div className="library-translations">
                  {item.translations.map((translation) => (
                    <p key={`${item.id}-${translation.name}`}>
                      <b>{translation.name}</b>
                      {translation.text}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="library-empty">Your recent translations appear here.</div>
        )}
        <div ref={loadMoreRef} className="library-sentinel" aria-hidden="true" />
        {hasMore && <p className="library-loading">Loading more…</p>}
      </section>
    </main>
  )
}

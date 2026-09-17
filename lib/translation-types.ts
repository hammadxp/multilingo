export type Language = { code: string; name: string; locale: string }
export type Translation = Language & { text: string }
export type SavedItem = {
  id: string
  phrase: string
  translation: Translation
  createdAt: string
}
export type HistoryItem = {
  id: string
  phrase: string
  translations: Translation[]
  createdAt: string
}

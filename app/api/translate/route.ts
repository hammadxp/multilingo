import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const phrase = typeof body?.phrase === "string" ? body.phrase.trim() : ""
  const sourceLanguage =
    typeof body?.sourceLanguage === "string" &&
    /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(body.sourceLanguage)
      ? body.sourceLanguage
      : undefined
  const targetLanguages = Array.isArray(body?.targetLanguages)
    ? body.targetLanguages
        .filter(
          (code: unknown): code is string =>
            typeof code === "string" && /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(code)
        )
        .slice(0, 12)
    : []
  if (!phrase || targetLanguages.length < 1)
    return NextResponse.json(
      { error: "Send a phrase and at least one target language." },
      { status: 400 }
    )
  const apiKey = process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY
  if (!apiKey) return NextResponse.json({ translations: [] })
  const translations = await Promise.all(
    targetLanguages.map(async (target: string) => {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: phrase,
            target,
            source: sourceLanguage,
            format: "text",
          }),
        }
      )
      if (!response.ok) throw new Error("Google Translate request failed")
      const data = await response.json()
      return { locale: target, text: data.data.translations[0].translatedText }
    })
  )
  return NextResponse.json({ translations })
}

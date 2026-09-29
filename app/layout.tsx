import { ClerkProvider } from "@clerk/nextjs"
import { Plus_Jakarta_Sans } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import {
  PROJECT_DESCRIPTION,
  PROJECT_NAME,
  PROJECT_TAGLINE,
  PROJECT_URL,
} from "@/PROJECT_DETAILS"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL(PROJECT_URL),
  title: {
    default: `${PROJECT_NAME} | ${PROJECT_TAGLINE}`,
    template: `%s | ${PROJECT_NAME}`,
  },
  description: PROJECT_DESCRIPTION,
  applicationName: PROJECT_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: PROJECT_NAME,
    title: `${PROJECT_NAME} | ${PROJECT_TAGLINE}`,
    description: PROJECT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${PROJECT_NAME} | ${PROJECT_TAGLINE}`,
    description: PROJECT_DESCRIPTION,
  },
  robots:
    process.env.VERCEL_ENV === "preview"
      ? { index: false, follow: false }
      : { index: true, follow: true },
}

const applicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  url: PROJECT_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  inLanguage: "en",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
      <body className="bg-canvas font-sans text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(applicationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <ClerkProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

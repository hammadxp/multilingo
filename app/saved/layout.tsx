import type { Metadata } from "next"
import { PROJECT_NAME } from "@/PROJECT_DETAILS"

export const metadata: Metadata = {
  title: "Saved Translations",
  description: "Revisit translations you saved in Multilingo.",
  alternates: { canonical: "/saved" },
  openGraph: {
    type: "website",
    url: "/saved",
    siteName: PROJECT_NAME,
    title: `Saved Translations | ${PROJECT_NAME}`,
    description: "Revisit translations you saved in Multilingo.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Saved Translations | ${PROJECT_NAME}`,
    description: "Revisit translations you saved in Multilingo.",
  },
  robots: { index: false, follow: false },
}

export default function SavedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}

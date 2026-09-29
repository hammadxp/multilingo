import type { Metadata } from "next"
import { PROJECT_NAME } from "@/PROJECT_DETAILS"

export const metadata: Metadata = {
  title: "Translation History",
  description: "Review your recent translations in Multilingo.",
  alternates: { canonical: "/history" },
  openGraph: {
    type: "website",
    url: "/history",
    siteName: PROJECT_NAME,
    title: `Translation History | ${PROJECT_NAME}`,
    description: "Review your recent translations in Multilingo.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Translation History | ${PROJECT_NAME}`,
    description: "Review your recent translations in Multilingo.",
  },
  robots: { index: false, follow: false },
}

export default function HistoryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}

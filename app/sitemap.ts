import type { MetadataRoute } from "next"
import { PROJECT_URL } from "@/PROJECT_DETAILS"

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: PROJECT_URL, changeFrequency: "monthly", priority: 1 }]
}

import type { MetadataRoute } from "next"
import { PROJECT_URL } from "@/PROJECT_DETAILS"

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", PROJECT_URL).toString(),
  }
}

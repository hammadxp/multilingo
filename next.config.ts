import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://hatscripts.github.io/circle-flags/flags/**")],
  },
}

export default nextConfig

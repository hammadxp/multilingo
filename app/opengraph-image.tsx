import { ImageResponse } from "next/og"
import { PROJECT_NAME, PROJECT_TAGLINE } from "@/PROJECT_DETAILS"

export const alt = `${PROJECT_NAME}: ${PROJECT_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#f5faff",
        color: "#1b304c",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "#40a3e7",
          }}
        />
        {PROJECT_NAME}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            maxWidth: 1000,
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.1,
          }}
        >
          {PROJECT_TAGLINE}
        </div>
        <div style={{ fontSize: 30, color: "#4a6885" }}>
          Compare translations side by side. Save the ones that matter.
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {["English", "Español", "Français", "Deutsch"].map((language) => (
          <div
            key={language}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: "#dcefff",
              fontSize: 22,
            }}
          >
            {language}
          </div>
        ))}
      </div>
    </div>,
    size
  )
}

import Image from "next/image"
import { Globe2 } from "lucide-react"
import { flagForLocale } from "@/lib/languages"

type LanguageFlagProps = { locale: string }

export function LanguageFlag({ locale }: LanguageFlagProps) {
  if (locale === "auto") {
    return (
      <span
        className="grid h-4.5 w-6 flex-none place-items-center overflow-hidden rounded-xs leading-none text-muted-ink shadow-[0_0_0_1px_rgba(28,41,72,0.12)] shadow-none [&_img]:block [&_img]:size-full [&_img]:object-cover"
        aria-hidden="true"
      >
        <Globe2 size={16} />
      </span>
    )
  }

  return (
    <span
      className="grid h-4.5 w-6 flex-none place-items-center overflow-hidden rounded-xs leading-none shadow-[0_0_0_1px_rgba(28,41,72,0.12)] [&_img]:block [&_img]:size-full [&_img]:object-cover"
      aria-hidden="true"
    >
      <Image
        src={`https://flagcdn.com/${flagForLocale(locale)}.png`}
        width={24}
        height={18}
        alt=""
        unoptimized={false}
      />
    </span>
  )
}

import Image from "next/image"
import { Globe2 } from "lucide-react"
import { flagForLocale } from "@/lib/languages"

type LanguageFlagProps = { locale: string }

export function LanguageFlag({ locale }: LanguageFlagProps) {
  if (locale === "auto") {
    return (
      <span
        className="grid h-4.5 w-6 flex-none place-items-center overflow-hidden rounded-xs leading-none text-muted-ink [&_img]:block [&_img]:size-full [&_img]:object-cover"
        aria-hidden="true"
      >
        <Globe2 size={16} />
      </span>
    )
  }

  return (
    <span
      className="grid h-4.5 w-6 flex-none place-items-center overflow-hidden leading-none [clip-path:polygon(0_0,92%_0,100%_18%,93%_38%,100%_58%,93%_78%,100%_100%,0_100%)] [&_img]:block [&_img]:size-full [&_img]:object-cover"
      aria-hidden="true"
    >
      <Image
        src={`https://flagcdn.com/24x18/${flagForLocale(locale)}.png`}
        width={24}
        height={18}
        alt=""
        unoptimized={false}
      />
    </span>
  )
}

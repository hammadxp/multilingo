export function getTranslationTextSize(length: number) {
  if (length > 600) return "text-base md:text-base"
  if (length > 250) return "text-[19px] md:text-[19px]"

  return "text-[clamp(16px,2vw,26px)] md:text-[clamp(16px,2vw,26px)]"
}

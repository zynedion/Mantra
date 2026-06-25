import { franc } from 'franc'

const FRANC_TO_MYMEMORY: Record<string, string> = {
  jpn: 'ja',
  zho: 'zh',
  cmn: 'zh',
  kor: 'ko',
  eng: 'en',
  ind: 'id',
  und: 'ja' // default to Japanese for manga context
}

export function detectAndMap(text: string): string {
  // Use franc to detect with minLength: 3
  const iso3 = franc(text, { minLength: 3 })
  return FRANC_TO_MYMEMORY[iso3] ?? 'ja'
}

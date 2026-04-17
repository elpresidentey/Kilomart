import type { ReactNode } from 'react'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { repairMojibake } from './repairText'
import { strings, type Language } from './strings'

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setLanguage: (_language: Language) => {},
  t: (key) => strings.en[key as keyof typeof strings.en] ?? key,
})

const STORAGE_KEY = 'farmersmarket_language'
const LEGACY_STORAGE_KEY = ['kilo', 'market_language'].join('')
function readInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY)
  if (raw === 'en' || raw === 'ha' || raw === 'yo' || raw === 'ig') return raw
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => readInitialLanguage())

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, language)
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
  }, [language])

  const setLanguage = useCallback((next: Language) => setLanguageState(next), [])

  const t = useCallback(
    (key: string) => {
      const current = strings[language] as Record<string, string>
      const fallback = strings.en as Record<string, string>
      return repairMojibake(current[key] ?? fallback[key] ?? key)
    },
    [language],
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

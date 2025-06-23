'use client'

import { usePathname } from 'next/navigation'

export type Locale = 'jp' | 'global'

export function useLocale(): Locale {
  const pathname = usePathname()
  return pathname.includes('/jp') ? 'jp' : 'global'
}

export function getLocaleFromPath(pathname: string): Locale {
  return pathname.includes('/jp') ? 'jp' : 'global'
}
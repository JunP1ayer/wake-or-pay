'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const LOCALE_STORAGE_KEY = 'wake-or-pay-locale'

export default function LanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const currentLocale = pathname.includes('/jp') ? 'jp' : 'en'

  useEffect(() => {
    setMounted(true)
    
    // Note: Removed automatic locale redirection to maintain proper onboarding flow
    // Users can still manually change language via the toggle
  }, [])

  const handleLocaleChange = (newLocale: 'en' | 'jp') => {
    // Save preference to localStorage
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    
    // Determine new path
    let newPath = pathname
    
    if (newLocale === 'jp') {
      if (!pathname.includes('/jp')) {
        // Add /jp prefix
        newPath = pathname === '/' ? '/jp' : `/jp${pathname}`
      }
    } else {
      if (pathname.includes('/jp')) {
        // Remove /jp prefix
        newPath = pathname.replace('/jp', '') || '/'
      }
    }
    
    // Navigate to new path
    router.push(newPath)
    setIsOpen(false)
  }

  // Prevent hydration mismatch - show exactly same structure
  if (!mounted) {
    return (
      <div className="relative">
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Globe className="w-4 h-4" />
          <span>English</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLocale === 'jp' ? '日本語' : 'English'}</span>
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
            <button
              onClick={() => handleLocaleChange('en')}
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                currentLocale === 'en' && "bg-primary-50 text-primary-700 font-medium"
              )}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => handleLocaleChange('jp')}
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                currentLocale === 'jp' && "bg-primary-50 text-primary-700 font-medium"
              )}
            >
              🇯🇵 日本語
            </button>
          </div>
        </>
      )}
    </div>
  )
}
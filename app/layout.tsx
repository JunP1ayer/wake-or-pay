import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PWAInstaller from '@/components/PWAInstaller'
import LanguageToggle from '@/components/LanguageToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'),
  title: 'Wake or Pay - Never Oversleep Again',
  description: '30-second setup to stop oversleeping with biometric verification and automatic penalties',
  manifest: '/manifest.json',
  keywords: ['alarm', 'wake up', 'productivity', 'habits', 'sleep'],
  authors: [{ name: 'Wake or Pay Team' }],
  creator: 'Wake or Pay',
  publisher: 'Wake or Pay',
  openGraph: {
    title: 'Wake or Pay - Never Oversleep Again',
    description: '30-second setup to stop oversleeping with biometric verification and automatic penalties',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
    siteName: 'Wake or Pay',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Wake or Pay - Never Oversleep Again',
    description: '30-second setup to stop oversleeping with biometric verification and automatic penalties',
    images: ['/icons/icon-512x512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wake or Pay',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Language Toggle */}
          <div className="absolute top-4 right-4 z-50">
            <LanguageToggle />
          </div>
          
          <main className="min-h-screen">
            {children}
          </main>
        </div>
        <PWAInstaller />
      </body>
    </html>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Share, Copy, ExternalLink, CheckCircle } from 'lucide-react'
import { 
  shareAchievement, 
  generateLineShareUrl, 
  generateTwitterShareUrl, 
  copyToClipboard,
  getShareMessage 
} from '@/lib/share'

interface ShareButtonProps {
  streak: number
  achievement?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

export function ShareButton({ streak, achievement, variant = 'outline', size = 'default' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareMessage = getShareMessage(streak, achievement)
  const shareUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wake-or-pay.com'

  const handleNativeShare = async () => {
    const result = await shareAchievement(streak, achievement)
    if (result.success) {
      setIsOpen(false)
    }
    // If native share fails, dialog stays open showing fallback options
  }

  const handleCopyLink = async () => {
    const shareText = `${shareMessage} ${shareUrl}`
    const success = await copyToClipboard(shareText)
    
    if (success) {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsOpen(false)
      }, 2000)
    }
  }

  const lineShareUrl = generateLineShareUrl(shareMessage, shareUrl)
  const twitterShareUrl = generateTwitterShareUrl(shareMessage, shareUrl)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="flex items-center gap-2">
          <Share className="w-4 h-4" />
          シェア
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>成果をシェア</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview Message */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="font-medium text-gray-900">{shareMessage}</p>
            <p className="text-sm text-gray-600 mt-1">{shareUrl}</p>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* Native Share (if available) */}
            {typeof window !== 'undefined' && 'share' in navigator && (
              <Button 
                onClick={handleNativeShare} 
                className="w-full justify-start"
                variant="outline"
              >
                <Share className="w-4 h-4 mr-2" />
                シェア
              </Button>
            )}

            {/* LINE Share */}
            <Button 
              asChild
              className="w-full justify-start bg-green-500 hover:bg-green-600 text-white"
            >
              <a href={lineShareUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                LINEでシェア
              </a>
            </Button>

            {/* X (Twitter) Share */}
            <Button 
              asChild
              className="w-full justify-start bg-gray-900 hover:bg-gray-800 text-white"
            >
              <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                X (Twitter) でシェア
              </a>
            </Button>

            {/* Copy Link */}
            <Button 
              onClick={handleCopyLink}
              variant="outline"
              className="w-full justify-start"
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  コピーしました！
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  リンクをコピー
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            早起きの成果を友達と共有しましょう！
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
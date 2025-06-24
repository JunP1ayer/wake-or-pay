export interface ShareData {
  title: string
  text: string
  url: string
}

export async function shareAchievement(streak: number, achievement?: string) {
  const shareData: ShareData = {
    title: 'Wake-or-Pay Challenge',
    text: achievement 
      ? `${achievement} - ${streak}日連続早起き成功！ #WakeOrPay #早起きチャレンジ` 
      : `${streak}日連続早起き成功！ #WakeOrPay #早起きチャレンジ`,
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://wake-or-pay.com'
  }

  // Try native Web Share API first
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData)
      return { success: true, method: 'native' }
    } catch (error) {
      console.log('Native share canceled or failed:', error)
      // Fall through to other options
    }
  }

  // Fallback options
  return { success: false, method: 'fallback', shareData }
}

export function generateLineShareUrl(text: string, url: string) {
  const encodedText = encodeURIComponent(`${text} ${url}`)
  return `https://line.me/R/msg/text/?${encodedText}`
}

export function generateTwitterShareUrl(text: string, url: string) {
  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)
  return `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
}

export async function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return successful
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

export function getShareMessage(streak: number, achievement?: string) {
  if (achievement) {
    return `${achievement} - ${streak}日連続早起き成功！ #WakeOrPay #早起きチャレンジ`
  }
  
  if (streak === 1) {
    return '初回早起き成功！ #WakeOrPay #早起きチャレンジ'
  } else if (streak === 7) {
    return '1週間連続早起き達成！ #WakeOrPay #早起きチャレンジ'
  } else if (streak === 30) {
    return '1ヶ月連続早起き達成！ #WakeOrPay #早起きチャレンジ'
  } else if (streak % 10 === 0) {
    return `${streak}日連続早起き達成！継続は力なり！ #WakeOrPay #早起きチャレンジ`
  } else {
    return `${streak}日連続早起き成功！ #WakeOrPay #早起きチャレンジ`
  }
}

export async function generateBadgeImage(badgeName: string, description: string, date: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }
    
    canvas.width = 600
    canvas.height = 400
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 600, 400)
    
    // Badge background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.beginPath()
    ctx.roundRect(50, 50, 500, 300, 20)
    ctx.fill()
    
    // Title
    ctx.fillStyle = '#2d3748'
    ctx.font = 'bold 36px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(badgeName, 300, 140)
    
    // Description
    ctx.font = '20px Arial, sans-serif'
    ctx.fillStyle = '#4a5568'
    ctx.fillText(description, 300, 180)
    
    // Achievement date
    ctx.font = '16px Arial, sans-serif'
    ctx.fillStyle = '#718096'
    ctx.fillText(`Achieved on ${date}`, 300, 220)
    
    // Trophy emoji (simplified as text)
    ctx.font = '48px Arial, sans-serif'
    ctx.fillText('🏆', 300, 280)
    
    // Branding
    ctx.font = 'bold 14px Arial, sans-serif'
    ctx.fillStyle = '#a0aec0'
    ctx.fillText('Wake-or-Pay Challenge', 300, 320)
    
    // Convert to data URL
    resolve(canvas.toDataURL('image/png'))
  })
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function shareOnSocialMedia(platform: 'twitter' | 'line' | 'facebook', text: string, url?: string) {
  const shareUrl = url || process.env.NEXT_PUBLIC_APP_URL || 'https://wake-or-pay.com'
  
  switch (platform) {
    case 'twitter':
      const twitterUrl = generateTwitterShareUrl(text, shareUrl)
      window.open(twitterUrl, '_blank', 'width=550,height=420')
      break
    case 'line':
      const lineUrl = generateLineShareUrl(text, shareUrl)
      window.open(lineUrl, '_blank')
      break
    case 'facebook':
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`
      window.open(facebookUrl, '_blank', 'width=550,height=420')
      break
  }
}
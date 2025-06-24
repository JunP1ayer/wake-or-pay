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
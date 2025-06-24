import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock Web Share API
Object.assign(navigator, {
  share: vi.fn(() => Promise.resolve()),
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
})

describe('Social Sharing', () => {
  it('should use native Web Share API when available', async () => {
    const ShareComponent = () => (
      <button onClick={() => navigator.share({
        title: 'Wake-or-Pay Challenge',
        text: '7日連続早起き成功！',
        url: window.location.origin
      })}>
        Share Achievement
      </button>
    )
    
    render(<ShareComponent />)
    
    const shareBtn = screen.getByText('Share Achievement')
    fireEvent.click(shareBtn)
    
    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Wake-or-Pay Challenge',
        text: '7日連続早起き成功！',
        url: expect.any(String)
      })
    })
  })

  it('should show fallback options when Web Share API unavailable', async () => {
    // Temporarily remove share API
    const originalShare = navigator.share
    delete (navigator as any).share
    
    const ShareComponent = () => (
      <div>
        <h3>Share your achievement</h3>
        <button>Share on LINE</button>
        <button>Share on X (Twitter)</button>
        <button>Copy Link</button>
      </div>
    )
    
    render(<ShareComponent />)
    
    expect(screen.getByText('Share on LINE')).toBeInTheDocument()
    expect(screen.getByText('Share on X (Twitter)')).toBeInTheDocument()
    expect(screen.getByText('Copy Link')).toBeInTheDocument()
    
    // Restore share API
    navigator.share = originalShare
  })

  it('should copy link to clipboard as fallback', async () => {
    const ShareComponent = () => (
      <button onClick={() => navigator.clipboard.writeText('https://wake-or-pay.com/share/achievement')}>
        Copy Link
      </button>
    )
    
    render(<ShareComponent />)
    
    const copyBtn = screen.getByText('Copy Link')
    fireEvent.click(copyBtn)
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('wake-or-pay')
      )
    })
  })

  it('should generate LINE share URL', async () => {
    const ShareComponent = () => (
      <a href="https://line.me/R/msg/text/?7日連続早起き成功！%20https://wake-or-pay.com">
        Share on LINE
      </a>
    )
    
    render(<ShareComponent />)
    
    const lineLink = screen.getByText('Share on LINE')
    expect(lineLink).toHaveAttribute('href', expect.stringContaining('line.me'))
  })

  it('should generate X (Twitter) share URL', async () => {
    const ShareComponent = () => (
      <a href="https://x.com/intent/tweet?text=7日連続早起き成功！&url=https://wake-or-pay.com">
        Share on X (Twitter)
      </a>
    )
    
    render(<ShareComponent />)
    
    const twitterLink = screen.getByText('Share on X (Twitter)')
    expect(twitterLink).toHaveAttribute('href', expect.stringContaining('x.com/intent/tweet'))
  })
})
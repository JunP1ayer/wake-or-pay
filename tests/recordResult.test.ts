import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateSuccessRate } from '@/utils/recordResult'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [
                { is_success: true },
                { is_success: false },
                { is_success: true },
                { is_success: true }
              ]
            }))
          }))
        }))
      }))
    }))
  }
}))

describe('recordResult utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateSuccessRate', () => {
    it('should calculate success rate correctly', async () => {
      const rate = await calculateSuccessRate('test-user-id', 7)
      expect(rate).toBe(75) // 3 out of 4 successes = 75%
    })

    it('should handle empty results', async () => {
      // Mock empty results
      vi.doMock('@/lib/supabase', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                gte: vi.fn(() => ({
                  order: vi.fn(() => ({
                    data: []
                  }))
                }))
              }))
            }))
          }))
        }
      }))

      const rate = await calculateSuccessRate('test-user-id', 7)
      expect(rate).toBe(0)
    })
  })
})
import { describe, it, expect } from 'vitest'
import { formatTime, formatCurrency, generateId, cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2024-01-01T14:30:00')
      expect(formatTime(date)).toBe('14:30')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency in cents to dollars', () => {
      expect(formatCurrency(500)).toBe('$5.00')
      expect(formatCurrency(1250)).toBe('$12.50')
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
    })
  })

  describe('cn (className merger)', () => {
    it('should merge classnames correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
      expect(cn('p-4', undefined, 'text-lg')).toBe('p-4 text-lg')
    })
  })
})
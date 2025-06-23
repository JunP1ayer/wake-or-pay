export interface PaymentConfig {
  currency: string
  symbol: string
  amount: number  // Single fixed amount
  texts: {
    title: string
    subtitle: string
    commitment: string
    button: string
  }
}

export const PAYMENT_CONFIGS: Record<string, PaymentConfig> = {
  jp: {
    currency: 'JPY',
    symbol: '¥',
    amount: 100,
    texts: {
      title: '罰金設定',
      subtitle: '寝坊したら¥100が自動で請求されます',
      commitment: '寝坊したら¥100が自動で請求されます',
      button: '¥100で続ける'
    }
  },
  global: {
    currency: 'USD',
    symbol: '$',
    amount: 1,
    texts: {
      title: 'Penalty Setup',
      subtitle: 'You\'ll automatically be charged $1 if you don\'t wake up.',
      commitment: 'I\'ll automatically be charged $1 if I don\'t wake up',
      button: 'Continue with $1'
    }
  }
}

export function getPaymentConfig(locale: 'jp' | 'global'): PaymentConfig {
  return PAYMENT_CONFIGS[locale] || PAYMENT_CONFIGS.global
}

// Convert amount to cents/smallest currency unit for Stripe
export function convertToSmallestUnit(amount: number, currency: string): number {
  // Most currencies use 2 decimal places (cents)
  // JPY and a few others don't use decimal places
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'PYG', 'RWF', 'UGX', 'VUV', 'XAF', 'XOF', 'XPF']
  
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return amount
  }
  
  return amount * 100
}

// Get the penalty amount for a locale
export function getPenaltyAmount(locale: 'jp' | 'global'): number {
  return getPaymentConfig(locale).amount
}
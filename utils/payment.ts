export interface PaymentConfig {
  currency: string
  symbol: string
  amounts: number[]
  default: number
  minAmount: number
  maxAmount: number
  allowAmountSelection: boolean  // Flag to control amount selection UI
  texts: {
    title: string
    subtitle: string
    commitment: (amount: number) => string
    button: (amount: number) => string
  }
}

export const PAYMENT_CONFIGS: Record<string, PaymentConfig> = {
  jp: {
    currency: 'JPY',
    symbol: '円',
    amounts: [100], // Fixed amount for Japan
    default: 100,
    minAmount: 100,
    maxAmount: 100,
    allowAmountSelection: false,
    texts: {
      title: '罰金設定',
      subtitle: '寝坊したら100円払います',
      commitment: (amount: number) => `寝坊したら${amount}円払います`,
      button: (amount: number) => `続ける`
    }
  },
  global: {
    currency: 'USD',
    symbol: '$',
    amounts: [1], // Fixed $1 for global version
    default: 1,
    minAmount: 1,
    maxAmount: 1,
    allowAmountSelection: false,
    texts: {
      title: 'Penalty Setup',
      subtitle: 'You\'ll pay $1 if you oversleep',
      commitment: (amount: number) => `I\'ll pay $${amount} if I oversleep`,
      button: (amount: number) => `Continue`
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
const DEFAULT_LOCALE = 'en-US'

export function currencyFormatter(value: number): {
  prefix: string
  value: string
} {
  return {
    prefix: '$',
    value: Intl.NumberFormat(DEFAULT_LOCALE, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(isNaN(value) ? 0 : value),
  }
}

export function numberFormatter(value: number): string {
  return Intl.NumberFormat(DEFAULT_LOCALE, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

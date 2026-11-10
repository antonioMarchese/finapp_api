export const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP'] as const;

export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = 'BRL';

export function isCurrency(value: unknown): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

// Aggregates are never converted between currencies, so every total the API
// reports is grouped under the currency it was recorded in.
export type ByCurrency<T> = Partial<Record<Currency, T>>;

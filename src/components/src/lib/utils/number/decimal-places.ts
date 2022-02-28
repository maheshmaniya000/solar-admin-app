import { Decimal } from 'decimal.js';

export function decimalPlaces(value: number): number {
  return new Decimal(value).decimalPlaces();
}

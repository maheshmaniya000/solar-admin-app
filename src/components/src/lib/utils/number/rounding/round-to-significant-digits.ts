import { Decimal } from 'decimal.js';

export function roundToSignificantDigits(
  value: number,
  significantDigits: number = 1
): number {
  return new Decimal(value).toSignificantDigits(significantDigits).toNumber();
}

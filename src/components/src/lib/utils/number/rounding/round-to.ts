import { Decimal } from 'decimal.js';

export function roundTo(
  value: number,
  decimalPlacesCount: number = 6,
  rounding: Decimal.Rounding = Decimal.ROUND_HALF_UP
): number {
  return new Decimal(value)
    .toDecimalPlaces(decimalPlacesCount, rounding)
    .toNumber();
}

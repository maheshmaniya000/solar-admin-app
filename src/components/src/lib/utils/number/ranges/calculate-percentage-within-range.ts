import { clamp, isNil } from 'lodash-es';

export function calculatePercentageWithinRange(
  value: number,
  min: number,
  max: number
): number {
  if (isNil(value)) {
    throw new Error(`'value' param is nil`);
  }
  if (isNil(min)) {
    throw new Error(`'min' range bound param is nil`);
  }
  if (isNil(max)) {
    throw new Error(`'max' range bound param is nil`);
  }

  return ((clamp(value, min, max) - min) * 100) / (max - min);
}

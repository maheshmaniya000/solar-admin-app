import { isNaturalNumber } from './is-natural-number';

export function isNaturalNumberOrZero(value: number): boolean {
  return value === 0 || isNaturalNumber(value);
}

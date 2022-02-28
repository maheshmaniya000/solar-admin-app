export function isNaturalNumber(value: number): boolean {
  return value > 0 && Number.isInteger(value);
}

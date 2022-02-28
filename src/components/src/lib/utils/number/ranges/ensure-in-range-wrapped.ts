export function ensureInRangeWrapped(value: number, range: number): number {
  let result = value;
  while (result < -range) {
    result += 2 * range;
  }
  while (result > range) {
    result -= 2 * range;
  }
  return result;
}

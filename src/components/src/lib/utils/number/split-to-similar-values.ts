/**
 * Splits the given number into an array of numbers whose sum is given number.
 * E.g:
 * splitToSimilarValues(23, 5) = [5, 5, 5, 4, 4]
 */
export function splitToSimilarValues(value: number, count: number): number[] {
  if (value <= 0 || count <= 0) {
    throw new Error(
      `Value (${value}) and count (${count}) must be greater than zero`
    );
  }
  if (value < count) {
    throw new Error(`Value (${value}) must be greater than count (${count})`);
  }
  const basicValue = Math.floor(value / count);
  const stopIndex = value % count;
  const result = Array(count).fill(basicValue);
  for (let i = 0; i < stopIndex; i++) {
    result[i]++;
  }
  return result;
}

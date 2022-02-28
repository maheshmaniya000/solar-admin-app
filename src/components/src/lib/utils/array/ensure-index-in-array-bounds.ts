export function ensureIndexInArrayBounds(
  index: number,
  arrayLength: number
): number {
  if (index < 0) {
    return index + arrayLength;
  }
  if (index >= arrayLength) {
    return index - arrayLength;
  }
  return index;
}

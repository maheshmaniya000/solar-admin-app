export function isCloseTo(
  value: number,
  toCompare: number,
  tolerance: number = 0.005
): boolean {
  return Math.abs(value - toCompare) < tolerance;
}

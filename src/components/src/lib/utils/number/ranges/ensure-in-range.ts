export function ensureInRange(value: number, to: number): number {
  if (to === 0) {
    throw new Error('Range must not be zero');
  }
  return (value + to) % to;
}

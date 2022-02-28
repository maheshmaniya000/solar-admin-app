export function multipleOf(
  value: number,
  multiplicator: number,
  offset: number = 0,
  roundingFn: (value: number) => number
): number {
  return roundingFn((value - offset) / multiplicator) * multiplicator + offset;
}

export function nextMultipleOf(
  value: number,
  multiplicator: number,
  offset: number = 0
): number {
  return multipleOf(value, multiplicator, offset, Math.ceil);
}

export function previousMultipleOf(
  value: number,
  multiplicator: number,
  offset: number = 0
): number {
  return multipleOf(value, multiplicator, offset, Math.floor);
}

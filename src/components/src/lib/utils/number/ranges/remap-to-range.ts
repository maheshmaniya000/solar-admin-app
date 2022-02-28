export function remapToRange(
  value: number,
  rangeMin: number,
  rangeMax: number,
  newRangeMin: number = 0.0,
  newRangeMax: number = 1.0
): number {
  return (
    ((value - rangeMin) * (newRangeMax - newRangeMin)) / (rangeMax - rangeMin) +
    newRangeMin
  );
}

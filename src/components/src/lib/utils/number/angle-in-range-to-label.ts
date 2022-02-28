import { ensureInRange } from './ranges';

export function angleInRangeToLabel(
  angle: number,
  labels: string[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
): string {
  const circlePartSize = 360 / labels.length;
  const index = Math.round(ensureInRange(angle, 360) / circlePartSize);
  return labels[ensureInRange(index, labels.length)];
}

export function kiloToBasicUnits(value: number): number {
  return value * 1000;
}

export function basicUnitsToKilo(value: number): number {
  return value / 1000;
}

export function toDegrees(angle: number): number {
  return (angle * 180) / Math.PI;
}

export function toRadians(angle: number): number {
  return (angle * Math.PI) / 180;
}

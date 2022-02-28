import { mapValuesDeep } from './map-values-deep';

export function removeNegativeZerosDeep<T extends Record<string, unknown>>(obj: T): T {
  return mapValuesDeep(obj, val => (Object.is(val, -0) ? 0 : val));
}

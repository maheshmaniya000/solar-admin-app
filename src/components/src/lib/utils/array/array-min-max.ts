import { castArray, isEmpty, isNil } from 'lodash-es';

export function arrayMinMax(value: number[] | number): [number, number?] {
  if (isNil(value) || (Array.isArray(value) && isEmpty(value))) {
    throw new Error(`Cannot get min and max from ${value}`);
  }
  value = castArray(value);
  const min = Math.min(...value);
  const max = Math.max(...value);
  return max - min === 0 ? [min] : [min, max];
}

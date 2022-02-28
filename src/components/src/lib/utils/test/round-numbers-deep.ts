import { isNumber } from 'lodash-es';

import { roundTo } from '../number/rounding/round-to';
import { mapValuesDeep } from './map-values-deep';

export function roundNumbersDeep<T extends Record<string, unknown>>(
  obj: T,
  decimals: number = 2
): T {
  return mapValuesDeep(obj, val =>
    isNumber(val) ? roundTo(val, decimals) : val
  );
}

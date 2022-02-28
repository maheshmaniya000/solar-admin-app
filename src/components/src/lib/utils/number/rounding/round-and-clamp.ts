import { Decimal } from 'decimal.js';
import { clamp } from 'lodash-es';

import { roundTo } from './round-to';

export function roundAndClamp(
  value: number,
  config: {
    min: number;
    max: number;
    decimals: number;
  }
): number {
  return clamp(
    roundTo(value, config.decimals, Decimal.ROUND_HALF_UP),
    roundTo(config.min, config.decimals, Decimal.ROUND_UP),
    roundTo(config.max, config.decimals, Decimal.ROUND_DOWN)
  );
}

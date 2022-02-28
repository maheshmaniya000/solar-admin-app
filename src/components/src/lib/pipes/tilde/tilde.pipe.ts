import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Decimal } from 'decimal.js';
import { isNil } from 'lodash-es';

import { roundTo } from '../../utils';

@Pipe({
  name: 'sgTilde'
})
export class TildePipe implements PipeTransform {
  private static readonly defaultConfig = {
    decimalPlaces: 2,
    rounding: Decimal.ROUND_HALF_UP
  };

  transform(
    value: number,
    config: {
      decimalPlaces?: number;
      digitsInfo?: string;
      rounding?: Decimal.Rounding;
    } = TildePipe.defaultConfig
  ): string {
    if (isNil(value)) {
      return undefined;
    }
    config.decimalPlaces =
      config.decimalPlaces ?? TildePipe.defaultConfig.decimalPlaces;
    config.rounding = config.rounding ?? TildePipe.defaultConfig.rounding;
    config.digitsInfo = config.digitsInfo ?? `1.0-${config.decimalPlaces}`;
    const rounded = roundTo(value, config.decimalPlaces, config.rounding);
    const formatted = formatNumber(rounded, 'en', config.digitsInfo);
    return rounded === value ? formatted : `~${formatted}`;
  }
}

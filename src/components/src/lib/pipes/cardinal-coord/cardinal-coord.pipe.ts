import { Pipe, PipeTransform } from '@angular/core';

import { angleInRangeToLabel, isNotNil } from '../../utils';

@Pipe({
  name: 'sgCardinalCoord'
})
export class SgCardinalCoordPipe implements PipeTransform {
  transform(value: number): string {
    return isNotNil(value) && value >= 0
      ? angleInRangeToLabel(value)
      : undefined;
  }
}

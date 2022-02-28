import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { SgScssVariables } from '../../styles/scss-variables';
import { isNaturalNumberOrZero } from '../utils';

interface QuantityTitle {
  text: string;
  lineCount: number;
}

@Component({
  selector: 'sg-quantity',
  templateUrl: './quantity.component.html',
  styleUrls: ['./quantity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuantityComponent {
  @Input() title: QuantityTitle;
  @Input() subTitle: QuantityTitle;
  @Input() value: number;
  @Input() unitHtml: string;

  calculateTitleHeight(lineCount: number): number {
    if (!isNaturalNumberOrZero(lineCount)) {
      throw new Error('lineCount must be a natural number or zero');
    }

    return SgScssVariables.sgCaptionLineHeight * lineCount;
  }
}

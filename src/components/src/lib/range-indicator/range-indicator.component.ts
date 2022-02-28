import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { clamp } from 'lodash-es';

import { calculatePercentageWithinRange } from '../utils';

@Component({
  selector: 'sg-range-indicator',
  templateUrl: './range-indicator.component.html',
  styleUrls: ['./range-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeIndicatorComponent implements OnChanges {
  @Input() min: number;
  @Input() max: number;
  @Input() target: number;
  @Input() value: number;

  barWidth: number;
  targetPosition: number;
  barColorClass: string;

  ngOnChanges(): void {
    if (this.max <= this.min) {
      throw new Error(
        `Invalid inputs for RangeIndicatorComponent: min must be less than max (min: ${this.min}, max: ${this.max})`
      );
    }
    this.value = clamp(this.value, this.min, this.max);
    this.barWidth = calculatePercentageWithinRange(
      this.value,
      this.min,
      this.max
    );
    this.targetPosition = calculatePercentageWithinRange(
      this.target,
      this.min,
      this.max
    );
    this.barColorClass = this.getBarColorClass();
  }

  private getBarColorClass(): string {
    return this.value < this.target
      ? 'less'
      : this.value === this.target
      ? 'equal'
      : 'greater';
  }
}

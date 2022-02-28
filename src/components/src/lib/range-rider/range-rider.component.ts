import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { clamp, first, initial, inRange, isNil, last, sortBy, tail, zip } from 'lodash-es';

import { Range } from '../models/range.model';
import { calculatePercentageWithinRange } from '../utils';
import { RangeRiderStop } from './model/range-rider-stop.model';

@Component({
  selector: 'sg-range-rider',
  templateUrl: './range-rider.component.html',
  styleUrls: ['./range-rider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeRiderComponent implements OnChanges {
  @Input() stops: RangeRiderStop[];
  @Input() value: number;

  activeIntervalConfig: {
    width: number;
    leftOffset: number;
    background: string;
  };
  riderLeftOffset: number;

  private static calculateIntervalPercentageRange(
    interval: Range<RangeRiderStop>,
    totalRange: Range
  ): Range {
    return {
      min: calculatePercentageWithinRange(
        interval.min.value,
        totalRange.min,
        totalRange.max
      ),
      max: calculatePercentageWithinRange(
        interval.max.value,
        totalRange.min,
        totalRange.max
      )
    };
  }

  private static buildIntervalBackgroundLinearGradient(
    interval: Range<RangeRiderStop>
  ): string {
    return `linear-gradient(to right, ${interval.min.color}, 50%, ${interval.max.color})`;
  }

  ngOnChanges(): void {
    this.validateStops();
    const intervals = this.getIntervals();
    const totalRange = Range.from(
      first(intervals).min.value,
      last(intervals).max.value
    );
    const activeInterval = this.getActiveInterval(intervals, totalRange);
    const activeIntervalPercentageRange = RangeRiderComponent.calculateIntervalPercentageRange(
      activeInterval,
      totalRange
    );
    this.activeIntervalConfig = {
      width: Range.size(activeIntervalPercentageRange),
      leftOffset: activeIntervalPercentageRange.min,
      background: RangeRiderComponent.buildIntervalBackgroundLinearGradient(
        activeInterval
      )
    };
    this.riderLeftOffset = this.calculateRiderLeftOffset(totalRange);
  }

  private validateStops(): void {
    if (isNil(this.stops) || this.stops.length < 2) {
      throw new Error(
        `Minimum number of stops is 2, got ${this.stops?.length ?? undefined}`
      );
    }

    this.stops.forEach(stop => {
      const errorMessage = ` property of range rider stop object ${JSON.stringify(
        stop
      )} is undefined`;

      if (isNil(stop.value)) {
        throw new Error(`Value ${errorMessage}`);
      }

      if (isNil(stop.color)) {
        throw new Error(`Color ${errorMessage}`);
      }
    });
  }

  private getIntervals(): Range<RangeRiderStop>[] {
    const sortedStops = sortBy(this.stops, ({ value }) => value);
    return zip(initial(sortedStops), tail(sortedStops))
      .map(([from, to]) => Range.from(from, to))
      .filter(({ min, max }) => min.value !== max.value);
  }

  private getActiveInterval(
    intervals: Range<RangeRiderStop>[],
    range: Range
  ): Range<RangeRiderStop> {
    const clampedValue = clamp(this.value ?? 0, range.min, range.max);
    return intervals.find(
      ({ min, max }) =>
        inRange(clampedValue, min.value, max.value) ||
        clampedValue === max.value
    );
  }

  private calculateRiderLeftOffset(range: Range): number {
    return isNil(this.value)
      ? 0
      : calculatePercentageWithinRange(this.value, range.min, range.max);
  }
}

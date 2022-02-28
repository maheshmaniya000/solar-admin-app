import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

import { DataLayer } from '@solargis/dataset-core';
import { DataStats, MonthlyHourlyData } from '@solargis/types/dataset';
import { range } from '@solargis/types/utils';

import { months } from 'ng-shared/utils/translation.utils';

import { HourlyHeatmapDataSource } from './hourly-heatmap.data-source';
import { Interpolator } from './interpolator';


const heatmapColors = [
  '#bcccc1',
  '#faf8af',
  '#ffbc8c',
  '#e6675c',
];

@Component({
  selector: 'sg-hourly-heatmap',
  templateUrl: './hourly-heatmap.component.html',
  styleUrls: ['./hourly-heatmap.component.scss']
})
export class HourlyHeatmapComponent implements OnInit {

  @Input() data: MonthlyHourlyData;
  @Input() stats: DataStats;
  @Input() layer: DataLayer;
  dataSource: HourlyHeatmapDataSource;

  months = months;

  monthColumns = range(12).map(num => num.toString());
  columns$ = new BehaviorSubject<string[]>([]);

  interpolator: Interpolator;

  ngOnInit(): void {
    this.columns$.next(['id'].concat(this.monthColumns));
    this.interpolator = new Interpolator(heatmapColors, this.stats);
    this.dataSource = new HourlyHeatmapDataSource(of(this.data), this.layer.unit.aggregation);
  }

  getColor(value: number, isLastRow: boolean): string {
    if (isLastRow) {return null;}
    // For 'TEMP' layer, zero degrees !== NO_VALUE
    if (this.layer.key !== 'TEMP' && value === 0) {return null;}
    return this.interpolator.interpolate(value);
  }

  displayValue(value: number): boolean {
    if (value === 0 && this.layer.key !== 'TEMP') {return false;}
    return true;
  }

  // used for caching table rows
  trackByIndex(index): number {
    return index;
  }

}

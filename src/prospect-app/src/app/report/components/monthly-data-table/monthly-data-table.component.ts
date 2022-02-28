import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DataLayer, Dataset } from '@solargis/dataset-core';
import { Unit } from '@solargis/units';

import { months, yearly } from 'ng-shared/utils/translation.utils';

import { SolarMeteoMonthlyDataSource } from '../../../detail/containers/solar-meteo-monthly/solar-meteo-monthly.data-source';
import { PvElectricityMonthlyDailyDataSource } from '../../containers/project-report/pv-electricity-monthly-daily.data-source';

@Component({
  selector: 'sg-monthly-data-table',
  templateUrl: './monthly-data-table.component.html',
  styleUrls: ['./monthly-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthlyDataTableComponent {

  @Input() dataSource: SolarMeteoMonthlyDataSource | PvElectricityMonthlyDailyDataSource;
  @Input() dataColumns: string[];
  @Input() columns: string[];
  @Input() dataset: Dataset;

  layer(key: string, resolution: 'annual' | 'monthly' = 'annual'): DataLayer {
    return this.dataset[resolution].get(key);
  }

  unit(key: string, monthIndex?: number): Unit {
    const resolution = typeof monthIndex === 'undefined' ? 'annual' : 'monthly';
    return key === 'PVOUT_total' ? (this.dataSource as PvElectricityMonthlyDailyDataSource).getPvoutTotalMonthlyUnit()
      : this.layer(key, resolution).unit;
  }

  dailyAvgUnit(key: string): Unit {
    const k = this.clearKey(key);
    return k === 'PVOUT_total' ? (this.dataSource as PvElectricityMonthlyDailyDataSource).getPvoutTotalMonthlyHourlyUnit()
      : this.dataset['monthly-hourly'].get(k).unit;
  }

  monthTranslationKey(monthIndex): string { // 0-based index
    return typeof monthIndex !== 'undefined' ? months[monthIndex] : yearly;
  }

  clearKey(key: string): string {
    return key.replace('-d', '');
  }
}

import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { range, sum } from '@solargis/types/utils';
import { UnitAggregation } from '@solargis/units';

type HourlyHeatmapDataRow = {
  [key: number]: number;
  hour: number;
  // months
  isLastRow?: boolean;
};

export class HourlyHeatmapDataSource extends DataSource<any> {

  constructor(private readonly data$: Observable<any>, private readonly aggregation: UnitAggregation) {
      super();
  }

  connect(): Observable<HourlyHeatmapDataRow[]> {
    const aggregationFn = this.aggregation === 'avg' ? x => sum(x) / x.length : sum;

    return this.data$.pipe(
      map(data => {
        const hours = range(24);

        // data rows
        const rows: HourlyHeatmapDataRow[] = hours.map(hour => {
          const result = { hour };
          const months = range(12);
          months.forEach(month => result[month.toString()] = data[month][hour]);
          return result;
        });

        // last row with monthly sums
        const lastRow: HourlyHeatmapDataRow = { hour: undefined, isLastRow: true };
        range(12).forEach(month => {
          lastRow[month] = aggregationFn(data[month]);
        });

        rows.push(lastRow);
        return rows;
      })
    );
  }

  disconnect(): void {
    // do nothing
  }
}

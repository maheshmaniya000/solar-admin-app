import { DataSource } from '@angular/cdk/collections';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { months } from 'ng-shared/utils/translation.utils';

export class SolarMeteoMonthlyDataSource extends DataSource<any> {

  filteredKeys$: Observable<string[]>;

  constructor(
    private readonly monthlyData$: Observable<any>,
    private readonly annualData$: Observable<any>,
    private readonly hasPvConfig$: Observable<boolean>,
    private readonly layers$: Observable<string[]>
  ) {
      super();
      // remove GTI_opta when PV config is not set
      this.filteredKeys$ = combineLatest(([hasPvConfig$, layers$])).pipe(
        map(([hasPvConfig, layers]) => layers.filter(key => !(hasPvConfig && key === 'GTI_opta')))
      );
  }

  connect(): Observable<any> {
    return combineLatest(this.monthlyData$, this.annualData$, this.filteredKeys$).pipe(
      filter(([monthlyData, annualData]) => monthlyData && annualData),
      map(([monthlyData, annualData, filteredKeys]) => {
        const result = months.map((m, i) => {
          const monthSlice = filteredKeys.reduce<any>(
            (res, k) => (res[k] = monthlyData[k] ? monthlyData[k][i] : undefined, res),
            {});
          monthSlice.monthIndex = i;
          return monthSlice;
        });
        const yearData = filteredKeys.reduce((res, k) => (res[k] = annualData[k], res), {});
        result.push({ ...yearData });

        return result;
      })
    );
  }

  getColumns(): Observable<string[]> {
    return combineLatest(
      this.monthlyData$,
      this.filteredKeys$
    ).pipe(
      map(([data, filteredKeys]) => {
        const monthlyDataKeys = Object.keys(data);
        return monthlyDataKeys.filter(key => filteredKeys.includes(key));
      }),
    );
  }

  disconnect(): void {
    // do nothing
  }
}

import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { VersionedDatasetData } from '@solargis/types/dataset';
import { Unit } from '@solargis/units';

import { months, yearly } from 'ng-shared/utils/translation.utils';

import { parseMothlyHourlyPVOUT } from '../../utils/pvout-monthly-hourly.utils';
import { parseMothlyPVOUT } from '../../utils/pvout-monthly.utils';

export class PvElectricityMonthlyDailyDataSource extends DataSource<any> {

  private readonly keys = ['GTI', 'GTI-d', 'PVOUT_specific', 'PVOUT_specific-d', 'PVOUT_total', 'PVOUT_total-d', 'PR'];
  private pvoutTotalMonthlyUnit: Unit;
  private pvoutTotalMonthlyHourlyUnit: Unit;

  constructor(private readonly data$: Observable<VersionedDatasetData>) {
    super();
  }

  connect(): Observable<any> {
    return this.data$.pipe(
      filter(pvcalc => !!pvcalc && !!pvcalc.annual && !!pvcalc.monthly && !!pvcalc['monthly-hourly']),
      map(pvcalc => {
        const {
          annual: { data: pvcalcAnnual },
          monthly: { data: pvcalcMonthly },
        } = pvcalc;
        const pvcalcMonthlyHourly = pvcalc['monthly-hourly'].data;

        // PVOUT total - monthly
        const pvoutTotalMonthlyData = [...pvcalcMonthly.PVOUT_total, pvcalcAnnual.PVOUT_total];
        const [pvoutTotalMonthlyUnit, pvoutTotalMonthly] = parseMothlyPVOUT(pvoutTotalMonthlyData);
        this.pvoutTotalMonthlyUnit = pvoutTotalMonthlyUnit;

        // PVOUT total - monthly hourly
        const pvoutTotalMonthlyHourlyData =
          [...pvcalcMonthlyHourly.PVOUT_total.map(h => this.dailyAvg(h)), this.dailySum(pvcalcMonthlyHourly.PVOUT_total)];
        const [pvoutTotalMonthlyHourlyUnit, pvoutTotalMonthlyHourly] = parseMothlyHourlyPVOUT(pvoutTotalMonthlyHourlyData);
        this.pvoutTotalMonthlyHourlyUnit = pvoutTotalMonthlyHourlyUnit;

        const result = months.map((month, i) => ({
            month,
            monthIndex: i,
            ...(this.keys.reduce(
              (res, key) => (res[key] = !key.includes('-d') ? (key === 'PVOUT_total' ? pvoutTotalMonthly[i] : pvcalcMonthly[key][i]) :
                (key === 'PVOUT_total-d' ? pvoutTotalMonthlyHourly[i] : this.dailyAvg(pvcalcMonthlyHourly[key.replace('-d', '')][i])), res)
              , {})
            )
          }));
        result.push({
          month: yearly,
          monthIndex: undefined,
          ...(this.keys.reduce(
            (res, key) => (res[key] = !key.includes('-d') ? (key === 'PVOUT_total' ? pvoutTotalMonthly[12] : pvcalcAnnual[key]) :
              (key === 'PVOUT_total-d' ? pvoutTotalMonthlyHourly[12] : this.dailySum(pvcalcMonthlyHourly[key.replace('-d', '')])), res)
            , {}))
        });
        return result;
      })
    );
  }

  disconnect(): void {
    // do nothing
  }

  getColumns(): string[] {
    return this.keys;
  }

  getPvoutTotalMonthlyUnit(): Unit {
    return this.pvoutTotalMonthlyUnit;
  }

  getPvoutTotalMonthlyHourlyUnit(): Unit {
    return this.pvoutTotalMonthlyHourlyUnit;
  }

  private dailyAvg(values: number[]): number {
    return values.reduce((a, b) => a + b, 0);
  }

  private dailySum(values: number[][]): number {
    const avgs = values.map(v => this.dailyAvg(v));
    return avgs.reduce((a, b) => a + b, 0) / 12;
  }

}

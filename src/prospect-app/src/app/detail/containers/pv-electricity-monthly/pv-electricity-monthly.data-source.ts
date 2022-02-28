import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { VersionedDatasetData } from '@solargis/types/dataset';

import { months, yearly} from 'ng-shared/utils/translation.utils';

export class PvElectricityMonthlyDataSource extends DataSource<any> {

  private readonly keys = ['GTI', 'PVOUT_specific', 'PVOUT_total', 'PR'];

  constructor(private readonly data$: Observable<VersionedDatasetData>) {
    super();
  }

  connect(): Observable<any> {
    return this.data$.pipe(
      filter(pvcalc => !!pvcalc && !!pvcalc.annual && !!pvcalc.monthly),
      map(pvcalc => {
        const {
          annual: { data: pvcalcAnnual },
          monthly: { data: pvcalcMonthly }
        } = pvcalc;

        const result = months.map((month, i) => ({
            month,
            monthIndex: i,
            ...(this.keys.reduce((res, key) => (res[key] = pvcalcMonthly?.[key]?.[i], res), {}))
          }));
        result.push({
          month: yearly,
          monthIndex: undefined,
          ...(this.keys.reduce((res, key) => (res[key] = pvcalcAnnual?.[key], res), {}))
        });
        return result;
      })
    );
  }

  disconnect(): void {
    // do nothing
  }

}

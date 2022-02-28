import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnergySystem } from '@solargis/types/project';
import { getPvConfigStatus, PvConfigStatus } from '@solargis/types/pv-config';

export function mapPvConfigStatus() {
  return (source: Observable<EnergySystem>): Observable<PvConfigStatus> => source.pipe(
      map(system => getPvConfigStatus(system && system.pvConfig))
    );
}

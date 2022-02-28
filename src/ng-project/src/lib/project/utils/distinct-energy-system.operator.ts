import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { EnergySystemRef, getEnergySystemId } from '@solargis/types/project';

export function distinctEnergySystemByRef<T extends EnergySystemRef>() {
  return (source: Observable<T>): Observable<T> => source.pipe(
      distinctUntilChanged((ref1, ref2) => getEnergySystemId(ref1) === getEnergySystemId(ref2))
    );
}

import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';

import { DataLayer, dataToggleLayers, transformDataMap } from '@solargis/dataset-core';
import { DataMap } from '@solargis/types/dataset';
import { UnitValueOpts, UnitToggleSettings } from '@solargis/units';

import { getMultiToggleKeys$ } from './unit.utils';

export function resolveUnitValuesMap$<T = DataMap>(
    unitToggle$: Observable<UnitToggleSettings>,
    data: T,
    layers: DataLayer[],
    opts: UnitValueOpts = { noFormat: true }
  ): Observable<T> {

  const dataToggle = dataToggleLayers(layers);
  return getMultiToggleKeys$(dataToggle.toggleUnits, unitToggle$)
    .pipe(
      map(toggleKeys => transformDataMap(toggleKeys, data, dataToggle, opts)),
      publishReplay(1),
      refCount()
    ) as Observable<T>;
}

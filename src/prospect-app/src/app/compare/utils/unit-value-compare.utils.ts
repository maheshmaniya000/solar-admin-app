import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';

import { DataLayer, dataToggleLayers, transformDataMap } from '@solargis/dataset-core';
import { getMultiToggleKeys$ } from '@solargis/ng-unit-value';
import { DataResolution } from '@solargis/types/dataset';
import { UnitToggleSettings, UnitValueOpts } from '@solargis/units';

import { CompareItem } from 'ng-project/project/types/compare.types';

import { CompareDataMap, CompareDataResolvedMap } from '../compare.types';

/**
 * Adjust compare data to units
 *
 * @param store
 * @param data
 * @param layer
 * @param opts
 */
export function resolveCompareUnitValuesMap$(
  unitToggle$: Observable<UnitToggleSettings>,
  compare: CompareItem[],
  data: CompareDataMap,
  layer: DataLayer,
  resolutions: DataResolution[],
  opts: UnitValueOpts = { noFormat: true }
): Observable<CompareDataResolvedMap> {
    const dataToggle = dataToggleLayers([ layer ]);

    return getMultiToggleKeys$(dataToggle.toggleUnits, unitToggle$)
      .pipe(
        map(toggleKeys => compare.map(c => c.energySystemId).reduce((acc, energySystemId) => {
          acc[energySystemId] = resolutions.reduce((energySystemData, resolution) => {
            const resolved = transformDataMap(toggleKeys, data[energySystemId][resolution].data, dataToggle, opts);
            energySystemData[resolution] = resolved && resolved[layer.key];
            return energySystemData;
          }, {});
          return acc;
        }, {} as CompareDataResolvedMap)),
        publishReplay(1),
        refCount()
      );
}

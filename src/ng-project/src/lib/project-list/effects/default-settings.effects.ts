import { Inject, Injectable } from '@angular/core';
import { Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { defer } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Dataset } from '@solargis/dataset-core';

import { SettingsSelectMapDataKeys } from 'ng-shared/core/actions/settings.actions';
import { SelectedSettings } from 'ng-shared/core/types';

import { LTA_DATASET } from '../../project/services/lta-dataset.factory';
import { PVCALC_DATASET } from '../../project/services/pvcalc-dataset.factory';
import { State } from '../reducers';

@Injectable()
export class DefaultSettingsEffects {

  @Effect()
  defaultDataKeys$ = defer(() =>
    this.store.select('settings', 'selected', 'map')).pipe(
      filter((selected: SelectedSettings) =>
        typeof selected.ltaKeys === 'undefined' && typeof selected.pvcalcKeys === 'undefined'),

      map(() => new SettingsSelectMapDataKeys({
        ltaKeys: this.ltaDataset.annual.keys,
        pvcalcKeys: this.pvcalcDataset.annual.keys
      }))
    );

  constructor(private readonly store: Store<State>,
              @Inject(LTA_DATASET) private readonly ltaDataset: Dataset,
              @Inject(PVCALC_DATASET) private readonly pvcalcDataset: Dataset
  ) {}

}

import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';

import { SolargisApp } from '@solargis/types/user-company';

import { OpenUpdateProjectDataDialog } from 'ng-shared/core/actions/dialog.actions';

import { selectSelectedEnergySystemMetadataLatest, selectSelectedEnergySystemRef } from '../project-detail/selectors';
import { State } from '../project/reducers';

export function ensureSelectedEnergySystemHasLatestData(store: Store<State>, app: SolargisApp): Observable<boolean> {
  return combineLatest([
    store.pipe(selectSelectedEnergySystemRef),
    store.select(selectSelectedEnergySystemMetadataLatest(app)).pipe(filter(isLatest => isLatest !== undefined))
  ]).pipe(
    first(),
    tap(([energySystemRef, isLatest]) => {
      if (!isLatest) {
        store.dispatch(new OpenUpdateProjectDataDialog(energySystemRef));
      }
    }),
    map(([, isLatest]) => isLatest)
  );
}

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { UnitToggleService } from '@solargis/ng-unit-value';
import { UnitToggleSettings } from '@solargis/units';

import { SettingsToggles } from '../actions/settings.actions';
import { State } from '../reducers';
import { selectUnitToggle } from '../selectors/settings.selector';

export class UnitToggleNgrxService implements UnitToggleService {

  private readonly unitToggle$: Observable<UnitToggleSettings>;

  constructor(private readonly store: Store<State>) {
    this.unitToggle$ = store.pipe(selectUnitToggle);
  }

  selectUnitToggle(): Observable<UnitToggleSettings> {
    return this.unitToggle$;
  }

  dispatchUnitToggle(togglePayload: [{ settingsKey: string; toggleKey: string }]): void {
    this.store.dispatch(new SettingsToggles(togglePayload));
  }

}

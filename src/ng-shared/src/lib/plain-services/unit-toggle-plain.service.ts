import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { UnitToggleService } from '@solargis/ng-unit-value';
import { UnitToggleSettings } from '@solargis/units';

@Injectable()
export class UnitTogglePlainService implements UnitToggleService {

  private readonly unitToggle$ = new BehaviorSubject<UnitToggleSettings>({});

  selectUnitToggle(): Observable<UnitToggleSettings> {
    return this.unitToggle$;
  }

  dispatchUnitToggle(togglePayload: [{ settingsKey: string; toggleKey: string }]): void {
    const oldToggle = this.unitToggle$.getValue();
    const newToggle = togglePayload.reduce((res, toggle) => {
      res[toggle.settingsKey] = toggle.toggleKey;
      return res;
    }, {} as UnitToggleSettings);
    this.unitToggle$.next({ ...oldToggle, ...newToggle });
  }

}

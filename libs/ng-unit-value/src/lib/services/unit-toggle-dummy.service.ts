import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { UnitToggleSettings } from '@solargis/units';

import { UnitToggleService } from './unit-toggle.service';

@Injectable()
export class UnitToggleDummyService extends UnitToggleService {

  selectUnitToggle(): Observable<UnitToggleSettings> {
    return of({});
  }

  dispatchUnitToggle(togglePayload: [{ settingsKey: string; toggleKey: string }]): void {
    console.log('dummy dispatchUnitToggle', togglePayload);
    // do nothing
  }


}

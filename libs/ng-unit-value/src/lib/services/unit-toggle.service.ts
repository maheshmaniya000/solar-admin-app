import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UnitToggleSettings } from '@solargis/units';

@Injectable()
export abstract class UnitToggleService {

  abstract selectUnitToggle(): Observable<UnitToggleSettings>;

  abstract dispatchUnitToggle(togglePayload: [{ settingsKey: string; toggleKey: string }]): void;

}

import { Inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';

import { Unit, UnitToggleSettings, UnitValueOpts, getToggleKeys, resolveUnitValue } from '@solargis/units';

import { UnitToggleService } from '../services/unit-toggle.service';

@Pipe({ name: 'sgUnitValue', pure: false })
export class UnitValuePipe implements PipeTransform, OnDestroy {

  toggle!: UnitToggleSettings;
  subscription: Subscription;

  constructor(@Inject(UnitToggleService) service: UnitToggleService) {
    this.subscription = service.selectUnitToggle()
      .subscribe(toggleSettings => this.toggle = toggleSettings);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // codelist values are not supported here

  transform(value: any, unit: Unit, opts?: UnitValueOpts): string {
    const toggleKeys = unit.toggle ? getToggleKeys(unit, this.toggle) : undefined;
    return resolveUnitValue(unit, value, toggleKeys, opts);
  }
}

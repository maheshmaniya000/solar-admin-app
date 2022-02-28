import { Component, Inject, OnInit } from '@angular/core';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { resolveUnitValue, toggleKeysCombinations } from '@solargis/units';

import { UnitToggleService } from '../../services/unit-toggle.service';
import { getToggleKeys$ } from '../../utils';
import { UnitValueComponent } from '../unit-value.component';

type ToggleVariant = {
  value: string;
  toggleKeys: string[];
};

@Component({
  selector: 'sg-unit-toggle-value',
  styleUrls: ['./unit-toggle-label.component.scss'],
  templateUrl: './unit-toggle-value.component.html'
})
export class UnitToggleValueComponent extends UnitValueComponent implements OnInit {

  toggleVariants$!: Observable<ToggleVariant[]>;
  currentToggleKeys$!: Observable<string[]>;

  constructor(@Inject(UnitToggleService) protected service: UnitToggleService) {
    super(service);
  }

  ngOnInit(): void {
    if (this.unit.toggle) {
      const combinations = toggleKeysCombinations(this.unit);

      this.toggleVariants$ = this.value$.pipe(
        map(value => combinations.map(toggleKeys => ({
          value: resolveUnitValue(this.unit, value, toggleKeys, this.opts),
          toggleKeys
        })))
      );
      this.currentToggleKeys$ = getToggleKeys$(this.unit, this.service.selectUnitToggle());
    }
  }

  // copy-paste from unit-toggle-label.component.ts
  equalsToggleKeys(toggleKeys: string[], currentToggleKeys: any): boolean {
    return isEqual(toggleKeys, currentToggleKeys);
  }

  // copy-paste from unit-toggle-label.component.ts
  toggleUnit(toggleKeys: string[]): void {
    const togglePayload = this.unit.settingsKeys.map(
      (settingsKey: string, i: number) => ({ settingsKey, toggleKey: toggleKeys[i] })
    );
    this.service.dispatchUnitToggle(togglePayload);
  }

}

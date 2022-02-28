import { Component, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CodelistMap, isCodelistValue } from '@solargis/dataset-core';
import { TranslationDef } from '@solargis/types/translation';
import { resolveUnitValue, Unit } from '@solargis/units';

import { UnitToggleService } from '../services/unit-toggle.service';
import { getToggleKeys$ } from '../utils';

@Component({
  selector: 'sg-unit-value',
  template: `
    <sg-unit-value-inner [codelistValue]="codelistValue" [unitValue]="unitValue$ | async">
    </sg-unit-value-inner>`
})
export class UnitValueComponent implements OnChanges {

  @Input() unit!: Unit;
  @Input() value: any;
  @Input() codelist!: CodelistMap;
  @Input() opts: any;

  value$!: BehaviorSubject<any>;
  codelistValue!: TranslationDef;

  unitValue$!: Observable<string>;

  constructor(@Inject(UnitToggleService) protected service: UnitToggleService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.unit) {
      this.initUnit();
    }
    if (changes.value) {
      const value = changes.value.currentValue;
      if (isCodelistValue(this.codelist, value)) {
        this.codelistValue = this.codelist[value];
      } else {
        this.value$.next(value);
      }
    }
  }

  private initUnit(): void {
    this.value$ = new BehaviorSubject(null);

    if (this.unit.toggle) {
      this.unitValue$ = combineLatest(
        this.value$,
        getToggleKeys$(this.unit, this.service.selectUnitToggle())
      ).pipe(
        map(([value, toggleKeys]) => resolveUnitValue(this.unit, value, toggleKeys, this.opts))
      );
    } else {
      this.unitValue$ = this.value$.pipe(
        map(value => resolveUnitValue(this.unit, value))
      );
    }
  }

}

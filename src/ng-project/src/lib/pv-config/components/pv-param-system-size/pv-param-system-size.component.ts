import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { getToggleKeys$ } from '@solargis/ng-unit-value';
import { PvConfigType, pvInstalledArea, pvInstalledPower, SystemPvConfig, SystemSize } from '@solargis/types/pv-config';
import { installedPowerUnit, resolveUnitValue } from '@solargis/units';

import { State } from 'ng-shared/core/reducers';
import { selectUnitToggle } from 'ng-shared/core/selectors/settings.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

const DEFAULT_CAPACITY = 10;
const DEFAULT_AREA = 1;

@Component({
  selector: 'sg-pv-param-system-size',
  templateUrl: './pv-param-system-size.component.html',
  styleUrls: ['./pv-param-system-size.component.scss']
})
export class PvParamSystemSizeComponent extends SubscriptionAutoCloseComponent implements OnInit {
  MIN = 0;
  MAX_CAPACITY = 100000000;

  @Input() params: SystemSize;
  @Input() pvConfig: SystemPvConfig;
  @Output() onChange: EventEmitter<SystemSize> = new EventEmitter<SystemSize>();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  form: FormGroup;

  type$: BehaviorSubject<'area' | 'capacity'> = new BehaviorSubject<'area' | 'capacity'>(null);

  kWpUnit = installedPowerUnit;
  kwpUnitToggleKeys: string[];

  constructor(private readonly store: Store<State>) {
    super();
  }

  ngOnInit(): void {

    // init unit
    this.addSubscription(
      getToggleKeys$(this.kWpUnit, this.store.pipe(selectUnitToggle)).subscribe(
        keys => (this.kwpUnitToggleKeys = keys)
      )
    );

    // init max values
    if (this.pvConfig.type === PvConfigType.RooftopSmall) {
      this.MAX_CAPACITY = 50;
    } else if (
      [
        PvConfigType.RooftopLargeFlat,
        PvConfigType.RooftopLargeTilted,
        PvConfigType.BuildingIntegrated
      ].includes(this.pvConfig.type)
    ) {
      this.MAX_CAPACITY = 10000;
    } else {
      this.MAX_CAPACITY = 100000000;
    }

    // create form
    this.form = new FormGroup({
      capacity: new FormControl(DEFAULT_CAPACITY, [Validators.required, Validators.min(0)]),
      area: new FormControl(DEFAULT_AREA, [Validators.required, Validators.min(0)])
    });

    // init type
    this.type$.next(this.params.type);

    if (this.params.type === 'capacity') {
      this.form.controls.capacity.setValue(this.params.value);
    } else {
      this.form.controls.area.setValue(this.params.value);
    }
    this.adjustUnselectedValue(this.params);

    // validate too large values
    this.addSubscription(
      combineLatest([this.form.valueChanges, this.type$])
        .pipe(debounceTime(50))
        .subscribe(([change, type]) => {
          const power = type === 'capacity' ? change.capacity : pvInstalledPower(this.pvConfig);

          if (power > this.MAX_CAPACITY || power < 0 || isNaN(power)) {
            this.form.controls[type].setErrors({ largeArea: true });
            this.form.controls[type].markAsTouched();
          } else {
            this.form.setErrors(null);
          }
        })
    );

    // propagate changes
    this.addSubscription(
      combineLatest([this.form.valueChanges, this.type$])
        .pipe(
          // filter(() => this.form.valid),
          debounceTime(20),
          map(([change, type]) => {
            const value = type === 'capacity' ? change.capacity : change.area;
            return {
              ...this.params,
              type,
              value
            } as SystemSize;
          }),
          distinctUntilChanged(isEqual)
        )
        .subscribe(systemSize => {
          this.onChange.next(systemSize);
          this.adjustUnselectedValue(systemSize);
        })
    );

    // disable unselected form field
    this.addSubscription(
      this.type$.pipe(distinctUntilChanged()).subscribe(value => {
        if (value === 'capacity') {
          this.form.controls.area.disable();
          this.form.controls.capacity.enable();
        }
        if (value === 'area') {
          this.form.controls.area.enable();
          this.form.controls.capacity.disable();
        }
      })
    );

    // emit validity
    this.addSubscription(
      this.form.statusChanges.subscribe(change => this.isValid.next(change === 'VALID'))
    );
  }

  adjustUnselectedValue(params: SystemSize): void {
    if (params.type === 'area') {
      this.form.controls.capacity.patchValue(
        parseFloat(pvInstalledPower(this.pvConfig).toFixed(4)),
        { emitEvent: false, onlySelf: true }
      );
    }
    if (params.type === 'capacity') {
      this.form.controls.area.patchValue(
        Math.round(pvInstalledArea(this.pvConfig)),
        { emitEvent: false, onlySelf: true }
      );
    }
  }

  resolveKWpUnitValue(value: number, noFormat = true): number {
    return resolveUnitValue(this.kWpUnit, value, this.kwpUnitToggleKeys, { noFormat });
  }
}

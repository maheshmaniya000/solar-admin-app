import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { combineLatest, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, startWith, filter } from 'rxjs/operators';

import { PvModule, DegradationDefaults, validate } from '@solargis/types/pv-config';
import { PvModuleType } from '@solargis/types/pvlib';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';


@Component({
  selector: 'sg-pv-param-pv-module',
  templateUrl: './pv-param-pv-module.component.html',
  styleUrls: ['./pv-param-pv-module.component.scss']
})
export class PvParamPvModuleComponent extends SubscriptionAutoCloseComponent implements OnInit {
  MIN = 0;
  MAX = 100;

  pvModuleTypes: string[];

  @Input() params: PvModule;
  @Output() onChange = new EventEmitter<PvModule>();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  form: FormGroup;
  customDegradation$ = new BehaviorSubject<boolean>(false);
  subscriptions: Subscription[] = [];

  defaultDegradFirstYear: number;
  defaultDegradNextYear: number;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.pvModuleTypes = [
      PvModuleType.CSI,
      // PvModuleType.ASI,
      // PvModuleType.CDTE,
      // PvModuleType.CIS,
    ];

    this.setDegradationDefaults(this.params.type);

    this.form = new FormGroup({
      firstYear: new FormControl(
        this.params.degradationFirstYear || this.defaultDegradFirstYear, [ Validators.min(this.MIN), Validators.max(this.MAX)]
      ),
      nextYear: new FormControl(
        this.params.degradationNextYear || this.defaultDegradNextYear, [ Validators.min(this.MIN), Validators.max(this.MAX)
      ]),
    });

    const values$ = this.form.valueChanges.pipe(
      filter(() => this.form.valid),
      debounceTime(50),
      startWith(null)
    );

    this.addSubscription(
      combineLatest(this.customDegradation$, values$)
        .subscribe(([customDegradation, ]) => {
          customDegradation ? this.form.enable() : this.form.disable();
          this.propagateDegradation(customDegradation as boolean);
        })
    );

    this.customDegradation$.next(this.params.degradation === 'custom');

    this.addSubscription(
      combineLatest(
        this.form.statusChanges,
        this.customDegradation$
      ).subscribe(([change, customDegrad]) => this.isValid.next((change === 'VALID' && customDegrad) || !customDegrad))
    );
  }

  propagateDegradation(custom: boolean): void {
    if (custom) {
      const firstYear = this.form.controls.firstYear.value;
      const nextYear = this.form.controls.nextYear.value;

      this.onChange.next({
        ...this.params,
        degradation: 'custom',
        degradationFirstYear: validate(firstYear === undefined ? this.defaultDegradFirstYear : firstYear, this.MIN, this.MAX),
        degradationNextYear: validate(nextYear === undefined ? this.defaultDegradNextYear : nextYear, this.MIN, this.MAX),
      });
    } else {
      const params: PvModule = { ...this.params, degradation: 'default' };
      delete params.degradationFirstYear;
      delete params.degradationNextYear;
      this.onChange.next(params);
    }
  }

  setModuleType(type: PvModuleType): void {
    this.onChange.next({ ...this.params, type });
    this.setDegradationDefaults(type);
  }

  setDegradationDefaults(type: PvModuleType): void {
    this.defaultDegradFirstYear = DegradationDefaults[type].degradationFirstYear;
    this.defaultDegradNextYear = DegradationDefaults[type].degradationNextYear;
  }

}

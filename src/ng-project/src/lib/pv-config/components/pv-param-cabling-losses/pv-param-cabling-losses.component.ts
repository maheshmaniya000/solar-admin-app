import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, filter } from 'rxjs/operators';

import { CablingLosses, validate, PvConfig, SystemPvConfig, pvConfigTemplateMap } from '@solargis/types/pv-config';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

@Component({
  selector: 'sg-pv-param-cabling-losses',
  templateUrl: './pv-param-cabling-losses.component.html',
  styleUrls: ['./pv-param-cabling-losses.component.scss']
})
export class PvParamCablingLossesComponent extends SubscriptionAutoCloseComponent implements OnInit {

  MIN = 0;
  MAX = 100;

  @Input() params: CablingLosses;
  @Input() pvConfig: PvConfig;

  @Output() onChange: EventEmitter<CablingLosses> = new EventEmitter<CablingLosses>();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  form: FormGroup;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      /* eslint-disable @typescript-eslint/naming-convention */
      DCCable: new FormControl(this.params.DCCable, [ Validators.min(this.MIN), Validators.max(this.MAX)]),
      DCMismatch: new FormControl(this.params.DCMismatch, [ Validators.min(this.MIN), Validators.max(this.MAX)]),
      ACCable: new FormControl(this.params.ACCable, [ Validators.min(this.MIN), Validators.max(this.MAX)]),
      /* eslint-enable @typescript-eslint/naming-convention */
    });

    this.addSubscription(
      this.form.valueChanges
        .pipe(
          filter(() => this.form.valid),
          debounceTime(50)
        ).subscribe(change => {
          const params: CablingLosses = {
            /* eslint-disable @typescript-eslint/naming-convention */
            DCCable: validate(change.DCCable, this.MIN, this.MAX),
            DCMismatch: validate(change.DCMismatch, this.MIN, this.MAX),
            ACCable: validate(change.ACCable, this.MIN, this.MAX)
            /* eslint-enable @typescript-eslint/naming-convention */
          };
          this.onChange.next(params);
        })
    );

    this.addSubscription(
      this.form.statusChanges.subscribe(change => this.isValid.next(change === 'VALID'))
    );

  }

  setDefault(): void {
    const defaultCabling = (pvConfigTemplateMap[this.pvConfig.type] as SystemPvConfig).cablingLosses;
    this.form.patchValue(defaultCabling);
  }

}

import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, filter } from 'rxjs/operators';

import { PvConfigParam, PvConfigParamType, validate } from '@solargis/types/pv-config';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

@Component({
  selector: 'sg-pv-param-inputs',
  templateUrl: './pv-param-inputs.component.html',
  styleUrls: ['./pv-param-inputs.component.scss']
})
export class PvParamInputsComponent extends SubscriptionAutoCloseComponent implements OnInit {

  @Input() params: PvConfigParam;
  @Input() type: PvConfigParamType;
  @Input() keys: string[];
  @Input() min = 0;
  @Input() max = 100;

  @Output() onChange: EventEmitter<PvConfigParam> = new EventEmitter<PvConfigParam>();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  form: FormGroup;

  constructor() {
    super();
  }

  ngOnInit(): void {
    // build form
    this.form = new FormGroup(this.keys.reduce((res, key) => {
      res[key] = new FormControl(this.params[key], [ Validators.min(this.min), Validators.max(this.max)]);
      return res;
    }, {}));

    // push values
    this.addSubscription(
      this.form.valueChanges
        .pipe(
          filter(() => this.form.valid),
          debounceTime(50)
        ).subscribe(() => {
          const params = this.keys.reduce((res, key) => {
            res[key] = validate(this.form.controls[key].value, this.min, this.max);
            return res;
          }, {}) as PvConfigParam;
          this.onChange.next(params);
        })
    );

    this.addSubscription(
      this.form.statusChanges.subscribe(change => this.isValid.next(change === 'VALID'))
    );
  }

}

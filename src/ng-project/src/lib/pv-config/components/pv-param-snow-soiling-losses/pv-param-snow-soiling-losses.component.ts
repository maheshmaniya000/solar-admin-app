import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { SnowSoilingLosses, validate } from '@solargis/types/pv-config';
import { MonthlyArray } from '@solargis/types/pvlib';
import { range, monthlyAvg } from '@solargis/types/utils';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { months, yearly } from 'ng-shared/utils/translation.utils';


@Component({
  selector: 'sg-pv-param-snow-soiling-losses',
  templateUrl: './pv-param-snow-soiling-losses.component.html',
  styleUrls: ['./pv-param-snow-soiling-losses.component.scss']
})
export class PvParamSnowSoilingLossesComponent extends SubscriptionAutoCloseComponent implements OnInit {
  MIN = 0;
  MAX = 100;

  @Input() params: SnowSoilingLosses;
  @Output() onChange: EventEmitter<SnowSoilingLosses> = new EventEmitter<SnowSoilingLosses>();
  @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  months = months;
  year = yearly;
  snowIds: string[];
  soilingIds: string[];

  useSoilingYearly = false;
  form: FormGroup;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.snowIds = this.params.snow.map((month, i) => 'snow-' + i);
    this.soilingIds = this.params.snow.map((month, i) => 'soiling-' + i);

    const snowMonthlyInputs = this.params.snow.reduce((total, snowMonth, i) => {
      total[this.snowIds[i]] = new FormControl(snowMonth, [ Validators.min(this.MIN), Validators.max(this.MAX)]);
      return total;
    }, {});

    this.useSoilingYearly = !Array.isArray(this.params.soiling);

    let soilingInput: number[];

    if (Array.isArray(this.params.soiling)) {
      soilingInput = this.params.soiling;
    } else {
      soilingInput = range(12).map(() => this.params.soiling as any as number);
    }
    const soilingMonthlyInputs = soilingInput.reduce((total, month, i) => {
      total[this.soilingIds[i]] = new FormControl(
        { value: month, disabled: this.useSoilingYearly}, [ Validators.min(this.MIN), Validators.max(this.MAX)]
      );
      return total;
    }, {});

    this.form = new FormGroup({
      ...snowMonthlyInputs,
      ...soilingMonthlyInputs,
      useSoilingYearly: new FormControl(this.useSoilingYearly, []),
      soilingYearly: new FormControl(
        { value: Math.round(monthlyAvg(this.params.soiling) * 100) / 100, disabled: !this.useSoilingYearly},
        [ Validators.min(this.MIN), Validators.max(this.MAX)]
      )
    });

    this.addSubscription(
      this.form.valueChanges
        .pipe(debounceTime(50))
        .subscribe(change => {
          if (this.useSoilingYearly !== change.useSoilingYearly) {
            if (change.useSoilingYearly) {
              this.form.controls.soilingYearly.enable();
              this.soilingIds.forEach(i => this.form.controls[i].disable());
            } else {
              this.form.controls.soilingYearly.disable();
              this.soilingIds.forEach(i => this.form.controls[i].enable());
            }
          } else {
            const soiling = change.useSoilingYearly ?
              change.soilingYearly :
              this.soilingIds.map(snowId => validate(change[snowId], this.MIN, this.MAX)) as MonthlyArray;

            if (!soiling && soiling !== 0) {return;}
            const params: SnowSoilingLosses = {
              snow: this.snowIds.map(snowId => validate(change[snowId], this.MIN, this.MAX)) as MonthlyArray,
              soiling,
            };
            this.onChange.next(params);
          }
          this.useSoilingYearly = change.useSoilingYearly;
        })
    );

    this.addSubscription(
      this.form.statusChanges.subscribe(change => this.isValid.next(change === 'VALID'))
    );
  }

}

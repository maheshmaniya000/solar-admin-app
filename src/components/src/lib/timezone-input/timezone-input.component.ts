import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit
} from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

import { SelectOption } from '../models/select-option.model';
import { Timezone } from '../models/timezone.model';
import { SgValidators } from '../validators/validators';

@Component({
  selector: 'sg-timezone-input',
  templateUrl: './timezone-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimezoneInputComponent implements OnDestroy, OnInit, OnChanges {
  @Input() form: FormGroup;
  @Input() timezone: Timezone;
  @Input() utcOffset: number;

  readonly timezoneOptions: SelectOption<Timezone>[] = [
    {
      label: 'Local legal time (rounded)',
      value: Timezone.site
    },
    {
      label: 'UTC offset',
      value: Timezone.utc
    }
  ];

  private readonly destroyed$ = new Subject<void>();

  static createControlConfigs(): { timezone: any; utcOffset: any } {
    return {
      timezone: [undefined, [Validators.required]],
      utcOffset: [
        undefined,
        [
          Validators.required,
          SgValidators.integer,
          Validators.min(-12),
          Validators.max(14)
        ]
      ]
    };
  }

  ngOnInit(): void {
    this.subscribeToTimezoneFormControlChanges();
  }

  ngOnChanges(): void {
    this.form.patchValue(
      { timezone: this.timezone, utcOffset: this.utcOffset },
      { emitEvent: false }
    );
    this.updateUtcOffsetFormControl(this.timezone);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  private getTimezoneFormControl(): AbstractControl {
    return this.form.get('timezone');
  }

  private getUtcOffsetFormControl(): AbstractControl {
    return this.form.get('utcOffset');
  }

  private subscribeToTimezoneFormControlChanges(): void {
    this.getTimezoneFormControl()
      .valueChanges.pipe(
        startWith(this.timezone as Timezone),
        takeUntil(this.destroyed$)
      )
      .subscribe(timezone => this.updateUtcOffsetFormControl(timezone));
  }

  private updateUtcOffsetFormControl(timezone: Timezone): void {
    const utcOffsetFormControl = this.getUtcOffsetFormControl();
    if (timezone === Timezone.site) {
      utcOffsetFormControl.setValue(this.utcOffset, { emitEvent: false });
      utcOffsetFormControl.disable({ emitEvent: false });
    } else {
      utcOffsetFormControl.enable({ emitEvent: false });
    }
  }
}

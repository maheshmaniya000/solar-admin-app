import { AfterContentInit, Directive, OnDestroy } from '@angular/core';
import { FormGroupName } from '@angular/forms';
import { isNil } from 'lodash-es';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

// FIXME this has to be removed after the Angular Material team fixes this bug: https://github.com/angular/components/issues/21875
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-date-range-input'
})
export class MatDateRangeValueAndValidityUpdaterDirective
  implements AfterContentInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  constructor(private readonly formGroupName: FormGroupName) {}

  ngAfterContentInit(): void {
    const minFormControl = this.formGroupName.control.get('min');
    const maxFormControl = this.formGroupName.control.get('max');

    if (isNil(minFormControl) || isNil(maxFormControl)) {
      console.warn(`MatDateRangeValueAndValidityUpdaterDirective won't work
      on this date range because the form controls are not named 'min' and 'max'`);
    } else {
      minFormControl.valueChanges
        .pipe(
          distinctUntilChanged(),
          filter(() => maxFormControl.touched),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => {
          maxFormControl.updateValueAndValidity();
        });

      maxFormControl.valueChanges
        .pipe(
          distinctUntilChanged(),
          filter(() => minFormControl.touched),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => minFormControl.updateValueAndValidity());
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }
}

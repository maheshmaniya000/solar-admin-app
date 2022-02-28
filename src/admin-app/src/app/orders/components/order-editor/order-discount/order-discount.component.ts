import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isNil } from 'lodash-es';
import { startWith } from 'rxjs/operators';

import { Discount } from '@solargis/types/customer';

import { SgValidators } from 'components/validators/validators';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

@Component({
  selector: 'sg-admin-order-discount',
  templateUrl: './order-discount.component.html',
  styleUrls: ['./order-discount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDiscountComponent extends SubscriptionAutoCloseComponent implements OnInit {
  @Input() header?: string;
  @Input() currency: string;
  @Input() parentForm: FormGroup;

  static createFormGroup(): FormGroup {
    return new FormBuilder().group({
      amount: [undefined, [SgValidators.maxDecimals(2)]],
      percent: [undefined, [Validators.min(0), Validators.max(100), SgValidators.maxDecimals(2)]]
    });
  }

  ngOnInit(): void {
    this.addSubscription(
      this.parentForm.valueChanges.pipe(startWith(this.parentForm.value as Discount)).subscribe(() => this.enableOrDisableControls())
    );
  }

  enableOrDisableControls(): void {
    this.getAmountFormControl().enable({ emitEvent: false });
    this.getPercentFormControl().enable({ emitEvent: false });
    if (!isNil(this.getAmountFormControl().value)) {
      this.getPercentFormControl().disable({ emitEvent: false });
    }
    if (!isNil(this.getPercentFormControl().value)) {
      this.getAmountFormControl().disable({ emitEvent: false });
    }
  }

  private getAmountFormControl(): AbstractControl {
    return this.parentForm.get('amount');
  }

  private getPercentFormControl(): AbstractControl {
    return this.parentForm.get('percent');
  }
}

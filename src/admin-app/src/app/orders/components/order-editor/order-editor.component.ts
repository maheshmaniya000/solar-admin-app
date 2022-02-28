import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { isNil } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, first, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { Order } from '@solargis/types/customer';

import { SgValidators } from 'components/validators/validators';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { CompanySnapshotEditorComponent } from '../../../shared/components/company-snapshot-editor/company-snapshot-editor.component';
import { OrderDetailStore } from '../../services/order-detail.store';
import { OrderDiscountComponent } from './order-discount/order-discount.component';

@Component({
  selector: 'sg-admin-order-editor',
  templateUrl: './order-editor.component.html',
  styleUrls: ['./order-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderEditorComponent extends SubscriptionAutoCloseComponent implements OnInit {
  formGroup: FormGroup;

  constructor(readonly orderDetailStore: OrderDetailStore) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.addSubscription(
      this.orderDetailStore.entity$.subscribe(order => {
        this.formGroup.reset(order);
        if (isNil(order.sgOrderId)) {
          this.getCompanyFormGroup().disable({ emitEvent: false });
        }
      })
    );
    this.addSubscription(this.orderDetailStore.company$.subscribe(() => this.getSgCompanyIdFormControl().updateValueAndValidity()));
    this.orderDetailStore.setValid(this.formGroup.statusChanges.pipe(map(status => status === 'VALID')));
    this.addSubscription(this.formGroup.valueChanges.subscribe(() => this.orderDetailStore.setUnsavedEntity(this.getFormValue())));
  }

  getSgCompanyIdFormControl(): AbstractControl {
    return this.formGroup.get('sgCompanyId');
  }

  getDiscountFormGroup(): FormGroup {
    return this.formGroup.get('discount') as FormGroup;
  }

  getOrderItemsFormArray(): FormArray {
    return this.formGroup.get('orderItems') as FormArray;
  }

  getContactsFormArray(): FormArray {
    return this.formGroup.get('contacts') as FormArray;
  }

  getCompanyFormGroup(): FormGroup {
    return this.formGroup.get('company') as FormGroup;
  }

  getCurrencyFormControl(): AbstractControl {
    return this.formGroup.get('currency');
  }

  private companyValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> =>
      control.valueChanges.pipe(
        distinctUntilChanged(),
        withLatestFrom(this.orderDetailStore.company$),
        switchMap(([, company]) => this.orderDetailStore.isCompanyValid(company)),
        first()
      );
  }

  private createForm(): void {
    const fb = new FormBuilder();
    const companyValidatorActive$ = this.orderDetailStore.viewModel$.pipe(map(viewModel => !viewModel.saved));
    this.formGroup = fb.group({
      VAT: [undefined, [Validators.min(0), Validators.max(100)]],
      sgCompanyId: [
        undefined,
        [Validators.required],
        [SgValidators.asyncConditionalValidator(this.companyValidator(), companyValidatorActive$)]
      ],
      company: fb.group(CompanySnapshotEditorComponent.createControlConfigs()),
      currency: [undefined, [Validators.required]],
      basePrice: [{ value: undefined, disabled: true }, [Validators.required]],
      quantity: [{ value: undefined, disabled: true }, [Validators.required]],
      discount: OrderDiscountComponent.createFormGroup(),
      orderItems: fb.array([]),
      contacts: fb.array([], { validators: Validators.required }),
      orderTitle: [undefined, []],
      orderTitleSK: [undefined, []],
      purchaseOrderNo: [undefined, []],
      freeText: [undefined, []],
      contractNo: [undefined, []],
      note: [undefined, []],
      phone: [undefined, []],
      originSystem: [undefined, [Validators.required]]
    });
  }

  private getFormValue(): Partial<Order> {
    const result = this.formGroup.value as Partial<Order>;
    result.company = CompanySnapshotEditorComponent.getFormValue(this.getCompanyFormGroup());
    return result;
  }
}

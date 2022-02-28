import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { isEmpty, isEqual, isNil }from 'lodash-es';
import { distinctUntilChanged, first, pairwise } from 'rxjs/operators';

import { User } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { ContactsEditorComponent } from '../../../../shared/components/contacts-editor/contacts-editor.component';
import { OrderDetailStore } from '../../../services/order-detail.store';

@Component({
  selector: 'sg-admin-order-contacts',
  templateUrl: './order-contacts.component.html',
  styleUrls: ['./order-contacts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderContactsComponent extends SubscriptionAutoCloseComponent implements OnInit {
  @Input() formArray: FormArray;
  @ViewChild('contactSelect') contactSelect: MatSelect;
  companyUserFormControl = new FormControl();

  constructor(readonly orderDetailStore: OrderDetailStore) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(this.orderDetailStore.entity$.pipe(first()).subscribe(order =>
      order.contacts.forEach(contact => {
        const contactFormGroup = this.createContactFormGroup();
        this.formArray.push(contactFormGroup);
        contactFormGroup.patchValue(contact);
      })
    ));
    this.addSubscription(this.orderDetailStore.viewModel$.subscribe(viewModel =>
      viewModel.contactSelectEnabled ? this.companyUserFormControl.enable() : this.companyUserFormControl.disable()
    ));
    this.addSubscription(this.orderDetailStore.availablePhones$.pipe(distinctUntilChanged(isEqual)).subscribe(availablePhones => {
      const orderPhone = this.getPhoneFormControl().value;
      if (!isEmpty(orderPhone) && !availablePhones.map(phoneOption => phoneOption.value).includes(orderPhone)) {
        this.getPhoneFormControl().reset();
      }
    }));
  }

  getParentFormGroup(): FormGroup {
    return this.formArray.parent as FormGroup;
  }

  getPhoneFormControl(): AbstractControl {
    return this.getParentFormGroup().get('phone');
  }

  onAddContactButtonClick(): void {
    this.formArray.push(this.createContactFormGroup());
  }

  onCompanyContactOrUserSelected($event: MatSelectChange): void {
    const formGroup = this.createContactFormGroup();
    this.formArray.push(formGroup);
    formGroup.reset($event.value);
    this.companyUserFormControl.reset();
    this.contactSelect.options.forEach(option => option.deselect());
  }

  isCompanyUserPhoneSelectable(companyUser: User): boolean {
    return !isNil(companyUser.phone) && this.formArray.value.map(u => u.email).includes(companyUser.email);
  }

  private createContactFormGroup(): FormGroup {
    const formGroup = ContactsEditorComponent.createFormGroup();
    formGroup
      .get('phone')
      .valueChanges.pipe(pairwise())
      .subscribe(([previousPhone, newPhone]) => {
        if (this.getPhoneFormControl().value === previousPhone) {
          this.getPhoneFormControl().setValue(newPhone);
        }
      });
    return formGroup;
  }
}

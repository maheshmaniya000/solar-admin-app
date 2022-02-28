import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Company, UserCompanyRole, UserCompanyStatus } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { companyRefToString } from 'ng-shared/shared/utils/company.utils';

import { Users } from '../../constants/users.constants';
import { UserViewStore } from '../user-view/user-view.store';

interface AssignToCompanyForm {
  company: Company;
  role: UserCompanyRole;
  status: UserCompanyStatus;
}

@Component({
  selector: 'sg-admin-user-assign-to-company',
  styleUrls: ['./user-assign-to-company.component.scss'],
  templateUrl: './user-assign-to-company.component.html'
})
export class UserAssignToCompanyComponent extends SubscriptionAutoCloseComponent implements OnInit {
  private static readonly defaultFormValue: AssignToCompanyForm = {
    company: null,
    role: 'USER',
    status: 'ACTIVE'
  };
  readonly roles = Users.roles;
  readonly statuses = Users.statuses;
  readonly companyRefToString = companyRefToString;

  form: FormGroup;

  constructor(readonly userViewStore: UserViewStore) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.addSubscription(
      this.userViewStore.assignToCompanySuccess$.subscribe(() => this.form.reset(UserAssignToCompanyComponent.defaultFormValue))
    );
  }

  onAssignButtonClick(): void {
    const formValue = this.getFormValue();
    this.userViewStore.assignToCompany({
      ...formValue,
      sgCompanyId: formValue.company.sgCompanyId
    });
  }

  private createForm(): void {
    const fb = new FormBuilder();
    this.form = fb.group({
      company: [undefined, { validators: [Validators.required]}],
      role: undefined,
      status: undefined
    });
    this.form.patchValue(UserAssignToCompanyComponent.defaultFormValue);
  }

  private getFormValue(): AssignToCompanyForm {
    return this.form.value;
  }
}

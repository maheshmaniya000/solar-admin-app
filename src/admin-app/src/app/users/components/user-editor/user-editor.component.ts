import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

import { User } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { firstNameOrLastNameValidator } from 'ng-shared/user/utils/firstname-or-lastname.validator';

import { UserDetailStore } from '../../services/user-detail.store';

@Component({
  selector: 'sg-admin-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})
export class UserEditorComponent extends SubscriptionAutoCloseComponent implements OnChanges, OnInit {
  @Input() user: User;

  form: FormGroup;

  constructor(readonly userDetailStore: UserDetailStore) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.userDetailStore.setValid(this.form.statusChanges.pipe(map(status => status === 'VALID')));
    this.patchForm();
    this.addSubscription(this.form.valueChanges.subscribe(() => this.userDetailStore.setUnsavedEntity(this.form.value)));
  }

  ngOnChanges(): void {
    this.patchForm();
  }

  private createForm(): void {
    this.form = new FormBuilder().group(
      {
        email: [{ value: undefined, disabled: true }, { validators: [Validators.required, Validators.email] }],
        salutation: undefined,
        firstName: undefined,
        lastName: undefined,
        middleName: undefined,
        position: undefined,
        phone: undefined
      },
      {
        validators: [firstNameOrLastNameValidator('firstName', 'lastName')]
      }
    );
  }

  private patchForm(): void {
    this.form?.reset(this.user);
    this.userDetailStore.setUnsavedEntity(this.user);
  }
}

import { Component, Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ErrorMessageConfigs } from 'components/form-error/append-form-error/models/error-message-configs.model';
import { firstNameOrLastNameValidator } from 'ng-shared/user/utils/firstname-or-lastname.validator';

@Component({
  selector: 'sg-admin-contacts-editor',
  templateUrl: './contacts-editor.component.html',
  styleUrls: ['./contacts-editor.component.scss']
})
export class ContactsEditorComponent {
  readonly emailCustomErrors: ErrorMessageConfigs = {
    email: { priority: 60, translationKey: 'Email has wrong format' }
  };
  @Input() formArray: FormArray;

  static createFormGroup(): FormGroup {
    return new FormBuilder().group(
      {
        firstName: [undefined, []],
        middleName: [null, []],
        lastName: [undefined, []],
        email: [null, [Validators.required, Validators.email]],
        phone: [null, []]
      },
      {
        validators: firstNameOrLastNameValidator('firstName', 'lastName')
      }
    );
  }

  getParentFormGroup(): FormGroup {
    return this.formArray.parent as FormGroup;
  }

  getContactFormGroup(index: number): FormGroup {
    return this.formArray.at(index) as FormGroup;
  }

  getEmailFormControl(index: number): AbstractControl {
    return this.getContactFormGroup(index).get('email');
  }

  onRemoveButtonClick(index: number): void {
    this.formArray.removeAt(index);
  }
}

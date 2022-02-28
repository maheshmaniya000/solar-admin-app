import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { firstNameOrLastNameValidator } from 'ng-shared/user/utils/firstname-or-lastname.validator';

import { Config } from '../../../config';
import { SubscriptionAutoCloseComponent} from '../../../shared/components/subscription-auto-close.component';
import { RegistrationForm } from '../../../user/types';
import { emailValidator } from '../../utils/email.validator';
import { checkIfMatchingPasswords } from '../../utils/password.validator';


@Component({
  selector: 'sg-registration-dialog-form',
  templateUrl: './registration-dialog-form.component.html',
  styleUrls: ['./registration-dialog-form.component.scss']
})
export class RegistrationDialogFormComponent extends SubscriptionAutoCloseComponent implements OnInit {
  form: FormGroup;

  @Input() email: string;
  @Input() emailHidden = false;
  @Input() companyHidden = false;

  @Output() output: EventEmitter<RegistrationForm> = new EventEmitter();

  get firstName(): AbstractControl { return this.form.get('firstName'); }
  get lastName(): AbstractControl { return this.form.get('lastName'); }
  get password(): AbstractControl { return this.form.get('password'); }
  get passwordConfirm(): AbstractControl { return this.form.get('passwordConfirm'); }

  constructor(private readonly fb: FormBuilder, private readonly config: Config) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', []],
      lastName: ['', []],
      email: [this.email, [ Validators.required, emailValidator ]],
      companyName: [undefined, [ Validators.required ]],
      password: [undefined, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.config.auth0.passwordMatchRegexp)
      ]],
      passwordConfirm: [undefined, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.config.auth0.passwordMatchRegexp)
      ]]
    }, {
      validator: [checkIfMatchingPasswords('password', 'passwordConfirm'), firstNameOrLastNameValidator('firstName', 'lastName')]
    });

    if (this.emailHidden) {
      this.form.get('email').disable();
    }

    if (this.companyHidden) {
      this.form.get('companyName').disable();
      this.form.get('companyName').clearValidators();
    }

    this.addSubscription(
      this.form.valueChanges.subscribe((form: RegistrationForm) => {
        this.output.emit(this.form.valid ? form : null);
      })
    );
  }

  /**
   * When user changes password, validation of form is not triggered (user needs to changes 'confirm password').
   * This fix problem.
   */
  forcePasswordValidation(): void {
    this.form.get('passwordConfirm').updateValueAndValidity();
  }
}

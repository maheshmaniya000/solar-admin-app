import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';

@Component({
  selector: 'sg-otp-form-step',
  templateUrl: './otp-form-step.component.html',
})
export class OtpFormStepComponent extends SubscriptionAutoCloseComponent implements OnInit {
  form: FormGroup;

  @Input() callingCode: string;
  @Input() phone: string;

  @Output() otpChange: EventEmitter<string> = new EventEmitter();
  @Output() sendAgainClick: EventEmitter<void> = new EventEmitter();

  get otpField(): AbstractControl | null { return this.form.get('otp'); }

  constructor(private readonly fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      otp: [undefined, []],
    });

    this.addSubscription(
      this.otpField.valueChanges.subscribe(val => this.otpChange.emit(val))
    );
  }
}

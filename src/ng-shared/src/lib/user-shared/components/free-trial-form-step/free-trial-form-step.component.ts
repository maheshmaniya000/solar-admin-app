import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { CaptchaResult } from '@solargis/types/captcha';
import { TranslationDef } from '@solargis/types/translation';
import { Country } from '@solargis/types/user-company';

import { CaptchaComponent } from '../../../captcha/captcha/captcha.component';
import { SubscriptionAutoCloseComponent } from '../../../shared/components/subscription-auto-close.component';
import { CompanyService } from '../../../user/services/company.service';
import { phoneCodeValidator } from '../../../user/utils/phone.validator';
import { FreeTrialForm } from '../../types';
import { parsePhone } from '../../user-shared.utils';

@Component({
  selector: 'sg-free-trial-form-step',
  templateUrl: './free-trial-form-step.component.html',
})
export class FreeTrialFormStepComponent extends SubscriptionAutoCloseComponent implements OnInit {
  form: FormGroup;
  otpCaptcha: CaptchaResult;

  @Input() displayTitle = false;
  @Input() phoneCode: string | Country;
  @Input() phone: string;

  @Output() output: EventEmitter<FreeTrialForm> = new EventEmitter();
  @Output() otpError: EventEmitter<TranslationDef> = new EventEmitter();
  @Output() captchaChange: EventEmitter<CaptchaResult> = new EventEmitter();

  @ViewChild('otpCaptcha') otpCaptchaComponent: CaptchaComponent;

  get phoneCodeField(): AbstractControl | null { return this.form.get('phoneCode'); }
  get phoneField(): AbstractControl | null { return this.form.get('phone'); }

  constructor(private readonly fb: FormBuilder, private readonly companyService: CompanyService) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      phoneCode: [this.phoneCode || null, [Validators.required, phoneCodeValidator]],
      phone: [this.phone || null, [Validators.required]],
    });

    this.addSubscription(
      this.form.valueChanges.subscribe(values => {
        if (this.form.invalid) {this.output.emit(null);}
        else {this.output.emit(values);}
      })
    );
  }

  generateOTP(): void {
    const phone = this.phoneField.value;
    const phoneCode = this.phoneCodeField.value;

    if (phoneCode && phoneCode.callingCode) {
      const p = parsePhone(phoneCode, phone);
      this.companyService.generateOTP(p, this.otpCaptcha).pipe(first()).subscribe(
        result => {
          if (result) {return this.output.emit({ ...this.form.value, result });}
          return undefined;
        },
        () => {
          this.resetOTPCaptcha();
          this.otpError.emit({
            translate: 'user.company.freeTrial.phoneInvalid'
          });
        }
      );
    } else {
      this.otpError.emit({ translate: 'user.company.phoneCodeIsString' });
    }
  }

  handleOTPCaptcha(captcha: CaptchaResult): void {
    this.otpCaptcha = captcha;
    this.captchaChange.emit(this.otpCaptcha);
  }

  resetOTPCaptcha(): void {
    this.otpCaptcha = null;
    this.captchaChange.emit(this.otpCaptcha);
    this.otpCaptchaComponent.reset();
  }
}

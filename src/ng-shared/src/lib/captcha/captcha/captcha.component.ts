import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { CaptchaResult } from '@solargis/types/captcha';

import { State } from 'ng-shared/core/reducers';
import { selectIPGeolocationCountry } from 'ng-shared/core/selectors/settings.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { LambdaCaptchaComponent } from '../lambda-captcha/lambda-captcha.component';
import { ReCaptchaComponent } from '../re-captcha/re-captcha.component';


@Component({
  selector: 'sg-captcha',
  templateUrl: 'captcha.component.html',
})
export class CaptchaComponent extends SubscriptionAutoCloseComponent implements OnInit {
  @Input() action: string;
  @Output() onSuccess = new EventEmitter<CaptchaResult>();

  @ViewChild(LambdaCaptchaComponent) private readonly lambdaCaptchaComponent: LambdaCaptchaComponent;
  @ViewChild(ReCaptchaComponent) private readonly recaptchaComponent: ReCaptchaComponent;

  type: 'lambdaCaptcha' | 'recaptcha';

  constructor(
    private readonly store: Store<State>
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscription(
      this.store.pipe(selectIPGeolocationCountry).subscribe(countryCode => {
        if (countryCode?.toLowerCase() === 'cn') {
          this.type = 'lambdaCaptcha';
        } else {
          this.type = 'recaptcha';
        }
      })
    );
  }

  reset(): void {
    if (this.type === 'lambdaCaptcha') {
      this.lambdaCaptchaComponent.reset();
    } else {
      this.recaptchaComponent.reset();
    }
  }

  resetInvisible(): Promise<any> {
    if (this.type === 'lambdaCaptcha') {
      return Promise.resolve('');
    } else {
      return this.recaptchaComponent.reset();
    }
  }

  handleResult(result: any): void {
    if (this.type === 'lambdaCaptcha') {
      this.onSuccess.emit({
        ...result,
        captchaType: this.type
      });
    } else {
      this.onSuccess.emit({
        captchaType: this.type,
        recaptchaCheck: result,
      });
    }
  }

}

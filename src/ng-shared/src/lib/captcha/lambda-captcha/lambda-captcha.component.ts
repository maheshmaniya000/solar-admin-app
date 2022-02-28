import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { LambdaCaptchaResult } from '@solargis/types/captcha';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { LambdaCaptchaService } from './lambda-captcha.service';


@Component({
  selector: 'sg-lambda-captcha',
  templateUrl: 'lambda-captcha.component.html',
  styles: ['button { margin-top: 14px }', '.loading { padding: 16px 0 }'],
})
export class LambdaCaptchaComponent extends SubscriptionAutoCloseComponent implements OnInit {
  @Output() lambdaCaptchaResult: EventEmitter<Partial<LambdaCaptchaResult>> = new EventEmitter();

  form: FormGroup;
  svg: SafeHtml;
  encryptedExpr: string;

  constructor(private readonly service: LambdaCaptchaService, private readonly fb: FormBuilder, private readonly sanitizer: DomSanitizer) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      captchaInput: [null, [Validators.required]]
    });

    this.getCaptchaObj();

    this.addSubscription(
      this.form.valueChanges.subscribe(values => {
        if (this.form.invalid) {this.lambdaCaptchaResult.emit(null);}
        else {this.lambdaCaptchaResult.emit({ encryptedExpr: this.encryptedExpr, solution: values.captchaInput });}
      })
    );
  }

  reset(): void {
    this.svg = null;
    this.getCaptchaObj();
    this.form.setValue({ captchaInput: null });
  }

  private getCaptchaObj(): void{
    this.addSubscription(
      this.service.create().subscribe(captchaObj => {
        this.svg = this.sanitizer.bypassSecurityTrustHtml(captchaObj.svg);
        this.encryptedExpr = captchaObj.encryptedExpr;
      })
    );
  }

}

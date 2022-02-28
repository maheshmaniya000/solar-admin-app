import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@ngneat/transloco';

import { CaptchaComponent } from './captcha/captcha.component';
import { LambdaCaptchaComponent } from './lambda-captcha/lambda-captcha.component';
import { LambdaCaptchaService } from './lambda-captcha/lambda-captcha.service';
import { ReCaptchaComponent } from './re-captcha/re-captcha.component';
import { RECAPTCHA_SERVICE_PROVIDER } from './re-captcha/re-captcha.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FlexModule,
    TranslocoModule
  ],
  declarations: [
    ReCaptchaComponent,
    LambdaCaptchaComponent,
    CaptchaComponent
  ],
  exports: [ ReCaptchaComponent, LambdaCaptchaComponent, CaptchaComponent ],
  providers: [ RECAPTCHA_SERVICE_PROVIDER, LambdaCaptchaService ]
})
export class CaptchaModule {}

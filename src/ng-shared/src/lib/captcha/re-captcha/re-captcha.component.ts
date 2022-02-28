import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { Config } from '../../config';
import { ReCaptchaService } from './re-captcha.service';

@Component({
  selector: 'sg-re-captcha',
  template: '<div #target></div>',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // eslint-disable-next-line no-use-before-define
      useExisting: forwardRef(() => ReCaptchaComponent),
      multi: true
    }
  ]
})
export class ReCaptchaComponent implements OnInit, ControlValueAccessor {
  @Input() action: string = null;

  @Output() captchaResponse = new EventEmitter<string>();
  @Output() captchaExpired = new EventEmitter();

  @ViewChild('target', { static: true }) targetRef: ElementRef;

  siteKey: string = null;

  constructor(
    private readonly captchaService: ReCaptchaService,
    private readonly config: Config
  ) {
    this.siteKey = this.config.recaptcha.publicKey;
  }

  onChange: any = () => {
    // TODO
  };

  onTouched: any = () => {
    // TODO
  };

  ngOnInit(): void {
    this.captchaService.getReady(this.siteKey)
      .subscribe(ready => {
        if (!ready) { return; }
        this.execute();
      });
  }

  private execute(): Promise<any> {
    return (window as any).grecaptcha?.execute(this.siteKey, { action: this.action })
      .then(token => {
        this.recaptchaCallback(token);
      }, () => {
        this.recaptchaExpiredCallback();
      });
  }

  reset(): Promise<any> {
    this.onChange(null);
    return this.execute();
  }

  writeValue(): void {
    /* ignore it */
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private recaptchaCallback(response: string): void {
    this.onChange(response);
    this.onTouched();
    this.captchaResponse.emit(response);
  }

  private recaptchaExpiredCallback(): void {
    this.onChange(null);
    this.onTouched();
    this.captchaExpired.emit();
  }
}

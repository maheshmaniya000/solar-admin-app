import { Injectable, NgZone, Optional, SkipSelf } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/*
 * Common service shared by all reCaptcha component instances
 * through dependency injection.
 * This service has the task of loading the reCaptcha API once for all.
 * Only the first instance of the component creates the service, subsequent
 * components will use the existing instance.
 *
 * As the language is passed to the <script>, the first component
 * determines the language of all subsequent components. This is a limitation
 * of the present Google API.
 */
@Injectable()
export class ReCaptchaService {

  private scriptLoaded = false;
  private readonly readySubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(zone: NgZone) {
    /* the callback needs to exist before the API is loaded */
    if (typeof window !== 'undefined') {
      (window as any).reCaptchaOnloadCallback = (() => zone.run(this.onloadCallback.bind(this)));
    }
  }

  getReady(key: string): Observable<boolean> {
    if (!this.scriptLoaded && key) {
      this.scriptLoaded = true;
      const doc = document.body;
      const script = document.createElement('script');
      script.innerHTML = '';
      script.src = `https://www.google.com/recaptcha/api.js?onload=reCaptchaOnloadCallback&render=${key}`;
      script.async = true;
      script.defer = true;
      doc.appendChild(script);
    }
    return this.readySubject.asObservable();
  }

  private onloadCallback(): void {
    this.readySubject.next(true);
  }
}

/* singleton pattern taken from https://github.com/angular/angular/issues/13854 */
export function RECAPTCHA_SERVICE_PROVIDER_FACTORY(ngZone: NgZone, parentDispatcher: ReCaptchaService): ReCaptchaService {
  return parentDispatcher || new ReCaptchaService(ngZone);
}

export const RECAPTCHA_SERVICE_PROVIDER = {
  provide: ReCaptchaService,
  deps: [NgZone, [new Optional(), new SkipSelf(), ReCaptchaService]],
  useFactory: RECAPTCHA_SERVICE_PROVIDER_FACTORY
};

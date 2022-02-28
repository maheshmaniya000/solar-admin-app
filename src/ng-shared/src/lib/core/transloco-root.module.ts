import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgModule } from '@angular/core';
import {
  Translation,
  translocoConfig,
  TranslocoLoader,
  TranslocoModule,
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
  TRANSLOCO_MISSING_HANDLER
} from '@ngneat/transloco';
import { TranslocoMessageFormatModule } from '@ngneat/transloco-messageformat';
import { Observable } from 'rxjs';

import { DefaultTextTranslocoMissingHandler } from '@solargis/ng-translation';

import { availableLanguages } from 'ng-shared/core/models';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private readonly http: HttpClient, @Inject(APP_BASE_HREF) private readonly baseHref: string) {}

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`${this.baseHref}/assets/i18n/${lang}.json`);
  }
}

declare let process: any;

@NgModule({
  imports: [
    TranslocoMessageFormatModule.init()
  ],
  exports: [ TranslocoModule ],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: availableLanguages.map(({ lang }) => lang),
        defaultLang: 'en',
        fallbackLang: 'en',
        missingHandler: { logMissingKey: true, allowEmpty: false, useFallbackTranslation: true },
        reRenderOnLangChange: true,
        prodMode: process.env.NODE_ENV === 'production',
      })
    },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader },
    { provide: TRANSLOCO_MISSING_HANDLER, useClass: DefaultTextTranslocoMissingHandler }
  ]
})
export class TranslocoRootModule {}

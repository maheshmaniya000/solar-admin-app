import { APP_BASE_HREF } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, Inject, NgModule } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NoPreloading, Router, RouterModule } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';

import { analyticsFactory, AnalyticsService } from '@solargis/ng-analytics';
import { GEOCODER_CONFIG_TOKEN, GeosearchModule } from '@solargis/ng-geosearch';

import { Config } from 'ng-shared/config';
import { geocoderConfigFactory } from 'ng-shared/core/core.module';
import { appBaseHrefFactory, windowFactory } from 'ng-shared/core/factories';
import { DateTimeFormatService } from 'ng-shared/core/services/date-time-format.service';
import { GlobalErrorHandler } from 'ng-shared/core/services/global.error-handler';
import { APP_TOKEN } from 'ng-shared/core/tokens';
import { TranslocoRootModule } from 'ng-shared/core/transloco-root.module';
import { DateTimeFormatPlainService } from 'ng-shared/plain-services/date-time-format-plain.service';
import { reportAssetsUrlFactory, REPORT_ASSETS_URL } from 'ng-shared/report-map/services/report-assets-url.factory';

import { PrintAppComponent } from './print/containers/print-app.component';

// entry point into Angular bootstrap
@NgModule({
  bootstrap: [ PrintAppComponent ],
  declarations: [ PrintAppComponent ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: '', loadChildren: () => import('./prospect-cover/prospect-cover.module').then(m => m.ProspectCoverModule) }
    ], {
      preloadingStrategy: NoPreloading,
      useHash: false,
      relativeLinkResolution: 'legacy'
    }),
    HttpClientModule,
    HttpClientJsonpModule,
    TranslocoRootModule,
    GeosearchModule.forRoot({
      provide: GEOCODER_CONFIG_TOKEN,
      useFactory: geocoderConfigFactory,
      deps: [Config, TranslocoService]
    }),
  ],
  providers: [
    // App config and bootstrap
    { provide: APP_BASE_HREF, useFactory: appBaseHrefFactory, deps: [APP_TOKEN] },
    { provide: APP_TOKEN, useValue: 'print' },
    { provide: REPORT_ASSETS_URL, useFactory: reportAssetsUrlFactory, deps: [Config] },
    // solargis services
    { provide: AnalyticsService, useFactory: analyticsFactory, deps: [Config, Router, 'Window'] },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: DateTimeFormatService, useClass: DateTimeFormatPlainService },
    // other
    { provide: 'Window', useFactory: windowFactory }
  ]
})
export class PrintAppModule {

  constructor(
    @Inject(APP_BASE_HREF) baseHref: string,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIconSetInNamespace(
      'sg',
      sanitizer.bypassSecurityTrustResourceUrl(baseHref + 'assets/img/solargis-icons.svg')
    );
  }

}

import { APP_BASE_HREF } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule, HTTP_INTERCEPTORS }  from '@angular/common/http';
import { APP_BOOTSTRAP_LISTENER, ErrorHandler, Inject, NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouteReuseStrategy, UrlSerializer } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer } from '@ngrx/router-store';
import { Store } from '@ngrx/store';

import { analyticsFactory, AnalyticsService } from '@solargis/ng-analytics';
import { GEOCODER_CONFIG_TOKEN, GeocoderConfig, GeosearchModule } from '@solargis/ng-geosearch';
import { UnitToggleService, UnitValuePipe } from '@solargis/ng-unit-value';

import { TranslocoRootModule } from 'ng-shared/core/transloco-root.module';
import { UserSharedModule } from 'ng-shared/user-shared/user-shared.module';

import { Config } from '../config';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { CustomReuseStrategy } from '../utils/router/custom.reuse-stragegy';
import { CustomRouterStateSerializer } from '../utils/router/custom.router-state.serializer';
import { CustomUrlSerializer } from '../utils/router/custom.url-serializer';
import { AfterBootstrap } from './actions/bootstrap.action';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { AcceptCookiesComponent } from './components/cookies/accept-cookies.component';
import { HeaderComponent } from './components/header/header.component';
import { MobileMenuComponent } from './components/mobile-menu/mobile-menu.component';
import { AppComponent } from './containers/app.component';
import { ContentLockedDialogComponent } from './dialogs/content-locked-dialog/content-locked-dialog.component';
import { AmplitudeEffects } from './effects/amplitude.effects';
import { ConfigEffects } from './effects/config.effects';
import { DialogEffects } from './effects/dialog.effects';
import { LayoutEffects } from './effects/layout.effects';
import { RouteEffects } from './effects/route.effects';
import { RouteDataEffects } from './effects/router-data.effects';
import { SettingsEffects } from './effects/settings.effects';
import { TranslateEffects } from './effects/translate.effects';
import { UrlParamsEffects } from './effects/url-params.effects';
import { appBaseHrefFactory, windowFactory } from './factories';
import { CompanyTokenInterceptor } from './interceptors/company-token.interceptor';
import { IdTokenInterceptor } from './interceptors/id-token.interceptor';
import { UrlEncodeInterceptor } from './interceptors/urlencode.interceptor';
import { getReducers } from './reducers';
import { DateTimeFormatNgrxService } from './services/date-time-format-ngrx.service';
import { DateTimeFormatService } from './services/date-time-format.service';
import { GeolocatorService } from './services/geolocator.service';
import { GlobalErrorHandler } from './services/global.error-handler';
import { SgPaginatorIntl } from './services/sg-paginator-intl';
import { UnitToggleNgrxService } from './services/unit-toggle-ngrx.service';
import { APP_TOKEN, REDUCER_TOKEN } from './tokens';

function throwIfAlreadyLoaded(parentModule: any, moduleName: string): void {
  if (parentModule) {
    throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only.`);
  }
}

export function appBootstrapListenerFactory(store: Store<any>): () => void {
  return () => {
    store.dispatch(new AfterBootstrap());
  };
}

export function geocoderConfigFactory(config: Config, transloco: TranslocoService): GeocoderConfig {
  return {
    ...config.geocoder,
    language: 'en',
    getLanguageOnEachRequest: () => transloco.getActiveLang()
  };
}

@NgModule({
  imports: [
    HttpClientModule,
    HttpClientJsonpModule,
    EffectsModule.forFeature([
      UrlParamsEffects,
      RouteEffects,
      RouteDataEffects,
      SettingsEffects,
      TranslateEffects,
      LayoutEffects,
      AmplitudeEffects,
      DialogEffects,
      ConfigEffects
    ]),
    FormsModule,
    GeosearchModule.forRoot({
      provide: GEOCODER_CONFIG_TOKEN,
      useFactory: geocoderConfigFactory,
      deps: [Config, TranslocoService]
    }),
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatToolbarModule,
    SharedModule,
    TranslocoRootModule,
    UserModule,
    UserSharedModule
  ],
  declarations: [
    AcceptCookiesComponent,
    AppComponent,
    AppMenuComponent,
    ContentLockedDialogComponent,
    HeaderComponent,
    MobileMenuComponent,
  ],
  exports: [AppComponent],
  entryComponents: [
    ContentLockedDialogComponent
  ],
  providers: [
    // solargis services
    // provided in root: AmplitudeAnalyticsService,
    GeolocatorService,
    // provided in root: StorageProviderService,
    UnitValuePipe,
    { provide: AnalyticsService, useFactory: analyticsFactory, deps: [Config, Router, 'Window'] },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: MatPaginatorIntl, useClass: SgPaginatorIntl, deps: [TranslocoService] },
    { provide: UnitToggleService, useClass: UnitToggleNgrxService, deps: [Store] },
    { provide: DateTimeFormatService, useClass: DateTimeFormatNgrxService, deps: [Store] },
    // angular router
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    { provide: RouterStateSerializer, useClass: CustomRouterStateSerializer },
    { provide: UrlSerializer, useClass: CustomUrlSerializer },
    // Ngrx store
    { provide: REDUCER_TOKEN, useFactory: getReducers },
    // App config and bootstrap
    { provide: APP_BASE_HREF, useFactory: appBaseHrefFactory, deps: [APP_TOKEN] },
    { provide: APP_BOOTSTRAP_LISTENER, useFactory: appBootstrapListenerFactory, deps: [Store], multi: true },
    // Interceptors
    { provide: HTTP_INTERCEPTORS, useClass: CompanyTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: IdTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UrlEncodeInterceptor, multi: true },
    // other
    { provide: 'Window', useFactory: windowFactory },
  ]
})
export class CoreModule {

  constructor(
    @Optional() @SkipSelf() parentModule: CoreModule,
    @Inject(APP_BASE_HREF) baseHref: string,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
    iconRegistry.addSvgIconSetInNamespace(
      'sg',
      sanitizer.bypassSecurityTrustResourceUrl(baseHref + 'assets/img/solargis-icons.svg')
    );
  }

}

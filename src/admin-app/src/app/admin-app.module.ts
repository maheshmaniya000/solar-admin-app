import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoPreloading, RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AdminAppConfig, Config } from 'ng-shared/config';
import { AppComponent } from 'ng-shared/core/containers/app.component';
import { CoreModule } from 'ng-shared/core/core.module';
import { logger } from 'ng-shared/core/meta.reducers';
import { APP_TOKEN, HEADER_APPS_TOKEN, REDUCER_TOKEN } from 'ng-shared/core/tokens';

import { environment } from '../environments/environment';
import { headerAppsLinks, routes } from './admin-app.routes';
import { CompaniesModule } from './companies/companies.module';
import { CompaniesEffects } from './companies/store/companies.effects';
import { InvoicesModule } from './invoices/invoices.module';
import { InvoicesEffects } from './invoices/store/invoices.effects';
import { OrdersModule } from './orders/orders.module';
import { OrdersEffects } from './orders/store/orders.effects';
import { ProductsModule } from './products/products.module';
import { ProductsEffects } from './products/store/products.effects';
import { AdminSharedModule } from './shared/admin-shared.module';
import { fromAdmin } from './store';
import { AdminEffects } from './store/app.effects';
import { UsersEffects } from './users/store/users.effects';
import { UsersModule } from './users/users.module';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    EffectsModule.forRoot([]),
    RouterModule.forRoot(routes, {
      preloadingStrategy: NoPreloading,
      useHash: false,
      scrollPositionRestoration: 'enabled',
      relativeLinkResolution: 'legacy'
    }),
    StoreModule.forRoot(REDUCER_TOKEN, {
      metaReducers: !environment.production ? [logger] : [],
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true
      }
    }),
    StoreRouterConnectingModule.forRoot(),
    StoreModule.forFeature(fromAdmin.featureKey, fromAdmin.reducers),
    EffectsModule.forFeature([AdminEffects, CompaniesEffects, UsersEffects, ProductsEffects, OrdersEffects, InvoicesEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production
    }),
    AdminSharedModule,
    CompaniesModule,
    InvoicesModule,
    OrdersModule,
    ProductsModule,
    UsersModule
  ],
  providers: [
    { provide: AdminAppConfig, useExisting: Config },
    { provide: APP_TOKEN, useValue: 'admin' },
    { provide: HEADER_APPS_TOKEN, useValue: headerAppsLinks }
  ]
})
export class AdminAppModule {}

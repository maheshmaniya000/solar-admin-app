import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { Config, fetchConfig } from 'ng-shared/config';
import { decorateModuleRef } from 'ng-shared/utils/module.utils';

import { DashboardAppModule } from './app/dashboard-app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

fetchConfig('dashboard')
  .then(config => platformBrowserDynamic([{ provide: Config, useValue: config }])
    .bootstrapModule(DashboardAppModule)
  )
  .then(modRef => decorateModuleRef(modRef, environment.production))
  .catch(err => console.error(err));

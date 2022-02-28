import { Routes } from '@angular/router';

import { AppLink } from 'ng-shared/core/types';
import { CommingSoonComponent } from 'ng-shared/shared/components/comming-soon/comming-soon.component';
import { NoContentComponent } from 'ng-shared/shared/components/no-content.component';
import { LoginUserGuard } from 'ng-shared/user/guards/login-user.guard';

const evaluateAppRoutes: Routes = [
  { path: '', component: CommingSoonComponent }
];

const embeddedAppsRoutes: Routes = [
  { path: 'user',
    canActivate: [LoginUserGuard],
    loadChildren: () => import('ng-shared/user/user.module').then(m => m.UserModule)
  },
  // { path: 'payment',
  //   loadChildren: () => import('ng-shared/payment/payment.module').then(m => m.PaymentModule)
  // }
];

export const routes: Routes = [
  ...evaluateAppRoutes,
  ...embeddedAppsRoutes,
  { path: '**', component: NoContentComponent },
];

export const headerAppsLinks: AppLink[] = embeddedAppsRoutes
  .filter(route => route.data && route.data.headerLink)
  .map(route => ({ app: route.path, routerLink: route.path }));

import { Routes } from '@angular/router';

import { AppLink } from 'ng-shared/core/types';
import { NoContentComponent } from 'ng-shared/shared/components/no-content.component';
import { LoginUserGuard } from 'ng-shared/user/guards/login-user.guard';

const prospectAppRoutes: Routes = [
  { path: 'map', loadChildren: () => import('ng-project/map/map-route.module').then(m => m.MapRouteModule) },
  {
    path: 'list',
    canActivate: [ LoginUserGuard ],
    loadChildren: () => import('./prospect/prospect-list.module').then(m => m.ProspectListModule)
  },
  { path: 'projects', redirectTo: '/list' },
  { path: 'compare', canActivate: [ LoginUserGuard ], loadChildren: () => import('./compare/compare.module').then(m => m.CompareModule) },
  { path: 'detail', canActivate: [ LoginUserGuard ], loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule) }
];

const embeddedAppsRoutes: Routes = [
  { path: 'user',
    canActivate: [LoginUserGuard],
    loadChildren: () => import('ng-shared/user-admin/user-admin.module').then(m => m.UserAdminModule)
  },
  // { path: 'payment',
  //   loadChildren: () => import('ng-shared/payment/payment.module').then(m => m.PaymentModule)
  // }
];

export const routes: Routes = [
  ...prospectAppRoutes,
  ...embeddedAppsRoutes,
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: '**', component: NoContentComponent },
];

export const headerAppsLinks: AppLink[] = embeddedAppsRoutes
  .filter(route => route.data && route.data.headerLink)
  .map(route => ({ app: route.path, routerLink: route.path }));

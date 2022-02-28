import { Routes } from '@angular/router';

import { AppLink } from 'ng-shared/core/types';
import { NoContentComponent } from 'ng-shared/shared/components/no-content.component';
import { LoginUserGuard } from 'ng-shared/user/guards/login-user.guard';


const dashboardAppRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'company-admin',
    loadChildren: () => import('./company-admin/company-admin.module').then(m => m.CompanyAdminModule)
  }
];

const embeddedAppsRoutes: Routes = [
  { path: 'user',
    canActivate: [LoginUserGuard],
    loadChildren: () => import('ng-shared/user-admin/user-admin.module').then(m => m.UserAdminModule)
  }
];

export const routes: Routes = [
  ...dashboardAppRoutes,
  ...embeddedAppsRoutes,
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', component: NoContentComponent },
];

export const headerAppsLinks: AppLink[] = embeddedAppsRoutes
  .filter(route => route.data && route.data.headerLink)
  .map(route => ({ app: route.path, routerLink: route.path }));

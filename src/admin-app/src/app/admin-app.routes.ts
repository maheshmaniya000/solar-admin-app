import { Routes } from '@angular/router';

import { AppLink } from 'ng-shared/core/types';
import { NoContentComponent } from 'ng-shared/shared/components/no-content.component';
import { LoginUserGuard } from 'ng-shared/user/guards/login-user.guard';

import { companiesRoutes } from './companies/companies.routes';
import { invoicesRoutes } from './invoices/invoices.routes';
import { ordersRoutes } from './orders/orders.routes';
import { productDetailRoutes, productsRoutes } from './products/products.routes';
import { LayoutComponent } from './shared/containers/layout.component';
import { AdminActivateGuard } from './shared/services/admin-activate.guard';
import { usersRoutes } from './users/users.routes';

const adminAppRoutes: Routes = [
  {
    path: 'list',
    component: LayoutComponent,
    canActivate: [LoginUserGuard],
    canActivateChild: [AdminActivateGuard],
    children: [
      {
        path: 'companies',
        children: companiesRoutes
      },
      {
        path: 'orders',
        children: ordersRoutes
      },
      {
        path: 'products',
        children: productsRoutes
      },
      {
        path: 'product',
        outlet: 'detail',
        children: productDetailRoutes
      },
      {
        path: 'users',
        children: usersRoutes
      },
      {
        path: 'invoices',
        children: invoicesRoutes
      },
      {
        path: '',
        redirectTo: 'companies',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'companies/:id/orders/:sgOrderId',
    redirectTo: 'list/orders/:sgOrderId',
    pathMatch: 'full'
  },
  {
    path: 'list/companies/:id/orders/:sgOrderId',
    redirectTo: 'list/orders/:sgOrderId',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];

const embeddedAppsRoutes: Routes = [
  {
    path: 'user',
    canActivate: [LoginUserGuard],
    loadChildren: () => import('ng-shared/user-admin/user-admin.module').then(m => m.UserAdminModule)
  }
];

export const routes: Routes = [...adminAppRoutes, ...embeddedAppsRoutes, { path: '**', component: NoContentComponent }];

export const headerAppsLinks: AppLink[] = embeddedAppsRoutes
  .filter(route => route.data && route.data.headerLink)
  .map(route => ({ app: route.path, routerLink: route.path }));

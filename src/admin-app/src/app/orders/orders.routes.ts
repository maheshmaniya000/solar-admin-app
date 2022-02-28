import { Route } from '@angular/router';

import { ComponentMode } from '../shared/models/component-mode.enum';
import { UnsavedChangesGuard } from '../shared/services/unsaved-changes-guard.service';
import { OrdersTableComponent } from './components/orders-table/orders-table.component';
import { OrdersToolbarComponent } from './components/orders-toolbar/orders-toolbar.component';
import { OrderDetailComponent } from './containers/order-detail/order-detail.component';
import { OrderDetailGuard } from './services/order-detail.guard';

export const ordersRoutes: Route[] = [
  {
    path: '',
    component: OrdersTableComponent
  },
  {
    path: 'add',
    component: OrderDetailComponent,
    canDeactivate: [UnsavedChangesGuard],
    data: {
      mode: ComponentMode.add,
      fullscreen: true
    }
  },
  {
    path: ':sgOrderId',
    canActivate: [OrderDetailGuard],
    data: {
      fullscreen: true
    },
    children: [
      {
        path: '',
        component: OrderDetailComponent,
        data: {
          mode: ComponentMode.view
        }
      },
      {
        path: 'edit',
        component: OrderDetailComponent,
        canDeactivate: [UnsavedChangesGuard],
        data: {
          mode: ComponentMode.edit
        }
      }
    ]
  },
  {
    path: '',
    component: OrdersToolbarComponent,
    outlet: 'toolbar'
  }
];

import { Route } from '@angular/router';

import { ComponentMode } from '../shared/models/component-mode.enum';
import { UnsavedChangesGuard } from '../shared/services/unsaved-changes-guard.service';
import { ProductsTableComponent } from './components/products-table/products-table.component';
import { ProductsToolbarComponent } from './components/products-toolbar/products-toolbar.component';
import { ProductDetailComponent } from './containers/product-detail/product-detail.component';
import { ProductDetailGuard } from './services/product-detail.guard';

export const productsRoutes: Route[] = [
  {
    path: '',
    component: ProductsTableComponent
  },
  {
    path: '',
    component: ProductsToolbarComponent,
    outlet: 'toolbar'
  }
];

export const productDetailRoutes: Route[] = [
  {
    path: 'add',
    component: ProductDetailComponent,
    canDeactivate: [UnsavedChangesGuard],
    data: {
      mode: ComponentMode.add
    }
  },
  {
    path: ':code',
    canActivate: [ProductDetailGuard],
    children: [
      {
        path: '',
        component: ProductDetailComponent,
        data: {
          mode: ComponentMode.view
        }
      },
      {
        path: 'edit',
        component: ProductDetailComponent,
        canDeactivate: [UnsavedChangesGuard],
        data: {
          mode: ComponentMode.edit
        }
      }
    ]
  }
];

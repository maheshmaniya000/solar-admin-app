import { Route } from '@angular/router';

import { InvoicesTableComponent } from './components/invoices-table/invoices-table.component';
import { InvoicesToolbarComponent } from './components/invoices-toolbar/invoices-toolbar.component';

export const invoicesRoutes: Route[] = [
  {
    path: '',
    component: InvoicesTableComponent
  },
  {
    path: '',
    component: InvoicesToolbarComponent,
    outlet: 'toolbar'
  }
];

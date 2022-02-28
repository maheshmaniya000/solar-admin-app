import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { OrdersActions } from '../../../orders/store';
import { fromAdmin } from '../../../store';
import { CompanyDetailStore } from '../../services/company-detail.store';

@Component({
  selector: 'sg-admin-view-company-tools',
  templateUrl: './view-company-tools.component.html'
})
export class ViewCompanyToolsComponent {
  constructor(
    readonly companyDetailStore: CompanyDetailStore,
    private readonly store: Store<fromAdmin.State>,
    private readonly router: Router
  ) {}

  onShowOrdersClick(sgCompanyId: string): void {
    this.store.dispatch(OrdersActions.changeFilter({ filter: { company: { sgCompanyId } } }));
    this.router.navigate(['/', { outlets: { primary: 'list/orders' } }]);
  }
}

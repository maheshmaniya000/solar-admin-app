import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { publishReplay, refCount, switchMap } from 'rxjs/operators';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { State } from 'ng-shared/user/reducers';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';

import { ApiContractsService } from '../../services/api-contracts.service';
import { ApiContractsDataSource } from './api-contracts.data-source';

@Component({
  selector: 'sg-api-contracts',
  templateUrl: './api-contracts.component.html',
  styleUrls: ['./api-contracts.component.scss']
})
export class ApiContractsComponent extends SubscriptionAutoCloseComponent implements OnInit {

  v1Columns = ['name', 'type', 'open'];
  v1ApiContractCount = -1;
  v1DataSource$: ApiContractsDataSource;

  constructor(
    private readonly store: Store<State>,
    private readonly apiContractsService: ApiContractsService
  ) {
    super();
  }

  ngOnInit(): void {
    const apiContracts$ = this.store.pipe(selectActiveOrNoCompany).pipe(
      switchMap(company => this.apiContractsService.listAPIContracts(company.sgCompanyId)),
      publishReplay(),
      refCount()
    );

    this.v1DataSource$ = new ApiContractsDataSource(apiContracts$);

    this.addSubscription(
      this.v1DataSource$.getCount().subscribe(
        count => this.v1ApiContractCount = count
      )
    );
  }
}

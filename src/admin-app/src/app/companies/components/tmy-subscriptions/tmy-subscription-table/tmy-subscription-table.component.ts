import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of } from 'rxjs';
import { AdminUsersCompaniesService } from 'src/admin-app/src/app/shared/services/admin-users-companies.service';

import { Page } from '@solargis/types/api';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { DetailNavigationService } from '../../../../shared/services/detail-navigation.service';

@Component({
  selector: 'sg-tmy-subscription-table',
  templateUrl: './tmy-subscription-table.component.html',
  styleUrls: ['./tmy-subscription-table.component.scss'],
})
export class TmySubscriptionTableComponent extends SubscriptionAutoCloseComponent implements OnInit {
  pageSizeOptions = [25, 50, 100];
  columns = ['subscriptionType', 'status', 'calls', 'expiryDate', 'details'];
  count$: Observable<number>;
  page$: Observable<Page>;

  multiselect$: Observable<string[]>;
  allSelected$: Observable<boolean>;
  subscriptions$: Observable<any>;
  selected$: Observable<any>;

  selection = new SelectionModel<string>(true);
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  data = [];

  constructor(
    private readonly detailNavigationService: DetailNavigationService,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.page$ = of({size: 10, index: 1});
    this.count$ = of(120);
    this.adminUsersCompaniesService.getTMYSubscription().subscribe(data => this.data = data);
    this.subscriptions$ = of(this.data);

    this.sort.active = 'subscriptionType';
    this.sort.direction = 'asc';
    this.addSubscription(
      this.sort.sortChange.subscribe(materialSort => {
        this.data = this.data.sort((a, b) => {
          const sortOrder = materialSort.direction === 'asc' ? -1 : 1;
          const valueA = a[materialSort.active];
          const valueB = b[materialSort.active];
          const result = (valueA < valueB) ? -1 : (valueA > valueB) ? 1 : 0;
          console.log(result * sortOrder);
          return result * sortOrder;
        });
        this.subscriptions$ = of(this.data);
      })
    );
  }


  onPageChanged(event: PageEvent): void {
    console.log(event);
  }

  onRowClicked(subscription: any): void {
    this.detailNavigationService.toSubscription(subscription);
  }

  onSelectAllClick(event: MouseEvent): void {
    event.preventDefault();
  }
}

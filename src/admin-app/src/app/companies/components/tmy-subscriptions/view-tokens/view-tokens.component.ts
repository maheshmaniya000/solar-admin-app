import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AdminUsersCompaniesService } from 'src/admin-app/src/app/shared/services/admin-users-companies.service';
import { DetailNavigationService } from 'src/admin-app/src/app/shared/services/detail-navigation.service';

import { Page } from '@solargis/types/api';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';


@Component({
  selector: 'sg-view-tokens',
  templateUrl: './view-tokens.component.html',
  styleUrls: ['./view-tokens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTokensComponent extends SubscriptionAutoCloseComponent implements OnInit {
  pageSizeOptions = [25, 50, 100];
  count$: Observable<number>;
  page$: Observable<Page>;
  columns = ['tokenId', 'generationDate', 'action'];
  dataSource$: Observable<any>;
  data = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private readonly detailNavigationService: DetailNavigationService,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    this.page$ = of({size: 10, index: 1});
    this.count$ = of(120);
    this.adminUsersCompaniesService.getUserTokens().subscribe(data => this.data = data);
    this.dataSource$ = of(this.data);

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

  onCloseClick(): void {
    this.router.navigate(['..'], { relativeTo: this.route});
  }

}

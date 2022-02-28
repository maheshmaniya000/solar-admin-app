import { Component, Inject, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';

import { PlacemarkPartPipe } from '@solargis/ng-geosearch';
import { installedPowerUnit } from '@solargis/units';

import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { ProspectAppConfig } from 'ng-shared/config';
import { State } from 'ng-shared/core/reducers';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { selectAllRecentProjectsDashboardItem } from '../../selector/recent-projects.selectors';
import { RecentProjetsDataSource } from './list-recent.data-source';

@Component({
  selector: 'sg-list-recent-projects',
  templateUrl: './list-recent-projects.component.html',
  styleUrls: ['./list-recent-projects.component.scss'],
})
export class ListRecentProjectsComponent extends SubscriptionAutoCloseComponent implements OnInit {
  @Input() showRecentTable: boolean;

  dataSource: RecentProjetsDataSource;
  displayedColumns: string[] = ['name', 'address', 'coordinates', 'capacity', 'updatedTs'];

  defaultOrder: Sort = { active: 'updatedTs', direction: 'desc' };
  order: Sort = this.defaultOrder;
  sort$ = new BehaviorSubject<Sort>(this.defaultOrder);

  installedPowerUnit = installedPowerUnit;

  defaultPageSize = 10;
  pageEvent$ = new BehaviorSubject<PageEvent>({ pageSize: this.defaultPageSize, pageIndex: 0, length: 0 });

  constructor(
    private readonly projectNamePipe: ProjectNamePipe,
    private readonly config: ProspectAppConfig,
    public placemarkPart: PlacemarkPartPipe,
    private readonly store: Store<State>,
    @Inject('Window') private readonly window: Window,
  ) { super(); }

  ngOnInit(): void {
    this.dataSource = new RecentProjetsDataSource(
      this.store.pipe(selectAllRecentProjectsDashboardItem),
      this.pageEvent$,
      this.sort$,
      this.projectNamePipe,
      this.config,
      this.placemarkPart,
      this.window.devicePixelRatio
    );
  }
}

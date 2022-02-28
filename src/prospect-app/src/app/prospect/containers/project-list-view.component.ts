import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { selectIsSelectedMulti } from 'ng-project/project-list/selectors';
import { State } from 'ng-project/project/reducers';
import { ProjectListSidebarState } from 'ng-shared/core/reducers/layout.reducer';
import { selectAlertsCount } from 'ng-shared/core/selectors/alerts.selector';
import { selectLayoutProjectListSidebar } from 'ng-shared/core/selectors/layout.selector';

@Component({
  selector: 'sg-project-list-view',
  styleUrls: ['./project-list-view.component.scss'],
  templateUrl: './project-list-view.component.html'
})
export class ProjectListViewComponent implements OnInit {
  alertBarHeight$: Observable<number>;
  defaultTopPadding = 48;
  dynamicTopPadding = 30;

  state$: Observable<ProjectListSidebarState>;
  isMulti$: Observable<boolean>;
  searchQuery: string;

  constructor(private readonly store: Store<State>) { }

  ngOnInit(): void {
    this.state$ = this.store.pipe(selectLayoutProjectListSidebar);
    this.isMulti$ = this.store.pipe(selectIsSelectedMulti);

    this.alertBarHeight$ = this.store.pipe(
      selectAlertsCount('prospect/list'),
      map(count => count * this.dynamicTopPadding + this.defaultTopPadding)
    );
  }

  searchProject(query): void {
    this.searchQuery = query;
  }
}

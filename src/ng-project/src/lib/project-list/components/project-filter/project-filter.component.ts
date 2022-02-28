import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, first, map } from 'rxjs/operators';

import { UserTag } from '@solargis/types/project';
import { OrderedMap } from '@solargis/types/utils';

import { ManageTagsDialogComponent } from 'ng-project/project/dialogs/manage-tag-dialog/manage-tag-dialog.component';
import { ExtendedProject } from 'ng-project/project/reducers/projects.reducer';
import { LayoutDrawerCloseIfOver } from 'ng-shared/core/actions/layout.actions';
import { selectIsUserLogged } from 'ng-shared/user/selectors/auth.selectors';

import { selectUserTags } from '../../../project/selectors/tag.selectors';
import { ClearFilter, SetFilter, SetTagFilter } from '../../actions/filter.actions';
import { State } from '../../reducers';
import { defaultProjectFilter, getRecentFilter, ProjectFilter } from '../../reducers/filter.reducer';
import { FilterStats, getProjectListFilter, selectFilterStats } from '../../selectors';

@Component({
  selector: 'sg-project-filter',
  templateUrl: './project-filter.component.html',
  styleUrls: ['./project-filter.component.scss']
})
export class ProjectFilterComponent implements OnInit {
  filterStats$: Observable<FilterStats>;
  filter$: Observable<ProjectFilter>;
  isDefaultFilter$: Observable<boolean>;
  selectedTag$: Observable<string>;

  tags$: Observable<OrderedMap<UserTag>>;
  projects$: Observable<ExtendedProject[]>;
  filteredProjects$: Observable<ExtendedProject[]>;

  tagOpen = false;
  searchControl = new FormControl();

  isOpened$: Observable<boolean>;

  constructor(private readonly store: Store<State>, private readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.filterStats$ = this.store.pipe(selectFilterStats);
    this.filter$ = this.store.select('projectList', 'filter');
    this.isDefaultFilter$ = this.filter$.pipe(map(filter => filter === defaultProjectFilter));

    this.selectedTag$ = this.store.select(getProjectListFilter).pipe(
      map(filter => !filter || !filter.tags ? undefined : Object.keys(filter.tags)[0]),
      distinctUntilChanged()
    );

    this.tags$ = this.store.pipe(selectUserTags);

    this.isOpened$ = combineLatest([
      this.store.pipe(selectIsUserLogged),
      this.store.select('layout', 'drawer')
    ]).pipe(
      map(([isLoggedIn, layoutDrawer]) => isLoggedIn && layoutDrawer.toggle === 'opened'),
      distinctUntilChanged()
    );
  }

  isOpened(isSidenavOpened: Observable<boolean>): void {
    this.isOpened$ = isSidenavOpened;
  }

  setFilter(filter: ProjectFilter): void {
    this.store.dispatch(new SetFilter(filter));
    this.drawerClose();
  }

  setRecentFilter(): void {
    this.store.dispatch(new SetFilter(getRecentFilter()));
    this.drawerClose();
  }

  setTagFilter(tag: UserTag, allow = true): void {
    this.filterStats$.pipe(first()).subscribe(stats => {
      if (stats && stats.userTag[tag.tagName] > 0) {
        this.store.dispatch(new SetTagFilter({[tag.tagName]: allow}));
        this.drawerClose();
      }
    });
  }

  clearFilter(): void {
    this.store.dispatch(new ClearFilter());
    this.drawerClose();
  }

  openManageLabelsDialog(): void {
    this.dialog.open(ManageTagsDialogComponent, {
    });
  }

  drawerClose(): void {
    this.store.dispatch(new LayoutDrawerCloseIfOver());
  }
}

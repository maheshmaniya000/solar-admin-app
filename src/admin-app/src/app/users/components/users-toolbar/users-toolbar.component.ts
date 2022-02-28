import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserListFilter } from '@solargis/types/user-company';

import { Column } from '../../../shared/dialogs/column-selector-dialog.component';
import { fromAdmin } from '../../../store';
import { UserColumn } from '../../constants/user-column.enum';
import { Users } from '../../constants/users.constants';
import { UsersActions, UsersSelectors } from '../../store';

@Component({
  selector: 'sg-admin-users-toolbar',
  templateUrl: './users-toolbar.component.html'
})
export class UsersToolbarComponent implements OnInit {
  readonly tableSettingsKey = Users.tableSettingsKey;

  filter$: Observable<UserListFilter>;
  selectedColumns$: Observable<UserColumn[]>;

  readonly columns: Omit<Column<UserColumn>, 'selected'>[] = [
    { label: 'User ID', props: UserColumn.sgAccountId },
    { label: 'Email', props: UserColumn.email },
    { label: 'First name', props: UserColumn.firstName },
    { label: 'Last name', props: UserColumn.lastName },
    { label: 'Phone', props: UserColumn.phone },
    { label: 'Origin system', props: UserColumn.originSystem },
    { label: 'Created', props: UserColumn.created },
    { label: 'Modified', props: UserColumn.updated }
  ];

  constructor(private readonly store: Store<fromAdmin.State>) {}

  ngOnInit(): void {
    this.filter$ = this.store.select(UsersSelectors.selectFilter);
    this.selectedColumns$ = this.store
      .select(UsersSelectors.selectTableSettings)
      .pipe(map(settings => settings.columns as UserColumn[]));
  }

  updateFilter(filter: UserListFilter): void {
    this.store.dispatch(UsersActions.changeFilter({ filter }));
  }

  exportUsersList(): void {
    this.store.dispatch(UsersActions.exportList());
  }
}

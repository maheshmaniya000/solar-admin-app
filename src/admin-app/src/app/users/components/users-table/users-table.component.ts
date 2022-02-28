import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { intersection } from 'lodash-es';
import { isEmpty } from 'lodash-es';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map } from 'rxjs/operators';

import { Page } from '@solargis/types/api';
import { User, UserListFilter } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { fromDateFilterValues, materialSortToSort, toFilterValue, toISO8601FilterValues } from '../../../shared/admin.utils';
import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { fromAdmin } from '../../../store';
import { UserColumn } from '../../constants/user-column.enum';
import { fromUsers, UsersActions, UsersSelectors } from '../../store';

@Component({
  selector: 'sg-admin-users-table',
  styleUrls: ['../../../shared/components/admin-common.styles.scss', '../../../shared/components/admin-tab.styles.scss'],
  templateUrl: './users-table.component.html'
})
export class UsersTableComponent extends SubscriptionAutoCloseComponent implements OnInit {
  multiselect$: Observable<string[]>;
  allSelected$: Observable<boolean>;
  users$: Observable<User[]>;
  count$: Observable<number>;
  selected$: Observable<User>;
  columnsToDisplay$: Observable<string[]>;
  page$: Observable<Page>;
  pageSizeOptions = [25, 50, 100];

  form: FormGroup;
  selectedUserId: string;
  selection = new SelectionModel<string>(true);
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly detailNavigationService: DetailNavigationService
  ) {
    super();
  }

  getCreatedFormGroup(): FormGroup {
    return this.form?.get('created') as FormGroup;
  }

  getUpdatedFormGroup(): FormGroup {
    return this.form?.get('updated') as FormGroup;
  }

  ngOnInit(): void {
    this.createForm();
    this.store.dispatch(UsersActions.load());
    this.users$ = this.store.select(UsersSelectors.selectAll);
    this.selected$ = this.store.select(UsersSelectors.selectDetail);
    this.multiselect$ = this.store.select(UsersSelectors.selectMultiselect);
    this.allSelected$ = this.store.select(UsersSelectors.selectAllSelected);
    this.addSubscription(
      this.multiselect$.subscribe(selection => isEmpty(selection) ? this.selection.clear() : this.selection.select(...selection))
    );
    this.addSubscription(this.selection.changed.pipe(
      distinctUntilChanged(isEqual)
    ).subscribe(() => this.store.dispatch(UsersActions.multiselect({ ids: this.selection.selected }))));
    this.count$ = this.store.select(UsersSelectors.selectCount);
    this.page$ = this.store.select(UsersSelectors.selectPage);
    this.columnsToDisplay$ = this.store
      .select(UsersSelectors.selectTableSettings)
      .pipe(map(settings => ['checkbox', ...intersection(settings.columns, Object.values(UserColumn))]));

    this.addSubscription(
      this.form.valueChanges
        .pipe(
          debounceTime(500),
          map(() => this.getFilter()),
          distinctUntilChanged<UserListFilter>(isEqual)
        )
        .subscribe(userListFilter => this.store.dispatch(UsersActions.changeFilter({ filter: userListFilter })))
    );

    this.addSubscription(
      this.store
        .select(UsersSelectors.selectFilter)
        .pipe(first())
        .subscribe(userListFilter => this.patchForm(userListFilter))
    );

    this.addSubscription(
      this.store
        .select(UsersSelectors.selectFilter)
        .pipe(filter(orderListFilter => isEqual(orderListFilter, fromUsers.initialFilter)))
        .subscribe(userListFilter => {
          this.form.reset(undefined, { emitEvent: false });
          this.patchForm(userListFilter);
        })
    );

    this.addSubscription(
      this.store.select(UsersSelectors.selectSort).subscribe(sort => {
        this.sort.active = sort.sortBy?.replace(/\./g, '_');
        this.sort.direction = sort.direction;
      })
    );
    this.addSubscription(
      this.sort.sortChange.subscribe(materialSort =>
        this.store.dispatch(UsersActions.changeSort({ sort: materialSortToSort(materialSort) }))
      )
    );
  }

  onRowClicked(user: User): void {
    this.detailNavigationService.toUser(user);
  }

  onPageChanged(event: PageEvent): void {
    this.store.dispatch(UsersActions.changePage({ page: { size: event.pageSize, index: event.pageIndex } }));
  }

  onSelectAllClick(event: MouseEvent): void {
    event.preventDefault();
    this.store.dispatch(this.selection.hasValue() ? UsersActions.multiselectClear() : UsersActions.multiselectToggleAll());
  }

  private getFilter(): UserListFilter {
    return {
      sgAccountId: toFilterValue(this.form?.get('sgAccountId').value),
      email: toFilterValue(this.form?.get('email').value),
      firstName: toFilterValue(this.form?.get('firstName').value),
      lastName: toFilterValue(this.form?.get('lastName').value),
      phone: toFilterValue(this.form?.get('phone').value),
      originSystem: toFilterValue(this.form?.get('originSystem').value),
      created: toISO8601FilterValues(this.getCreatedFormGroup()?.value),
      updated: toISO8601FilterValues(this.getUpdatedFormGroup()?.value)
    };
  }

  private patchForm(userListFilter: UserListFilter): void {
    this.form.markAllAsTouched();
    this.form.markAsDirty();
    this.form.patchValue(
      {
        ...userListFilter,
        created: fromDateFilterValues(userListFilter?.created),
        updated: fromDateFilterValues(userListFilter?.updated)
      },
      { emitEvent: false }
    );
  }

  private createForm(): void {
    const fb = new FormBuilder();
    this.form = fb.group({
      sgAccountId: [undefined, []],
      email: [undefined, []],
      firstName: [undefined, []],
      lastName: [undefined, []],
      phone: [undefined, []],
      originSystem: [undefined, []],
      created: fb.group({
        start: [undefined],
        end: [undefined]
      }),
      updated: fb.group({
        start: [undefined],
        end: [undefined]
      })
    });
  }
}

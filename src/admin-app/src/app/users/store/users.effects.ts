import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mapTo, switchMap, withLatestFrom } from 'rxjs/operators';

import { removeEmpty } from '@solargis/types/utils';

import { AdminStoreFactoryService } from '../../shared/services/admin-store-factory.service';
import { AdminUsersCompaniesService } from '../../shared/services/admin-users-companies.service';
import { fromAdmin } from '../../store';
import { UsersActions, UsersSelectors } from './index';

@Injectable()
export class UsersEffects {
  updateUsersList$ = createEffect(() =>
    this.actions$.pipe(ofType(UsersActions.changeFilter, UsersActions.changeSort), mapTo(UsersActions.load()))
  );

  updatePageSize$ = this.adminStoreFactoryService.createUpdatePageSizeEffect(UsersActions.changePage, UsersActions.load);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.load),
      withLatestFrom(this.store.select(UsersSelectors.selectFilterPageAndSort)),
      switchMap(([, { filter, page, sort }]) =>
        this.adminUsersCompaniesService.getUsers(filter, page, sort).pipe(
          map(response => UsersActions.loadSuccess({ count: response.count, users: response.data })),
          catchError(() => of(UsersActions.loadFailure))
        )
      )
    )
  );

  loadDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadDetail),
      switchMap(({ sgAccountId }) =>
        this.store.select(UsersSelectors.selectById(sgAccountId)).pipe(
          switchMap(user => (user ? of(user) : this.adminUsersCompaniesService.getUser(sgAccountId))),
          map(user => UsersActions.loadDetailSuccess({ user })),
          catchError(() => of(UsersActions.loadDetailFailure({ sgAccountId })))
        )
      )
    )
  );

  xlsxExport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.exportList),
      withLatestFrom(
        this.store.select(UsersSelectors.selectFilterPageAndSort),
        this.store.select(UsersSelectors.selectTableSettings).pipe(map(settings => settings.columns)),
        this.store.select(UsersSelectors.selectMultiselect)
      ),
      switchMap(([, { filter, sort }, columns, selected]) =>
        this.adminUsersCompaniesService.exportUsersXlsx(removeEmpty(filter, true), columns, sort, selected)
      )
    ), { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly store: Store<fromAdmin.State>,
    private readonly adminStoreFactoryService: AdminStoreFactoryService
  ) {}
}

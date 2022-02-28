import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mapTo, switchMap, withLatestFrom } from 'rxjs/operators';

import { removeEmpty } from '@solargis/types/utils';

import { AdminStoreFactoryService } from '../../shared/services/admin-store-factory.service';
import { AdminUsersCompaniesService } from '../../shared/services/admin-users-companies.service';
import { fromAdmin } from '../../store';
import { CompaniesActions, CompaniesSelectors } from './index';

@Injectable()
export class CompaniesEffects {
  updateCompanyList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompaniesActions.changeFilter, CompaniesActions.changeSort),
      mapTo(CompaniesActions.loadCompanies())
    )
  );

  updatePageSize$ = this.adminStoreFactoryService.createUpdatePageSizeEffect(
    CompaniesActions.changePage,
    CompaniesActions.loadCompanies
  );

  loadCompanies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompaniesActions.loadCompanies),
      withLatestFrom(this.store.select(CompaniesSelectors.selectFilterPageAndSort)),
      switchMap(([, { filter, page, sort }]) =>
        this.adminUsersCompaniesService.getCompanies(filter, page, sort).pipe(
          map(res => CompaniesActions.loadCompaniesSuccess({ count: res.count, companies: res.data })),
          catchError(() => of(CompaniesActions.loadCompaniesFailure))
        )
      )
    )
  );

  xlsxExport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompaniesActions.exportList),
      withLatestFrom(
        this.store.select(CompaniesSelectors.selectFilterPageAndSort),
        this.store.select(CompaniesSelectors.selectMultiselect)
      ),
      switchMap(([, { filter, sort }, selected]) =>
        this.adminUsersCompaniesService.exportCompaniesXlsx(removeEmpty(filter, true), sort, selected)
      )
    ), { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromAdmin.State>,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly adminStoreFactoryService: AdminStoreFactoryService
  ) {}
}

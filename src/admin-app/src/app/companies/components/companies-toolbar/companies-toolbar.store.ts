import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, pipe, OperatorFunction, MonoTypeOperatorFunction } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Company } from '@solargis/types/user-company';

import { checkResponseSuccess } from '../../../shared/admin.utils';
import { AdminUsersCompaniesService } from '../../../shared/services/admin-users-companies.service';
import { AdminActions, fromAdmin } from '../../../store';
import { CompaniesActions, CompaniesSelectors } from '../../store';

export interface CompaniesToolbarState {
  bulkUpdating: boolean;
}

@Injectable()
export class CompaniesToolbarStore extends ComponentStore<CompaniesToolbarState> {
  readonly setBulkUpdating = this.updater((state, bulkUpdating: boolean) => ({
    ...state,
    bulkUpdating
  }));

  readonly bulkUpdating$ = this.select(({ bulkUpdating }) => bulkUpdating);

  readonly bulkChangeHistoric = this.effect((historic$: Observable<boolean>) =>
    historic$.pipe(
      this.startBulkChange(),
      switchMap(([historic, companyIDs]) =>
        this.adminUsersCompaniesService.bulkChangeHistoric(companyIDs, historic).pipe(this.handleBulkChangeResponse())
      )
    )
  );

  readonly assignToParent = this.effect((newParent$: Observable<Company>) =>
    newParent$.pipe(
      this.startBulkChange(),
      switchMap(([newParent, companyIds]) =>
        this.adminUsersCompaniesService
          .bulkChangeHistoric(
            companyIds.filter(sgCompanyId => sgCompanyId !== newParent.sgCompanyId),
            null,
            newParent.sgCompanyId
          )
          .pipe(this.handleBulkChangeResponse())
      )
    )
  );

  constructor(private readonly adminUsersCompaniesService: AdminUsersCompaniesService, private readonly store: Store<fromAdmin.State>) {
    super({
      bulkUpdating: false
    });
  }

  private startBulkChange<T>(): OperatorFunction<T, [T, string[]]> {
    return pipe(
      withLatestFrom(this.bulkUpdating$),
      filter(([, bulkUpdating]) => !bulkUpdating),
      map(([value]) => value),
      tap(() => this.setBulkUpdating(true)),
      withLatestFrom(this.store.select(CompaniesSelectors.selectMultiselect))
    );
  }

  private handleBulkChangeResponse(): MonoTypeOperatorFunction<boolean> {
    return pipe(
      checkResponseSuccess(),
      tap({
        next: () => {
          this.store.dispatch(CompaniesActions.multiselectClear());
          this.store.dispatch(CompaniesActions.loadCompanies());
          this.showSnackbarMessage({
            message: 'Change has been saved',
            styleClass: 'snackbarPass'
          });
        },
        error: () =>
          this.showSnackbarMessage({
            message: 'Could not save change',
            styleClass: 'snackbarError'
          })
      }),
      catchError(() => EMPTY),
      finalize(() => this.setBulkUpdating(false))
    );
  }

  private showSnackbarMessage(config: { message: string; styleClass: 'snackbarPass' | 'snackbarError' }): void {
    this.store.dispatch(AdminActions.showSnackbar(config));
  }
}

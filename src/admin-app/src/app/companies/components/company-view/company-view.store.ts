import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { EMPTY, Observable } from 'rxjs';
import { catchError, distinctUntilChanged, filter, finalize, switchMap, tap } from 'rxjs/operators';

import { Company, UserCompanyDetails } from '@solargis/types/user-company';

import { CompanyService } from 'ng-shared/user/services/company.service';

import { checkResponseSuccess } from '../../../shared/admin.utils';
import { AdminUsersCompaniesService } from '../../../shared/services/admin-users-companies.service';
import { AdminActions, fromAdmin } from '../../../store';

export interface CompanyViewState {
  company: Company;
  updatingUsers: boolean;
  users: UserCompanyDetails[];
}

@Injectable()
export class CompanyViewStore extends ComponentStore<CompanyViewState> {
  readonly setCompany = this.updater((state, company: Company) => ({
    ...state,
    company
  }));

  readonly setUpdatingUsers = this.updater((state, updatingUsers: boolean) => ({
    ...state,
    updatingUsers
  }));

  readonly setUsers = this.updater((state, users: UserCompanyDetails[]) => ({
    ...state,
    users
  }));

  readonly company$ = this.select(state => state.company);

  readonly loadUsers = this.effect((company$: Observable<Company>) =>
    company$.pipe(
      tap(() => this.setUsers([])),
      filter(company => !isNil(company) && !company.deleted),
      tap(() => this.setUpdatingUsers(true)),
      switchMap(company =>
        this.companyService.listUsersForCompany(company.sgCompanyId).pipe(
          tap({
            next: users => this.setUsers(users),
            error: () =>
              this.showSnackbarMessage({
                message: 'Could NOT refresh users',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setUpdatingUsers(false))
        )
      )
    )
  );

  readonly assignSubCompaniesUsersToParentCompany = this.effect((company$: Observable<Company>) =>
    company$.pipe(
      tap(() => this.setUpdatingUsers(true)),
      switchMap(company =>
        this.adminUsersCompaniesService.assignSubCompaniesUsersToParentCompany(company.sgCompanyId).pipe(
          checkResponseSuccess(),
          tap({
            next: () => {
              this.showSnackbarMessage({
                message: 'Users from similar companies have been assigned to this company',
                styleClass: 'snackbarPass'
              });
            },
            error: () =>
              this.showSnackbarMessage({
                message: 'Users from similar companies could NOT be assigned to this company',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setUpdatingUsers(false))
        )
      )
    )
  );

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly companyService: CompanyService
  ) {
    super({
      company: undefined,
      updatingUsers: false,
      users: []
    });
    this.loadUsers(
      this.company$.pipe(distinctUntilChanged((c1, c2) => c1?.sgCompanyId === c2?.sgCompanyId && c1?.deleted === c2?.deleted))
    );
  }

  private showSnackbarMessage(config: { message: string; styleClass: 'snackbarPass' | 'snackbarError' }): void {
    this.store.dispatch(AdminActions.showSnackbar(config));
  }
}

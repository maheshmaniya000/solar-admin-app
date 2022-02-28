import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { isEmpty, isNil } from 'lodash-es';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, filter, finalize, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Company, User, UserCompanyRole, UserCompanyStatus } from '@solargis/types/user-company';

import { AdminUsersCompaniesService } from '../../../shared/services/admin-users-companies.service';
import { AdminActions, fromAdmin } from '../../../store';

interface CompanyRoleAndStatus {
  sgCompanyId: string;
  role: UserCompanyRole;
  status: UserCompanyStatus;
}

interface UserViewState {
  user: User;
  loadingCompanies: boolean;
  companies: Company[];
  updatingCompany: Record<string, boolean>;
  assigningUserToCompany: boolean;
}

@Injectable()
export class UserViewStore extends ComponentStore<UserViewState> {
  readonly setUser = this.updater((state, user: User) => ({
    ...state,
    user
  }));

  readonly setCompanies = this.updater((state, companies: Company[]) => ({
    ...state,
    companies,
    updatingCompany: {}
  }));

  readonly setLoadingCompanies = this.updater((state, loadingCompanies: boolean) => ({
    ...state,
    loadingCompanies
  }));

  readonly setUpdatingCompany = this.updater((state, { sgCompanyId, status }: { sgCompanyId: string; status: boolean }) => ({
    ...state,
    updatingCompany: {
      ...state.updatingCompany,
      [sgCompanyId]: status
    }
  }));

  readonly setAssigningUserToCompany = this.updater((state, assigningUserToCompany: boolean) => ({
    ...state,
    assigningUserToCompany
  }));

  readonly setUserRoleAndStatus = this.updater((state, { sgCompanyId, role, status }: CompanyRoleAndStatus) => ({
    ...state,
    companies: state.companies.map(company =>
      company.sgCompanyId === sgCompanyId
        ? {
            ...company,
            users: company.users.map(user =>
              user.sgAccountId === state.user.sgAccountId
                ? { sgAccountId: state.user.sgAccountId, role, status }
                : user
            )
          }
        : company
    )
  }));

  readonly user$ = this.select(state => state.user);

  readonly viewModel$ = this.select(state => ({
    ...state,
    originDataVisible: !isEmpty(state.user.originData)
  }));

  readonly assignToCompanySuccess$ = new Subject<void>();

  readonly loadCompanies = this.effect((user$: Observable<User>) =>
    user$.pipe(
      tap(() => this.setCompanies([])),
      filter(user => !isNil(user) && !user.deleted),
      tap(() => this.setLoadingCompanies(true)),
      switchMap(user =>
        this.adminUsersCompaniesService.listCompaniesForUser(user.sgAccountId).pipe(
          tap({
            next: companies => this.setCompanies(companies),
            error: () =>
              this.showSnackbarMessage({
                message: 'Could NOT load user companies',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setLoadingCompanies(false))
        )
      )
    )
  );

  readonly deleteFromCompany = this.effect((companyId$: Observable<string>) =>
    companyId$.pipe(
      tap(sgCompanyId => this.setUpdatingCompany({ sgCompanyId, status: true })),
      withLatestFrom(this.user$),
      switchMap(([sgCompanyId, user]) =>
        this.adminUsersCompaniesService.deleteUserFromCompany(user.sgAccountId, sgCompanyId).pipe(
          tap({
            next: () => this.loadCompanies(user),
            error: () =>
              this.showSnackbarMessage({
                message: 'Could NOT delete user from company',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setUpdatingCompany({ sgCompanyId, status: false }))
        )
      )
    )
  );

  readonly changeRoleAndStatus = this.effect((companyRoleAndStatus$: Observable<CompanyRoleAndStatus>) =>
    companyRoleAndStatus$.pipe(
      tap(({ sgCompanyId }) => this.setUpdatingCompany({ sgCompanyId, status: true })),
      withLatestFrom(this.user$),
      switchMap(([{ sgCompanyId, role, status }, user]) =>
        this.adminUsersCompaniesService.editUserInCompany(user.sgAccountId, sgCompanyId, role, status).pipe(
          tap({
            next: () => {
              this.setUserRoleAndStatus({ sgCompanyId, role, status });
              this.showSnackbarMessage({
                message: 'User\'s role or status has been updated',
                styleClass: 'snackbarPass'
              });
            },
            error: () =>
              this.showSnackbarMessage({
                message: 'Could NOT update role or status',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setUpdatingCompany({ sgCompanyId, status: false }))
        )
      )
    )
  );

  readonly assignToCompany = this.effect((companyRoleAndStatus$: Observable<CompanyRoleAndStatus>) =>
    companyRoleAndStatus$.pipe(
      tap(() => this.setAssigningUserToCompany(true)),
      withLatestFrom(this.user$),
      switchMap(([{ sgCompanyId, role, status }, user]) =>
        this.adminUsersCompaniesService.assignUserToCompany(user.sgAccountId, sgCompanyId, role, status).pipe(
          tap({
            next: () => {
              this.assignToCompanySuccess$.next();
              this.loadCompanies(user);
              this.showSnackbarMessage({
                message: 'Company has been added to user',
                styleClass: 'snackbarPass'
              });
            },
            error: () =>
              this.showSnackbarMessage({
                message: 'Cannot add company to user (maybe company is already added to user)',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setAssigningUserToCompany(false))
        )
      )
    )
  );

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService
  ) {
    super({
      user: undefined,
      loadingCompanies: false,
      companies: [],
      updatingCompany: {},
      assigningUserToCompany: false
    });
    this.loadCompanies(
      this.user$.pipe(distinctUntilChanged((u1, u2) => u1?.sgAccountId === u2?.sgAccountId && u1?.deleted === u2?.deleted))
    );
  }

  private showSnackbarMessage(config: { message: string; styleClass: 'snackbarPass' | 'snackbarError' }): void {
    this.store.dispatch(AdminActions.showSnackbar(config));
  }
}

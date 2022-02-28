import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { isEmpty, isNil } from 'lodash-es';
import { EMPTY, MonoTypeOperatorFunction, Observable, OperatorFunction, pipe } from 'rxjs';
import { catchError, filter, finalize, first, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Company } from '@solargis/types/user-company';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { distinctByCompanyId } from 'ng-shared/user/utils/distinct-company.operator';

import { checkResponseSuccess, wrapInParenthesesIfNotEmpty } from '../../shared/admin.utils';
import { AdminUsersCompaniesService } from '../../shared/services/admin-users-companies.service';
import { DetailNavigationService } from '../../shared/services/detail-navigation.service';
import { EntityDetailState, EntityDetailStore, EntityDetailViewModel } from '../../shared/services/entity-detail.store';
import { AdminActions, fromAdmin } from '../../store';
import { CompaniesActions } from '../store';

export interface CompanyDetailState extends EntityDetailState<Company> {
  parent: Company;
  children: {
    removing: boolean;
    company: Company;
  }[];
}

export interface CompanyViewModel extends EntityDetailViewModel<Company>, CompanyDetailState {
  childrenEmpty: boolean;
  nameWithGroup: string;
}

@Injectable()
export class CompanyDetailStore extends EntityDetailStore<Company, CompanyDetailState> {
  readonly setParent = this.updater((state, parent: Company) => ({
    ...state,
    parent
  }));

  readonly setChildren = this.updater((state, children: Company[]) => ({
    ...state,
    children: children.map(company => ({ company, removing: false }))
  }));

  readonly setRemovingChild = this.updater((state, company: Company) => ({
    ...state,
    children: state.children.map(child => ({
      company: child.company,
      removing: child.company === company
    }))
  }));

  readonly viewModel$: Observable<CompanyViewModel> = this.select(this.createViewModel$(), this.state$, (entityViewModel, state) => ({
    ...entityViewModel,
    ...state,
    childrenEmpty: isEmpty(state.children),
    nameWithGroup: `${state.entity?.name ?? ''}${wrapInParenthesesIfNotEmpty(state.entity?.groupName)}`
  }));

  readonly create = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.unsavedEntity$.pipe(first())),
      this.upsertCompany({
        successMessage: 'Company has been created',
        errorMessage: 'Company could NOT be created',
        afterSuccess: (company: Company) => {
          this.clearChanges(company);
          this.detailNavigationService.toCompanyAndSelect(company);
        }
      })
    )
  );

  readonly update = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.unsavedEntity$.pipe(first())),
      this.upsertCompany({
        successMessage: 'Company data has been saved',
        errorMessage: 'Company data could NOT be saved',
        afterSuccess: (company: Company) => {
          this.clearChanges(company);
          this.detailNavigationService.toCompanyAndSelect(company);
        }
      })
    )
  );

  readonly loadParentCompany = this.effect((company$: Observable<Company>) =>
    company$.pipe(
      tap(() => this.setParent(undefined)),
      filter(company => !isEmpty(company?.parentSgCompanyId)),
      switchMap(company =>
        this.adminUsersCompaniesService.getCompany(company.parentSgCompanyId, true).pipe(
          tap({
            next: parent => this.setParent(parent),
            error: () =>
              this.showSnackbarMessage({
                message: 'Could NOT load parent company',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY)
        )
      )
    )
  );

  readonly loadChildCompanies = this.effect((company$: Observable<Company>) =>
    company$.pipe(
      tap(() => this.setChildren([])),
      filter(company => !isNil(company?.sgCompanyId)),
      switchMap(company =>
        this.adminUsersCompaniesService.getChildCompanies(company.sgCompanyId).pipe(
          tap({
            next: children => this.setChildren(children),
            error: () =>
              this.showSnackbarMessage({
                message: 'Could NOT load sub companies',
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY)
        )
      )
    )
  );

  readonly addChild = this.effect((company$: Observable<Company>) =>
    company$.pipe(
      withLatestFrom(this.entity$),
      map(([child, parent]) => ({
        ...child,
        parentSgCompanyId: parent.sgCompanyId
      })),
      this.upsertCompany({
        successMessage: 'Company has been assigned to parent',
        errorMessage: 'Company could NOT be assigned to parent',
        afterSuccess: () => this.loadChildCompanies(this.entity$.pipe(distinctByCompanyId()))
      })
    )
  );

  readonly removeChild = this.effect((company$: Observable<Company>) =>
    company$.pipe(
      tap(company => this.setRemovingChild(company)),
      map(child => ({
        ...child,
        parentSgCompanyId: null
      })),
      this.upsertCompany({
        successMessage: 'Company has been removed from parent',
        errorMessage: 'Company could NOT be removed from parent',
        afterSuccess: () => this.loadChildCompanies(this.entity$.pipe(distinctByCompanyId()))
      })
    )
  );

  readonly toggleIsMain = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(this.updateCompany(company => ({ ...company, isMainCompany: !company.isMainCompany })))
  );

  readonly toggleInspected = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(this.updateCompany(company => ({ ...company, inspected: !company.inspected })))
  );

  readonly toggleHistoric = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(this.updateCompany(company => ({ ...company, historic: !company.historic })))
  );

  readonly toggleDeleted = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.viewModel$.pipe(first())),
      filter(viewModel => this.checkChildrenEmpty(viewModel)),
      switchMap(viewModel => this.confirmToggleDeleted(viewModel.entity)),
      switchMap(() => this.entity$.pipe(first())),
      tap(() => this.setUpdating(true)),
      switchMap(company =>
        this.adminUsersCompaniesService.deleteCompany(company.sgCompanyId, !company.deleted).pipe(
          checkResponseSuccess(),
          tap({
            next: () => {
              this.showSnackbarMessage({
                message: `Company has been ${company.deleted ? 'undeleted' : 'deleted'}`,
                styleClass: 'snackbarPass'
              });
              if (!company.deleted) {
                this.store.dispatch(CompaniesActions.loadCompanies());
                this.close();
              } else {
                this.store.dispatch(CompaniesActions.select({ company: { ...company, deleted: false } }));
              }
            },
            error: () =>
              this.showSnackbarMessage({
                message: `Company could NOT be ${company.deleted ? 'undeleted' : 'deleted'}`,
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setUpdating(false))
        )
      )
    )
  );

  constructor(
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly store: Store<fromAdmin.State>,
    private readonly dialog: MatDialog,
    private readonly detailNavigationService: DetailNavigationService
  ) {
    super({
      parent: undefined,
      children: []
    });
    this.loadParentCompany(this.entity$.pipe(distinctByCompanyId()));
    this.loadChildCompanies(this.entity$.pipe(distinctByCompanyId()));
  }

  close(): void {
    this.detailNavigationService.close();
  }

  private updateCompany(updateFn: (company: Company) => Company): OperatorFunction<void, Company> {
    return pipe(
      switchMap(() => this.entity$.pipe(first())),
      map(updateFn),
      this.upsertCompany({
        successMessage: 'Company data has been saved',
        errorMessage: 'Company data could NOT be saved'
      })
    );
  }

  private upsertCompany(config: {
    successMessage: string;
    errorMessage: string;
    afterSuccess?: (company: Company) => void;
  }): MonoTypeOperatorFunction<Company> {
    return pipe(
      tap(() => this.setUpdating(true)),
      switchMap(company =>
        (isNil(company.sgCompanyId)
          ? this.adminUsersCompaniesService.createCompany(company)
          : this.adminUsersCompaniesService.updateCompany(company.sgCompanyId, company)
        ).pipe(
          checkResponseSuccess(),
          map(companyWithToken => companyWithToken.company),
          tap({
            next: updatedCompany => {
              this.store.dispatch(CompaniesActions.loadCompanies());
              this.store.dispatch(CompaniesActions.companyUpdated({company}));
              this.showSnackbarMessage({
                message: config.successMessage,
                styleClass: 'snackbarPass'
              });
              config.afterSuccess?.(updatedCompany);
            },
            error: () =>
              this.showSnackbarMessage({
                message: config.errorMessage,
                styleClass: 'snackbarError'
              })
          }),
          catchError(() => EMPTY),
          finalize(() => this.setUpdating(false))
        )
      )
    );
  }

  private confirmToggleDeleted(company: Company): Observable<boolean> {
    return this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          heading: 'Company deletion',
          text: company.deleted
            ? 'Do you really want to return company between other companies ?'
            : 'Do you really want to delete company ?'
        }
      })
      .afterClosed()
      .pipe(filter(result => result === true));
  }

  private checkChildrenEmpty(viewModel: CompanyViewModel): boolean {
    if (!viewModel.childrenEmpty) {
      this.showSnackbarMessage({
        message:
          'Parent company can not be deleted if it contains one or more linked companies. Please remove the links or linked companies!',
        styleClass: 'snackbarError'
      });
    }
    return viewModel.childrenEmpty;
  }

  private showSnackbarMessage(config: { message: string; styleClass: 'snackbarPass' | 'snackbarError'; duration?: number }): void {
    this.store.dispatch(AdminActions.showSnackbar(config));
  }
}

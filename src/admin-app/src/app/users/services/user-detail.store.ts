import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { EMPTY, MonoTypeOperatorFunction, Observable, pipe } from 'rxjs';
import { catchError, filter, finalize, first, map, switchMap, tap } from 'rxjs/operators';

import { Company, User } from '@solargis/types/user-company';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';

import { checkResponseSuccess } from '../../shared/admin.utils';
import { AdminUsersCompaniesService } from '../../shared/services/admin-users-companies.service';
import { DetailNavigationService } from '../../shared/services/detail-navigation.service';
import { EntityDetailState, EntityDetailStore } from '../../shared/services/entity-detail.store';
import { AdminActions, fromAdmin } from '../../store';
import { UsersActions } from '../store';

interface UserDetailState extends EntityDetailState<User> {
  companies: Company[];
}

@Injectable()
export class UserDetailStore extends EntityDetailStore<User, UserDetailState> {
  private readonly defaultUpsertConfig = {
    successMessage: 'User data has been saved',
    errorMessage: 'User data could NOT be saved',
    afterSuccess: (user: User) => {
      this.clearChanges(user);
      this.detailNavigationService.toUser(user);
    }
  };

  readonly toggleInspected = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.entity$.pipe(first())),
      map(user => ({ ...user, inspected: !user.inspected })),
      this.upsert(this.defaultUpsertConfig)
    )
  );

  readonly toggleDeleted = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.entity$.pipe(first())),
      switchMap(user => this.confirmToggleDeleted(user)),
      map(user => ({ ...user, deleted: !user.deleted })),
      this.upsert(this.defaultUpsertConfig)
    )
  );

  readonly update = this.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.unsavedEntity$.pipe(first())),
      this.upsert(this.defaultUpsertConfig)
    )
  );

  constructor(
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly store: Store<fromAdmin.State>,
    private readonly dialog: MatDialog,
    private readonly detailNavigationService: DetailNavigationService
  ) {
    super();
  }

  private showSnackbarMessage(config: { message: string; styleClass: 'snackbarPass' | 'snackbarError' }): void {
    this.store.dispatch(AdminActions.showSnackbar(config));
  }

  private upsert(config: {
    successMessage: string;
    errorMessage: string;
    afterSuccess?: (user: User) => void;
  }): MonoTypeOperatorFunction<User> {
    return pipe(
      tap(() => this.setUpdating(true)),
      switchMap(user =>
        (isNil(user.sgAccountId)
          ? this.adminUsersCompaniesService.createUser(user)
          : this.adminUsersCompaniesService.updateUser(user)
        ).pipe(
          checkResponseSuccess(),
          tap({
            next: updatedUser => {
              this.store.dispatch(UsersActions.update({ user: updatedUser }));
              this.showSnackbarMessage({
                message: config.successMessage,
                styleClass: 'snackbarPass'
              });
              config.afterSuccess?.(updatedUser);
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

  private confirmToggleDeleted(user: User): Observable<User> {
    return this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          heading: 'User deletion',
          text: user.deleted ? 'Do you really want to return user between other users ?' : 'Do you really want to delete user ?'
        }
      })
      .afterClosed()
      .pipe(
        filter(result => result === true),
        map(() => user)
      );
  }
}

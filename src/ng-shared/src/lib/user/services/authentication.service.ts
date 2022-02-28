import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Action, Store } from '@ngrx/store';

import { CompanyInvitationDetail } from '@solargis/types/user-company';

import { Config } from '../../config';
import { Auth0Logout } from '../actions/auth.actions';
import { ChangePasswordDialogComponent } from '../components/change-password/change-password.dialog';
import { ConfirmTermsDialogComponent } from '../components/confirm-terms/confirm-terms.dialog';
import { EmailVerifyDialogComponent } from '../components/email-verify/email-verify.dialog';
import { ForgotPasswordDialogComponent } from '../components/forgot-password/forgot-password.dialog';
import { ForgotPasswordChangeDialogComponent } from '../components/fotgot-password-change/forgot-password-change.dialog';
import { LoginDialogComponent } from '../components/login/login.dialog';
import { RegistrationDialogComponent } from '../components/registration-dialog/registration-dialog.component';
import { UserInvitationDialogComponent } from '../components/user-invitation-dialog/user-invitation-dialog.component';
import { State } from '../reducers';
import { AuthDialogOptions } from '../types';

/**
 * Service for invoking (show) Auth module components (registration, login, ... popups)
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  isForgotPasswordDialogOpen = false;

  constructor(
    private readonly config: Config,
    private readonly store: Store<State>,
    public dialog: MatDialog) { }

  /**
   * Open dialog window with registration form
   * When closing registration dialog -> if is returned 'openLogin' flag, login dialog will be open
   * Email, as pre-defiend value, can be also be send
   */
  openRegistration(email?: string, afterSuccessAction?: Action, opts?: AuthDialogOptions, skipTrial?: boolean): void {
    this.dialog.open(RegistrationDialogComponent, {
      data: {
        email,
        afterSuccessAction,
        opts,
        skipTrial
      }
    }).afterClosed()
      .subscribe(result => {
        if (result && result.openLogin) {
          this.openLogin(result.email, afterSuccessAction);
        }
      });
  }

  /**
   * Open dialog window with login form
   * When closing login dialog -> if is returned 'openRegistration' flag, registration dialog will be open
   * Email, as pre-defiend value, can be also be send
   */
  openLogin(
    email?: string,
    afterSuccessAction?: Action,
    opts?: AuthDialogOptions,
    fromInvitation?: boolean
  ): MatDialogRef<LoginDialogComponent> {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      data: {
        email,
        afterSuccessAction,
        opts,
        fromInvitation
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.openRegistration) {
        this.openRegistration(result.email, afterSuccessAction);
      }
      if (result && result.openForgotPassword) {
        this.openForgotPassword(result.email, true);
      }
    });

    return dialogRef;
  }

  /**
   * Open dialog window to accept invitation
   * When closing registration dialog -> if is returned 'openRegistration' flag, registration dialog will be open
   * Email, as pre-defiend value, can be also be send
   */
  openInvitation(
    invitation: CompanyInvitationDetail,
    afterSuccessAction?: Action,
    opts?: AuthDialogOptions,
    notRegistered?: boolean
  ): void {
    this.dialog.closeAll(); // close all dialogs opened before - e.g. LoginDialogComponent
    this.dialog.open(UserInvitationDialogComponent, {
      data: {
        email: invitation.email,
        companyName: invitation.company.name,
        afterSuccessAction,
        opts,
        notRegistered
      }
    }).afterClosed()
      .subscribe(result => {
        if (result && result.openRegistration) {
          this.openRegistration(invitation.email, afterSuccessAction, opts, true);
        }
        if (result && result.claimTrial) {
          this.store.dispatch(afterSuccessAction);
        }
      });
  }

  /**
   * Logout user - dispatch event to clean user reference in store
   */
  logout(): void {
    this.store.dispatch(new Auth0Logout());
  }

  /**
   * Open dialog - change password
   */
  changePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent).afterClosed().subscribe(result => {
      if (result && result.openForgotPassword) {
        this.openForgotPassword(result.email, false);
      }
    });
  }

  /**
   * Open dialog window with email verification (auth0 registration confirmation)
   */
  openEmailVerification(): void {
    this.dialog.open(EmailVerifyDialogComponent);
  }

  /**
   * Open dialog window with request to change (reset) password.
   * To client email is send url (callback url) - to reset password.
   *
   * In data can be send email - this email will be pre-filled in email field.
   * Also when user close dialog, returned is email which has been filled in email field.
   */
  openForgotPassword(email?: string, fromLogin?: boolean): void {
    this.dialog.open(ForgotPasswordDialogComponent, {
      data: {
        email
      }
    }).afterClosed()
      .subscribe(result => {
        if (result && result.goBack && fromLogin) {
          this.openLogin(result.email);
        }
        if (result && result.goBack && !fromLogin) {
          this.changePassword();
        }
      });
  }

  /**
   * Open dialog window where user can change password.
   * In url (e.g. in store) should be already stored valid token (token is request in 'openForgotPassword' dialog).
   */
  openChangePasswordToken(): void {
    if (!this.isForgotPasswordDialogOpen) {
      this.isForgotPasswordDialogOpen = true;
      this.dialog.open(ForgotPasswordChangeDialogComponent).afterClosed()
        .subscribe(() => {
          this.isForgotPasswordDialogOpen = false;
        });
    }
  }

  /**
   * Open confirm SG2 terms popup
   */
  openConfirmTerms(): void {
    this.dialog.open(ConfirmTermsDialogComponent, { disableClose: true }).afterClosed().subscribe(result => {
      if (!result || !result.confirmDone) {
        this.logout();
      }
    });
  }
}

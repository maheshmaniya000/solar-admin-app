import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { merge } from 'rxjs';
import { catchError, delay, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import {
  CompanyInvitationDetail,
  CompanyWithToken,
  isProspectSubscriptionExpired,
  ProspectLicenseType
} from '@solargis/types/user-company';

import { AddAlert, CloseAlerts } from 'ng-shared/core/actions/alerts.actions';
import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { prospectPricingUrl } from 'ng-shared/shared/utils/url.utils';
import { RequestTrialDialogComponent } from 'ng-shared/user-shared/components/request-trial-dialog/request-trial-dialog.component';

import { UrlParamsAction, URL_PARAMS_INIT } from '../../core/actions/url-params.actions';
import { Alert, createAlert } from '../../core/types';
import { UserData } from '../actions/auth.actions';
import {
  AcceptCompanyInvitation,
  ACCEPT_COMPANY_INVITATION,
  NewCompany,
  NEW_COMPANY,
  ReloadCompany,
  RELOAD_COMPANY,
  RELOAD_COMPANY_LIST,
  SelectCompany,
  SELECT_COMPANY,
  StoreCompanyList,
  STORE_COMPANY_LIST,
  UnselectCompany,
  UNSELECT_COMPANY,
  UpdateCompany,
  UPDATE_COMPANY
} from '../actions/company.actions';
import { CompanyWelcomeDialogComponent } from '../components/company-welcome-dialog/company-welcome-dialog.component';
import { State } from '../reducers';
import { selectUser } from '../selectors/auth.selectors';
import { selectActiveOrNoCompany } from '../selectors/company.selectors';
import { AuthenticationService } from '../services/authentication.service';
import { CompanyService } from '../services/company.service';
import { UserService } from '../services/user.service';
import { AuthDialogOptions } from '../types';
import { distinctByCompanyId } from '../utils/distinct-company.operator';


@Injectable()
export class CompanyEffects {

  @Effect()
  reload$ = this.actions$.pipe(
    ofType(RELOAD_COMPANY_LIST),
    switchMap(() => this.companyService.listCompanies()),
    map(companies => new StoreCompanyList(companies))
  );

  @Effect()
  storeSelectedCompany$ = merge(
    this.actions$.pipe(
      ofType<SelectCompany>(SELECT_COMPANY),
      filter(action => !(action.opts && action.opts.skipSaveOnBackend)),
      map(action => action.payload)
    ),
    this.actions$.pipe(
      ofType<UnselectCompany>(UNSELECT_COMPANY),
      filter(action => !(action.opts && action.opts.skipSaveOnBackend)),
      map(() => null)
    ),
  ).pipe(
    withLatestFrom(this.store.pipe(selectUser), (sgCompanyId, user) => [sgCompanyId, user.sgAccountId]),
    switchMap(([sgCompanyId, sgAccountId]) => this.userService.storeSelectedCompany(sgAccountId, sgCompanyId)),
    map(user => new UserData(user))
  );

  @Effect()
  reloadSingleCompany$ = this.actions$.pipe(
    ofType<ReloadCompany>(RELOAD_COMPANY),
    switchMap(({ payload: sgCompanyId }) => this.companyService.loadCompany(sgCompanyId)),
    map(cwt => new UpdateCompany(cwt))
  );

  /**
   * After create company request, show success dialog and select the company
   */
  @Effect()
  initNewCompany$ = this.actions$.pipe(
    ofType<NewCompany>(NEW_COMPANY),
    // wait 1 second to redirect and open dialog
    delay(1000),
    tap(action => {
      if (!action.dialogOptions || !action.dialogOptions.isNewCompany) {
        this.store.dispatch(new AmplitudeTrackEvent('company_create', { company: { country: action.payload.company.country }}));
      }
    }),
    tap(action => {
      if (action.showConfirmation) {
        this.dialog.open(CompanyWelcomeDialogComponent, {
          data: {
            company: action.payload.company,
            options: action.dialogOptions
          }
        });
      }
    }),
    switchMap(action => [
      new UpdateCompany(action.payload),
      new SelectCompany(action.payload.company.sgCompanyId)
    ])
  );

  /**
   * Handle add user to company request (when user confirms the email)
   */
  @Effect()
  handleAssignToCompanyRequest = this.actions$.pipe(
    ofType<UrlParamsAction>(URL_PARAMS_INIT),
    map(action => action.payload['company-invite-token']),
    filter(x => !!x),
    switchMap(id => this.companyService.getCompanyInvitationInfo(id)),
    filter(invitation => invitation && Object.keys(invitation).length > 0 && !invitation.used),
    switchMap(invitation =>
      this.store.pipe(selectUser, map(user => ([invitation, user])))
    ),
    map(([invitationArg, user]) => {
      const invitation = invitationArg as any as CompanyInvitationDetail;
      const action = new AcceptCompanyInvitation(invitation, true);
      const actionWithoutConfirmation = new AcceptCompanyInvitation(invitation);

      if (!user) {
        const opts = {
          disableEmailEdit: true,
          disableDialogSwitch: true,
          disableCompanyCreation: true,
          showTermsAndConditions: true,
          companyInvitationTokenId: invitation.id,
        } as AuthDialogOptions;

        if (invitation.isRegistered) {
          this.authService.openLogin(invitation.email, action, opts, true);
        } else {
          this.authService.openInvitation(invitation, actionWithoutConfirmation, opts, true);
        }
      } else {
        if (invitation.isRegistered) {
          if (invitation.email.toLowerCase() === user.email.toLowerCase()) {
            this.authService.openInvitation(invitation, action);
          }
          return null;
        }
        return actionWithoutConfirmation;
      }
    }),
    catchError(({error}) => {
      if (error.error === 'token.expired') {
        this.dialog.closeAll();
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            heading: 'auth.invitation.expiredTitle',
            text: 'auth.invitation.expiredText',
            actions: [{ text: 'common.action.ok', value: null, default: true }]
          }
        });
        return null;
      }
      throw error;
    }),
    filter(x => !!x)
  );

  /**
   * Handle company invite action
   */
  @Effect()
  acceptCompanyInvitation$ = this.actions$.pipe(
    ofType<AcceptCompanyInvitation>(ACCEPT_COMPANY_INVITATION),
    switchMap(action => this.companyService.acceptCompanyInvitation(action.payload.id).pipe(map(result => [action, result]))),
    filter(([, result]) => !!result),
    map(([action, cwt]: [AcceptCompanyInvitation, CompanyWithToken] ) => {
      if (!cwt.company.sgCompanyId) {
        cwt.company.sgCompanyId = action.payload.company.sgCompanyId;
      }
      return action.showConfirmation ? new NewCompany(cwt, true, { isNewCompany: false }) : new NewCompany(cwt);
    })
  );

  @Effect({ dispatch: false})
  redirectOnChangeCompany$ = this.actions$.pipe(
    ofType<SelectCompany | UnselectCompany>(SELECT_COMPANY, UNSELECT_COMPANY),
    map(() => this.router.url),
    tap(console.log),
    tap(url => {
      if (url.startsWith('/detail/') || url.startsWith('/compare/')) {
        this.router.navigateByUrl('/');
      }
    })
  );

  @Effect()
  amplitude$ = this.actions$.pipe(
    ofType<SelectCompany | UnselectCompany>(SELECT_COMPANY, UNSELECT_COMPANY),
    map(() => new AmplitudeTrackEvent('company_select'))
  );

  companyAlerts: Alert[] = [];

  @Effect()
  handleCompanyAlerts$ = this.actions$.pipe(
    ofType<UpdateCompany | StoreCompanyList>(UPDATE_COMPANY, STORE_COMPANY_LIST),
    switchMap(() => this.store.pipe(
      selectActiveOrNoCompany,
      distinctByCompanyId(),
      map(company => {
        const createdAlerts: Alert[] = [];

        if (company) {
          const license = company.prospectLicense;

          if (license && isProspectSubscriptionExpired(license)) {
            // EXPIRED SUBSCRIPTION
            createdAlerts.push(createAlert({
              severity: 'warning',
              text: license.licenseType === ProspectLicenseType.FreeTrial ?
              'common.alert.subscription.expiredTrial' : 'common.alert.subscription.expired',
              click: {
                text: license.licenseType === ProspectLicenseType.FreeTrial ?
                'common.alert.subscription.renewTrial' : 'common.alert.subscription.renew',
                href: prospectPricingUrl
              }
            }));
          } else if (license && license.licenseType === ProspectLicenseType.FreeTrial) {
            if (license.remainingFreeTrialProjects > 0) {
              // HAS TRIAL WITH UNCLAIMED PROJECTS
              createdAlerts.push(createAlert({
                severity: 'info',
                text: 'common.alert.freetrial.available',
                highlightedText: 'common.alert.freetrial.viewDetail',
                routes: ['prospect/map', 'prospect/list'],
              }));
            } else {
              // HAS TRIAL WITH NO PROJECTS
              createdAlerts.push(createAlert({
                severity: 'info',
                text: 'common.alert.freetrial.assigned',
                click: {
                  text: 'common.alert.freetrial.assignedAction',
                  href: prospectPricingUrl
                }
              }));
            }
          } else if (!license) {
            // DOES NOT HAVE LICENSE
            createdAlerts.push(createAlert({
              severity: 'info',
              text: 'common.alert.freetrial.noSubscription',
              click: {
                text: 'common.alert.freetrial.noSubscriptionAction',
                clickFn: () => {
                  this.dialog.open(RequestTrialDialogComponent, { data: { app: 'prospect' } });
                }
              }
            }));
          }
        }
        return createdAlerts;
      }),
      switchMap(alertsToCreate => {
        const actions = alertsToCreate.map(a => new AddAlert(a));
        if (this.companyAlerts.length) {
          const alertsToDelete = new CloseAlerts(this.companyAlerts);
          this.companyAlerts = alertsToCreate;
          return [ alertsToDelete, ...actions ];
        } else {
          this.companyAlerts = alertsToCreate;
          return actions;
        }
      })
    ))
  );

  constructor(
    private readonly actions$: Actions,
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
    private readonly authService: AuthenticationService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly store: Store<State>
  ) {}
}

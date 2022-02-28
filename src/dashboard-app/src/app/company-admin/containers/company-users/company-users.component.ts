import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, first, map, publishReplay, refCount, shareReplay, switchMap, tap } from 'rxjs/operators';

import {
  Company,
  CompanyInvitationListItem,
  UpdateUserCompanyOpts,
  User,
  UserCompany,
  UserCompanyRole,
  UserCompanyStatus
} from '@solargis/types/user-company';
import { sum } from '@solargis/types/utils';

import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { State } from 'ng-shared/user/reducers';
import { selectUser } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';
import { CompanyService } from 'ng-shared/user/services/company.service';
import { getAppSubscription, hasAppSubscriptionSlot } from 'ng-shared/user/utils/company.utils';

import { UpdateCompanyApp } from '../../actions/company-app.actions';
import { InviteUserToCompanyDialogComponent } from '../../components/invite-user-to-company-dialog/invite-user-to-company-dialog.component';

@Component({
  selector: 'sg-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss']
})
export class CompanyUsersComponent implements OnInit {

  company$: Observable<Company>;
  myUserEmail: string;

  /* check if there are multiple admins on company */
  hasMultipleAdmins$: Observable<boolean>;
  users$: Observable<(UserCompany & User)[]>;
  columns = [/*'checked',*/ 'name', 'email', 'role', 'status', 'actions'];

  invitations$: Observable<CompanyInvitationListItem[]>;
  hasInvitation$: Observable<boolean>;
  invitationsColumns = ['email', 'ts'];

  allowedRoles: UserCompanyRole[] = ['ADMIN', 'USER'];
  allowedStatus: UserCompanyStatus[] = ['ACTIVE', 'SUSPENDED'];

  reloadingInvitations = false;

  getAppSubscription = getAppSubscription;

  constructor(
    private readonly store: Store<State>,
    private readonly dialog: MatDialog,
    private readonly companyService: CompanyService
  ) { }

  ngOnInit(): void {
    this.company$ = this.store.pipe(selectActiveOrNoCompany);

    this.store.pipe(selectUser)
      .pipe(map(user => user.email), first())
      .subscribe(email => this.myUserEmail = email);

    // load users
    this.users$ = this.company$.pipe(
      distinctUntilChanged(),
      filter(c => !!c),
      switchMap(company => this.companyService.listUsersForCompany(company.sgCompanyId)),
      shareReplay()
    );
    this.hasMultipleAdmins$ = this.users$.pipe(
      map(companyUsers => sum(companyUsers.map(u => Number(u.role === 'ADMIN')))),
      map(adminsCount => adminsCount > 1)
    );

    this.loadInvitations();
  }

  assignUserToCompany(): void {
    this.company$.pipe(
      switchMap(company => this.dialog.open(InviteUserToCompanyDialogComponent, {
          width: '450px',
          data: company
        }).afterClosed()
      ),
      first(),
      filter(x => !!x),
    ).subscribe(() => {
      this.reloadingInvitations = true;
      this.loadInvitations();
    });
  }

  updateRole(company: Company, user: UserCompany, role: UserCompanyRole): void {
    const req: UpdateUserCompanyOpts = { role, status: user.status };
    return this.updateUserCompany(company, user, req);
  }

  updateStatus(company: Company, user: UserCompany, status: UserCompanyStatus): void {
    const req: UpdateUserCompanyOpts = { status, role: user.role };
    return this.updateUserCompany(company, user, req);
  }

  deleteUser(company: Company, user: UserCompany): void {
    this.users$ = combineLatest([
      this.users$,
      this.dialog.open(ConfirmationDialogComponent, { width: '300px', minHeight: '200px'}).afterClosed()
    ]).pipe(
      first(),
      switchMap(([users, res]) => {
        if (res) {
          return this.companyService.deleteUserFromCompany(company, user);
        } else {
          return of(users);
        }
      }),
      shareReplay()
    );
  }

  // ttl is coming from DynamoDB in seconds and we need date in milliseconds
  secondsToMilliseconds(ttl: number): number {
    return ttl * 1000;
  }

  hasAppSubscription(company: Company): boolean {
    return !!getAppSubscription(company, 'prospect') || !!getAppSubscription(company, 'sdat');
  }

  isNotLoggedIn(user: User): boolean {
    return user.email !== this.myUserEmail;
  }

  canAssignUser(user: User, company: Company, app: 'prospect' | 'sdat'): boolean {
    const subscription = getAppSubscription(company, app);
    return hasAppSubscriptionSlot(company, app) && !subscription?.assignedUsers?.includes(user.sgAccountId);
  }

  changeUserAssignmentToSubscription(user: User, company: Company, app: 'prospect' | 'sdat'): void {
    const subscription = getAppSubscription(company, app);

    if (subscription) {
      let assignedUsers: string[];

      if (this.canAssignUser(user, company, app)) { // assign user from subscription
        assignedUsers = [...(subscription.assignedUsers || []), user.sgAccountId];
      } else { // remove user from subscription
        assignedUsers = subscription.assignedUsers.filter(u => u !== user.sgAccountId);
      }

      this.store.dispatch(new UpdateCompanyApp(app, { assignedUsers }));
    }
  }

  private updateUserCompany(company: Company, user: UserCompany, req: UpdateUserCompanyOpts): void {
    this.users$ = this.companyService.updateUserInCompany(company, user, req).pipe(
      shareReplay()
    );
  }

  private loadInvitations(): void {
    this.invitations$ = this.company$.pipe(
      switchMap(company => this.companyService.listCompanyInvitations(company)),
      tap(() => this.reloadingInvitations = false),
      publishReplay(),
      refCount()
    );
    this.hasInvitation$ = this.invitations$.pipe(map(inv => !!inv && inv.length > 0));
  }
}

import { Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Project } from '@solargis/types/project';
import { CompanyWithToken } from '@solargis/types/user-company';

import { selectSelectedEnergySystemProject } from 'ng-project/project-detail/selectors';
import { isFreetrialProject } from 'ng-project/project/utils/project-freetrial.utils';

import { Config } from '../../../config';
import { isUserLoading } from '../../../user/selectors/auth.selectors';
import { selectActiveOrNoCompany, selectCompanyList, selectIsFreetrialActive } from '../../../user/selectors/company.selectors';
import { selectHasUserCompareAccess, selectIsUserAdmin } from '../../../user/selectors/permissions.selectors';
import { AuthenticationService } from '../../../user/services/authentication.service';
import { isCompanyAdmin } from '../../../user/utils/company.utils';
import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';
import { HeaderCore } from './header-core';


@Component({
  selector: 'sg-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None
})

export class HeaderComponent extends HeaderCore implements OnInit {
  isAccountMenuActive = false;
  isAppMenuActive = false;
  isMobileMenuActive = false;
  path: string;

  currentAppTranslateKey$: Observable<string>;

  companyList$: Observable<CompanyWithToken[]> = of([]);
  isCompanyAdmin$: Observable<boolean>;
  isSolargisAdmin$: Observable<boolean>;
  isAccountOverviewReady$: Observable<boolean>;

  project$: Observable<Project>;
  freeTrial$: Observable<boolean>;

  hasCompareAccess: boolean;

  @ViewChild(MobileMenuComponent, { read: ElementRef }) mobileMenu: ElementRef;

  constructor(
    authenticationService: AuthenticationService,
    router: Router,
    store: Store<any>,
    config: Config,
    dialog: MatDialog
  ) {
    super(authenticationService, router, store, config, dialog);
  }

  @HostListener('document:click', ['$event.target'])
  clickedOutside(targetElement): void {
    if (this.isAccountMenuActive) {this.isAccountMenuActive = false;}
    if (this.isAppMenuActive) {this.isAppMenuActive = false;}

    const clickedInMobileMenu = this.mobileMenu && this.mobileMenu.nativeElement.contains(targetElement);
    if (!clickedInMobileMenu && this.isMobileMenuActive) {this.isMobileMenuActive = false;}
  }

  ngOnInit(): void {
    this.companyList$ = this.store.pipe(selectCompanyList);
    this.company$ = this.store.pipe(selectActiveOrNoCompany);
    this.isSolargisAdmin$ = this.store.pipe(selectIsUserAdmin);

    // There might be a case when user has selected company which does not exists
    // therefore wait only for company list
    this.isAccountOverviewReady$ = combineLatest([
      this.user$,
      this.userData$,
      this.companyList$
    ]).pipe(
      map(([user, userData, companyList]) =>
        !user || (!!userData && ((userData.selectedSgCompanyId && !!companyList) || !userData.selectedSgCompanyId))
      ));

    this.isAccountOverviewReady$ = this.store.pipe(
      isUserLoading,
      map(loading => !loading)
    );

    this.currentAppTranslateKey$ = this.currentApp$.pipe(
      map(app => app ? 'header.' + app : '')
    );

    this.isCompanyAdmin$ = combineLatest(this.company$, this.user$).pipe(
      map(([company, user]) => isCompanyAdmin(company, user)),
    );

    this.project$ = this.store.pipe(selectSelectedEnergySystemProject);

    this.freeTrial$ = combineLatest([this.project$, this.store.pipe(selectIsFreetrialActive)]).pipe(
      map(([project, freetrialActive]) => freetrialActive && isFreetrialProject(project))
    );

    this.subscriptions.push(
      this.store.pipe(selectHasUserCompareAccess).subscribe(hasAccess => this.hasCompareAccess = hasAccess)
    );
  }

  openAppMenu(e): void {
    e.stopPropagation();
    this.isAppMenuActive = !this.isAppMenuActive;
    this.isAccountMenuActive = false;
    this.isMobileMenuActive = false;
  }

  openAccountMenu(e): void {
    e.stopPropagation();
    this.isAccountMenuActive = !this.isAccountMenuActive;
    this.isAppMenuActive = false;
    this.isMobileMenuActive = false;
  }

  openMobileMenu(e): void {
    e.stopPropagation();
    this.isMobileMenuActive = !this.isMobileMenuActive;
    this.isAppMenuActive = false;
    this.isAccountMenuActive = false;
  }

  isCompareActive(): boolean {
    return this.router.isActive('compare', false);
  }

  adminTabClick(link: string): void {
    this.router.navigate(['/' + link]);
  }

  isAdminTabActive = (link: string): boolean => this.router.isActive(link, false);
}

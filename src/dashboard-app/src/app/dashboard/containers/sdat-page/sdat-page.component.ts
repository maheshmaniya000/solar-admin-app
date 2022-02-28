import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { Company, User } from '@solargis/types/user-company';

import { Config } from 'ng-shared/config';
import { State } from 'ng-shared/core/reducers';
import { selectUserData } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany, selectHasAppSubscription } from 'ng-shared/user/selectors/company.selectors';
import { hasUserAppSubscription, isCompanyAdmin } from 'ng-shared/user/utils/company.utils';

@Component({
  selector: 'sg-sdat-page',
  templateUrl: './sdat-page.component.html',
  styleUrls: ['./sdat-page.component.scss']
})
export class SDATPageComponent implements OnInit, OnDestroy {
  private static readonly iconBaseUrl = 'assets/img/icons/';
  private readonly destroyed$ = new Subject<void>();

  user$: Observable<User>;
  company$: Observable<Company>;

  isCompanyAdmin$: Observable<boolean>;
  hasCompanySDATSubscription$: Observable<boolean>;
  hasUserSDATSubscription: Observable<boolean>;

  readonly downloadIcon = `${SDATPageComponent.iconBaseUrl}download_30px.svg`;
  readonly manualIcon = `${SDATPageComponent.iconBaseUrl}manual_30px.svg`;
  readonly subscriptionIcon = `${SDATPageComponent.iconBaseUrl}subscription_30px.svg`;
  readonly devicesIcon = `${SDATPageComponent.iconBaseUrl}devices_30px.svg`;

  downloadSdatOptions: { url: string; text: string }[] = [
    {
      url: `/SDAT_Installer.exe`,
      text: 'Windows'
    },
    {
      url: `/SDAT_amd64_cp39.dmg`,
      text: 'MacOS'
    },
    {
      url: `/sdat_lin_amd64.tar.xz`,
      text: 'Linux / UNIX'
    }
  ];

  constructor(
    private readonly store: Store<State>,
    private readonly config: Config,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.downloadSdatOptions = this.downloadSdatOptions.map(sdat => ({...sdat, url: this.config.sdatDownloadUrl.concat(sdat.url)}));
    this.user$ = this.store.pipe(selectUserData);
    this.company$ = this.store.pipe(selectActiveOrNoCompany);
    this.hasCompanySDATSubscription$ = this.store.pipe(selectHasAppSubscription('sdat'));

    this.hasUserSDATSubscription = combineLatest([this.company$, this.user$]).pipe(
      map(([company, user]) => hasUserAppSubscription(company, user, 'sdat'))
    );

    this.isCompanyAdmin$ = combineLatest([this.company$, this.user$]).pipe(
      map(([company, user]) => isCompanyAdmin(company, user))
    );

    this.company$.pipe(
      filter(isNil),
      takeUntil(this.destroyed$)
    ).subscribe(() => this.router.navigateByUrl('/'));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }
}

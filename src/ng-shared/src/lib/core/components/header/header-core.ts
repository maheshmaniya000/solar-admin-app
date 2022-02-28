import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith, filter } from 'rxjs/operators';

import { ProjectId } from '@solargis/types/project';
import {
  Company,
  ProspectLicenseType,
  SolargisApp,
  User
} from '@solargis/types/user-company';

import { Config } from 'ng-shared/config';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import {
  prospectPricingUrl,
  prospectUpgradeUrl
} from 'ng-shared/shared/utils/url.utils';
import { CompanyListItem } from 'ng-shared/user/types';

import { RequestTrialDialogComponent } from '../../../user-shared/components/request-trial-dialog/request-trial-dialog.component';
import {
  selectUser,
  selectUserData
} from '../../../user/selectors/auth.selectors';
import {
  selectActiveOrNoCompany,
  selectCompanyList
} from '../../../user/selectors/company.selectors';
import { AuthenticationService } from '../../../user/services/authentication.service';
import { SettingsTranslateLang } from '../../actions/settings.actions';
import { availableLanguages } from '../../models';
import { HeaderTabLink, Language, TranslateSettings } from '../../types';
import { getAppByUrl } from '../app-menu/app-menu.apps';

export class HeaderCore extends SubscriptionAutoCloseComponent {
  prospectTabLinks: HeaderTabLink[] = [
    { label: 'header.map', link: 'map', icon: 'sg:sgf-map' },
    { label: 'header.projects', link: 'list', icon: 'sg:sgf-project' }
  ];

  adminTabLinks: HeaderTabLink[] = [
    { label: 'header.companies', link: 'list/companies', icon: 'business' },
    { label: 'header.users', link: 'list/users', icon: 'person' },
    { label: 'header.products', link: 'list/products', icon: 'import_contacts' },
    { label: 'header.orders', link: 'list/orders', icon: 'shopping_cart' },
    { label: 'header.invoices', link: 'list/invoices', icon: 'insert_drive_file' }
  ];

  projectDetailId$: Observable<ProjectId>;

  languages: Language[];
  currentLanguage$: Observable<Language>;

  currentApp$: Observable<string>;

  user$: Observable<User>;
  userData$: Observable<User>;
  companyListWithUser$: Observable<CompanyListItem[]>;
  company$: Observable<Company>;
  selectedCompany$: Observable<Company>;
  prospectLicenseButton$: Observable<string>;

  constructor(
    public authenticationService: AuthenticationService,
    public router: Router,
    public store: Store<any>,
    public config: Config,
    public dialog: MatDialog
  ) {
    super();
    this.languages = availableLanguages.filter(
      lang =>
        !this.config.languages || this.config.languages.includes(lang.lang)
    );

    this.projectDetailId$ = this.store
      .select('header')
      .pipe(map(header => header.projectDetail && header.projectDetail._id));

    this.currentLanguage$ = this.store.select('settings', 'translate').pipe(
      map((translate: TranslateSettings) => translate.lang),
      map(lang => this.languages.find(l => l.lang === lang))
    );

    this.user$ = this.store.pipe(selectUser);
    this.userData$ = this.store.pipe(selectUserData);
    this.company$ = this.store.pipe(selectActiveOrNoCompany);

    // FIXME: we already have current app as angular provider with constant value, usage as:
    // FIXME: @Inject(APP_TOKEN) app: string
    // TODO add current app to ngrx state, we will need it elsewhere
    this.currentApp$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => window.location.pathname),
      distinctUntilChanged(),
      map(url => {
        const app = getAppByUrl(url);
        if (app) {
          return app.name;
        } else {return '';}
      }),
      distinctUntilChanged(),
      startWith('prospect')
    );

    this.prospectLicenseButton$ = this.company$.pipe(
      map((company: Company) => {
        if (company) {
          const { prospectLicense } = company;
          if (prospectLicense) {
            const { licenseType } = prospectLicense;
            switch (licenseType) {
              case ProspectLicenseType.Pro:
                return 'NONE';
              case ProspectLicenseType.FreeTrial:
              case ProspectLicenseType.Basic:
                return 'UPGRADE';
            }
          } else {return 'FREETRIAL';}
        }
        return 'PRICING';
      }),
      startWith('PRICING')
    );

    this.selectedCompany$ = this.store.pipe(selectActiveOrNoCompany);

    this.companyListWithUser$ = this.store.pipe(
      selectCompanyList,
      map(companyList => {
        const companyListItem: CompanyListItem[] = [{}];
        return companyListItem.concat(companyList);
      })
    );
  }

  changeLang(lang: string): void {
    this.store.dispatch(new SettingsTranslateLang(lang));
  }

  registration(): void {
    this.authenticationService.openRegistration();
  }

  login(): void {
    this.authenticationService.openLogin();
  }

  requestFreeTrial(app: SolargisApp): void {
    this.dialog.open(RequestTrialDialogComponent, { data: { app } });
  }

  redirectToPricing(): void {
    window.open(prospectPricingUrl, '_blank');
  }

  redirectToUpgrade(): void {
    window.open(prospectUpgradeUrl, '_blank');
  }
}

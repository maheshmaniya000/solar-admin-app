import { SideNavigationRoute } from 'ng-shared/shared/types';

import { BillingComponent } from './containers/billing/billing.component';
import { CompanyAdminOverviewComponent } from './containers/company-admin-overview/company-admin-overview.component';
import { CompanySettingsComponent } from './containers/company-settings/company-settings.component';
import { CompanyUsersComponent } from './containers/company-users/company-users.component';
import { ProspectSubscriptionComponent } from './containers/prospect-subscription/prospect-subscription.component';
import { SDATSubscriptionComponent } from './containers/sdat-subscription/sdat-subscription.component';
import { SubscriptionsComponent } from './containers/subscriptions/subscriptions.component';

export const routes: SideNavigationRoute[] = [
  {
    path: 'overview',
    component: CompanyAdminOverviewComponent,
    data: {
      nav: {
        name: 'companyAdmin.nav.overview',
        svgIcon: 'sg:sgf-overview',
        dividerAfter: true
      }
    }
  },
  {
    path: 'users',
    component: CompanyUsersComponent,
    data: {
      nav: {
        name: 'companyAdmin.nav.users',
        icon: 'group',
      }
    }
  },
  {
    path: 'subscriptions',
    pathMatch: 'full',
    component: SubscriptionsComponent,
    data: {
      nav: {
        name: 'companyAdmin.nav.subscriptions',
        icon: 'book',
        hideNavArrowWhenNotExpanded: true,
      }
    },
  },
  {
    path: 'subscriptions/prospect-subscription',
    component: ProspectSubscriptionComponent,
    data: {
      nav: {
        name: 'common.subscription.prospect',
      },
      parent: 'subscriptions',
      empty: true,
    },
  },
  {
    path: 'subscriptions/sdat-subscription',
    component: SDATSubscriptionComponent,
    data: {
      nav: {
        name: 'common.subscription.sdat',
      },
      parent: 'subscriptions',
      empty: true,
    },
  },
  {
    path: 'billing',
    component: BillingComponent,
    pathMatch: 'full',
    data: {
      nav: {
        name: 'companyAdmin.nav.billing',
        icon: 'credit_card',
        hideNavArrowWhenNotExpanded: true,
      }
    },
  },
  // {
  //   path: 'api-contracts',
  //   component: ApiContractsComponent,
  //   data: {
  //     nav: {
  //       name: 'companyAdmin.nav.apiContracts',
  //       icon: 'usb',
  //     }
  //   }
  // },
  // {
  //   path: 'api-contracts/api-contract-detail/:id',
  //   component: ApiContractDetailComponent,
  //   data: {
  //     nav: {
  //       name: 'companyAdmin.nav.apiContracts',
  //     },
  //     parent: 'api-contracts'
  //   },
  // },
  {
    path: 'company-settings',
    component: CompanySettingsComponent,
    data: {
      nav: {
        name: 'companyAdmin.nav.info',
        icon: 'settings',
      }
    }
  }
];

import { Route } from '@angular/router';

import { SDATSubscriptionComponent } from '../orders/components/sdat-subscription/sdat-subscription.component';
import { ComponentMode } from '../shared/models/component-mode.enum';
import { UnsavedChangesGuard } from '../shared/services/unsaved-changes-guard.service';
import { companyIdRouteParamName } from './companies.constants';
import { CompaniesTableComponent } from './components/companies-table/companies-table.component';
import { CompaniesToolbarComponent } from './components/companies-toolbar/companies-toolbar.component';
import { ProspectLicenseComponent } from './components/prospect-license/prospect-license.component';
import { TmySubscriptionViewComponent } from './components/tmy-subscriptions/tmy-subscription-view/tmy-subscription-view.component';
import { TMYSubscriptionsComponent } from './components/tmy-subscriptions/tmy-subscriptions.component';
import { ViewTokensComponent } from './components/tmy-subscriptions/view-tokens/view-tokens.component';
import { AdminApiContractContainerComponent } from './containers/api-contract/admin.api-contract-container.component';
import { CompanyDetailComponent } from './containers/company-detail/company-detail.component';
import { CompanyDetailGuard } from './services/company-detail.guard';

export const companiesRoutes: Route[] = [
  {
    path: 'add',
    component: CompanyDetailComponent,
    canDeactivate: [UnsavedChangesGuard],
    data: {
      fullscreen: true,
      mode: ComponentMode.add
    }
  },
  {
    path: `:${companyIdRouteParamName}`,
    canActivate: [CompanyDetailGuard],
    data: {
      fullscreen: true
    },
    children: [
      {
        path: '',
        component: CompanyDetailComponent,
        data: {
          mode: ComponentMode.view
        }
      },
      {
        path: 'edit',
        component: CompanyDetailComponent,
        canDeactivate: [UnsavedChangesGuard],
        data: {
          mode: ComponentMode.edit
        }
      },
      {
        path: 'prospect-license',
        component: ProspectLicenseComponent
      },
      {
        path: 'sdat-subscription',
        component: SDATSubscriptionComponent
      },
      {
        path: 'api-contract',
        component: AdminApiContractContainerComponent
      },
      {
        path: ':id',
        component: TmySubscriptionViewComponent,
        data: {
          mode: ComponentMode.view
        }
      },
      {
        path: ':id',
        children: [
          {
            path: '',
            component: TmySubscriptionViewComponent,
            data: {
              mode: ComponentMode.view
            }
          },
          {
            path: 'tmy-view-token',
            component: ViewTokensComponent
          },
        ]
      },
      {
        path: 'tmy-subscriptions',
        component: TMYSubscriptionsComponent,
      },
      {
        path: 'add',
        component: TmySubscriptionViewComponent,
        data: {
          fullscreen: true,
          mode: ComponentMode.add
        }
      },
    ]
  },
  {
    path: '',
    component: CompaniesTableComponent
  },
  {
    path: '',
    component: CompaniesToolbarComponent,
    outlet: 'toolbar'
  }
];

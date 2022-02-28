import { NgModule } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import {MatGridListModule} from '@angular/material/grid-list';

import { AppSubscriptionModule } from 'ng-shared/app-subscription/app-subscription.module';
import { DatepickerFormatAdapter } from 'ng-shared/core/services/date-picker-format-adapter';

import { AdminSharedModule } from '../shared/admin-shared.module';
import { AdminApiAccessDefinitionComponent } from './components/api-contracts/admin.api-access-definition.component';
import { AdminApiSiteAccessComponent } from './components/api-contracts/admin.api-site-access.component';
import { AdminSingleApiContractComponent } from './components/api-contracts/admin.single-api-contract.component';
import { CompaniesTableComponent } from './components/companies-table/companies-table.component';
import { CompaniesToolbarComponent } from './components/companies-toolbar/companies-toolbar.component';
import { CompanyEditorComponent } from './components/company-editor/company-editor.component';
import { CompanyHierarchyViewComponent } from './components/company-hierarchy-view/company-hierarchy-view.component';
import { CompanyViewComponent } from './components/company-view/company-view.component';
import { ProspectLicenseComponent } from './components/prospect-license/prospect-license.component';
import { TmySubscriptionTableComponent } from './components/tmy-subscriptions/tmy-subscription-table/tmy-subscription-table.component';
import { TmySubscriptionViewComponent } from './components/tmy-subscriptions/tmy-subscription-view/tmy-subscription-view.component';
import { TMYSubscriptionsComponent } from './components/tmy-subscriptions/tmy-subscriptions.component';
import { ViewTokensComponent } from './components/tmy-subscriptions/view-tokens/view-tokens.component';
import { ViewCompanyToolsComponent } from './components/view-company-tools/view-company-tools.component';
import { AdminApiContractContainerComponent } from './containers/api-contract/admin.api-contract-container.component';
import { CompanyDetailComponent } from './containers/company-detail/company-detail.component';

@NgModule({
  imports: [AdminSharedModule, AppSubscriptionModule, MatGridListModule],
  declarations: [
    CompaniesToolbarComponent,
    CompaniesTableComponent,
    ProspectLicenseComponent,
    AdminApiAccessDefinitionComponent,
    AdminApiContractContainerComponent,
    AdminApiSiteAccessComponent,
    AdminSingleApiContractComponent,
    TMYSubscriptionsComponent,
    TmySubscriptionViewComponent,
    CompanyDetailComponent,
    CompanyViewComponent,
    CompanyHierarchyViewComponent,
    ViewCompanyToolsComponent,
    CompanyEditorComponent,
    TmySubscriptionTableComponent,
    ViewTokensComponent
  ],
  providers: [{ provide: DateAdapter, useClass: DatepickerFormatAdapter }]
})
export class CompaniesModule {}

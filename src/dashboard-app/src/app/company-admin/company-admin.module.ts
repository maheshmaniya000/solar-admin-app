import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { EffectsModule } from '@ngrx/effects';

import { AppSubscriptionModule } from 'ng-shared/app-subscription/app-subscription.module';
import { PaymentModule } from 'ng-shared/payment/payment.module';
import { SharedModule } from 'ng-shared/shared/shared.module';
import { SideNavigationModule } from 'ng-shared/side-navigation/side-navigation.module';
import { UserSharedModule } from 'ng-shared/user-shared/user-shared.module';
import { HasSelectedCompanyGuard } from 'ng-shared/user/guards/has-selected-company.guard';
import { LoginUserGuard } from 'ng-shared/user/guards/login-user.guard';

import { routes } from './company-admin.routes';
import { ApiContractAccessOverviewComponent } from './components/api-contract-access-overview/api-contract-access-overview.component';
import { CompanyAdminToolbarComponent } from './components/company-admin-toolbar/company-admin-toolbar.component';
import { IAlreadyHaveImapsDialogComponent } from './components/i-already-have-imaps-dialog/i-already-have-imaps-dialog.component';
import { InviteUserToCompanyDialogComponent } from './components/invite-user-to-company-dialog/invite-user-to-company-dialog.component';
import { ApiContractDetailComponent } from './containers/api-contract-detail/api-contract-detail.component';
import { ApiContractsComponent } from './containers/api-contracts/api-contracts.component';
import { BillingComponent } from './containers/billing/billing.component';
import { CompanyAdminOverviewComponent } from './containers/company-admin-overview/company-admin-overview.component';
import { CompanyAdminComponent } from './containers/company-admin/company-admin.component';
import { CompanySettingsComponent } from './containers/company-settings/company-settings.component';
import { CompanyUsersComponent } from './containers/company-users/company-users.component';
import { OrderDetailComponent } from './containers/order-detail/order-detail.component';
import { ProspectSubscriptionComponent } from './containers/prospect-subscription/prospect-subscription.component';
import { SDATSubscriptionComponent } from './containers/sdat-subscription/sdat-subscription.component';
import { SubscriptionsComponent } from './containers/subscriptions/subscriptions.component';
import { CompanyAppEffects } from './effects/company-app.effects';
import { IsCompanyAdminGuard } from './guards/is-company-admin.guard';
import { ApiContractsService } from './services/api-contracts.service';
import { CompanyAppService } from './services/company-app.service';
import { OrdersService } from './services/orders.service';


@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([CompanyAppEffects]),
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatPaginatorModule,
    MatInputModule,
    MatTabsModule,
    MatSortModule,
    FormsModule,
    ReactiveComponentModule,
    ReactiveFormsModule,
    SharedModule,
    MatTableModule,
    PaymentModule,
    UserSharedModule,
    AppSubscriptionModule,
    RouterModule.forChild([
      {
        path: '',
        component: CompanyAdminComponent,
        canActivate: [
          LoginUserGuard,
          HasSelectedCompanyGuard,
          IsCompanyAdminGuard
        ],
        children: [
          ...routes,
          { path: '', pathMatch: 'full', redirectTo: routes[0].path },
        ]
      },
      {
        path: 'billing/order-detail/:sgOrderId',
        component: OrderDetailComponent,
      },
      { path: '*', redirectTo: '' },
    ]
    ),
    SideNavigationModule
  ],
  declarations: [
    ApiContractsComponent,
    ApiContractAccessOverviewComponent,
    ApiContractDetailComponent,
    CompanyAdminComponent,
    CompanyAdminToolbarComponent,
    CompanyAdminOverviewComponent,
    CompanySettingsComponent,
    CompanyUsersComponent,
    InviteUserToCompanyDialogComponent,
    SubscriptionsComponent,
    ProspectSubscriptionComponent,
    SDATSubscriptionComponent,
    BillingComponent,
    OrderDetailComponent,
    IAlreadyHaveImapsDialogComponent,
  ],
  entryComponents: [
    IAlreadyHaveImapsDialogComponent,
    InviteUserToCompanyDialogComponent
  ],
  providers: [
    ApiContractsService,
    CompanyAppService,
    IsCompanyAdminGuard,
    OrdersService,
  ]
})
export class CompanyAdminModule {}

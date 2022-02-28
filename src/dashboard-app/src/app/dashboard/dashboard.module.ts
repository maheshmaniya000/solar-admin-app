import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';

import { ProjectListCoreModule } from 'ng-project/project-list/project-list-core.module';
import { Config, ProspectAppConfig } from 'ng-shared/config';
import { SharedModule } from 'ng-shared/shared/shared.module';
import { UserSharedModule } from 'ng-shared/user-shared/user-shared.module';
import { LoginUserGuard } from 'ng-shared/user/guards/login-user.guard';

import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { LandingPageCardComponent } from './components/landing-page-card/landing-page-card.component';
import { ListRecentProjectsComponent } from './components/list-recent-projects/list-recent-projects.component';
import { DashboardComponent } from './containers/dashboard/dashboard.component';
import { LandingPageComponent } from './containers/landing-page/landing-page.component';
import { RecentProjectsComponent } from './containers/recent-projects/recent-projects.component';
import { SDATPageComponent } from './containers/sdat-page/sdat-page.component';
import { HasSDATSubscriptionGuard } from './guards/has-sdat-subscription.guard';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardHeaderComponent,
    LandingPageComponent,
    LandingPageCardComponent,
    ListRecentProjectsComponent,
    RecentProjectsComponent,
    SDATPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    ProjectListCoreModule,
    SharedModule,
    UserSharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
        children: [
          {
            path: '',
            component: LandingPageComponent
          },
          {
            path: 'recent',
            component: RecentProjectsComponent,
            canActivate: [LoginUserGuard]
          },
          {
            path: 'sdat',
            component: SDATPageComponent,
            canActivate: [LoginUserGuard, HasSDATSubscriptionGuard]
          }
        ]
      },
      { path: '*', redirectTo: '' }
    ]),
    StoreModule
  ],
  providers: [
    { provide: ProspectAppConfig, useExisting: Config },
    HasSDATSubscriptionGuard
  ]
})
export class DashboardModule {}

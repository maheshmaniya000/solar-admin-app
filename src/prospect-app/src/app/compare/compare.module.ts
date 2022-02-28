import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

import { ProjectListModule } from 'ng-project/project-list/project-list.module';
import { ProjectModule } from 'ng-project/project/project.module';
import { SharedModule } from 'ng-shared/shared/shared.module';
import { SideNavigationModule } from 'ng-shared/side-navigation/side-navigation.module';

import { routes } from './compare.routes';
import { ChipsSelectorComponent } from './components/chips-selector/chips-selector.component';
import { CompareHourlyStatisticsComponent } from './components/compare-hourly-statistics/compare-hourly-statistics.component';
import { CompareMonthlyStatisticsComponent } from './components/compare-monthly-statistics/compare-monthly-statistics.component';
import { CompareNoPermissionsComponent } from './components/compare-no-permissions/compare-no-permissions.component';
import { CompareProjectsToolbarComponent } from './components/compare-projects-toolbar/compare-projects-toolbar.component';
import { CompareToolbarComponent } from './components/compare-toolbar/compare-toolbar.component';
import { CompareWarningsComponent } from './components/compare-warnings/compare-warnings.component';
import { CompareComponent } from './containers/compare/compare.component';
import { EconomyComponent } from './containers/economy/economy.component';
import { LifetimePerformanceComponent } from './containers/lifetime-performance/lifetime-performance.component';
import { ProjectOverviewTableComponent } from './containers/overview/overview-table/project-overview-table.component';
import { ProjectOverviewComponent } from './containers/overview/project-overview.component';
import { PerformanceLossesComponent } from './containers/performance-losses/performance-losses.component';
import { ProjectInfoComponent } from './containers/project-info/project-info.component';
import { PvConfigurationComponent } from './containers/pv-configuration/pv-configuration.component';
import { PvElectricityHourlyComponent } from './containers/pv-electricity-hourly/pv-electricity-hourly.component';
import { PvElectricityMonthlyComponent } from './containers/pv-electricity-monthly/pv-electricity-monthly.component';
import { SolarMeteoHourlyComponent } from './containers/solar-meteo-hourly/solar-meteo-hourly.component';
import { SolarMeteoMonthlyComponent } from './containers/solar-meteo-monthly/solar-meteo-monthly.component';
import { HasCompareAccessGuard } from './guards/has-compare-access.guard';


@NgModule({
  imports: [
    CdkTableModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatToolbarModule,
    ProjectListModule,
    ProjectModule,
    MatSlideToggleModule,
    RouterModule.forChild([
      {
        path: '',
        canActivate: [ HasCompareAccessGuard ],
        component: CompareComponent,
        children: [
          ...routes,
          {path: '', redirectTo: routes[0].path}
        ]
      },
      {path: '*', redirectTo: ''},
    ]),
    SharedModule,
    SideNavigationModule
  ],
  providers: [
    HasCompareAccessGuard
  ],
  declarations: [
    ChipsSelectorComponent,
    CompareComponent,
    CompareHourlyStatisticsComponent,
    CompareMonthlyStatisticsComponent,
    CompareNoPermissionsComponent,
    CompareProjectsToolbarComponent,
    CompareToolbarComponent,
    CompareWarningsComponent,
    EconomyComponent,
    LifetimePerformanceComponent,
    PerformanceLossesComponent,
    ProjectInfoComponent,
    ProjectOverviewComponent,
    ProjectOverviewTableComponent,
    PvConfigurationComponent,
    PvElectricityHourlyComponent,
    PvElectricityMonthlyComponent,
    SolarMeteoHourlyComponent,
    SolarMeteoMonthlyComponent,
  ]
})
export class CompareModule {
}

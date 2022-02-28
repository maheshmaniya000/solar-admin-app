import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { ProjectDetailModule } from 'ng-project/project-detail/project-detail.module';
import { SharedModule } from 'ng-shared/shared/shared.module';
import { SideNavigationModule } from 'ng-shared/side-navigation/side-navigation.module';

import { ChartCardLabelComponent } from './components/chart-card/chart-card-label.component';
import { ChartCardComponent } from './components/chart-card/chart-card.component';
import { DetailToolbarComponent } from './components/detail-toolbar/detail-toolbar.component';
import { EconomyTariffDialogComponent } from './components/economy-tariff-dialog/economy-tariff-dialog.component';
import { EditHorizonDialogComponent } from './components/edit-horizon-dialog/edit-horizon-dialog.component';
import { OverviewDataComponent } from './components/overview-data/overview-data.component';
import { ProjectDetailSideNavigationComponent } from './components/project-detail-side-navigation/project-detail-side-navigation.component';
import { ProjectSiteCardComponent } from './components/project-site-card/project-site-card.component';
import { SummaryDataItemComponent } from './components/summary/summary-data-item.component';
import { SummaryComponent } from './components/summary/summary.component';
import { DownloadDataComponent } from './containers/download-data/download-data.component';
import { EconomyCalculatorResultsComponent } from './containers/economy-calculator-results/economy-calculator-results.component';
import { EconomyCalculatorComponent } from './containers/economy-calculator/economy-calculator.component';
import { NoProjectComponent } from './containers/no-project/no-project.component';
import { ProjectInfoViewComponent } from './containers/project-info-view/project-info-view.component';
import { ProspectDetailHeadingComponent } from './containers/prospect-detail/prospect-detail-heading.component';
import { ProspectDetailComponent } from './containers/prospect-detail/prospect-detail.component';
import { ProspectOverviewNavButtonComponent } from './containers/prospect-overview/prospect-overview-nav-button.component';
import { ProspectOverviewComponent } from './containers/prospect-overview/prospect-overview.component';
import { PvConfigurationComponent } from './containers/pv-configuration/pv-configuration.component';
import { PvElectricityHourlyComponent } from './containers/pv-electricity-hourly/pv-electricity-hourly.component';
import { PvElectricityMonthlyComponent } from './containers/pv-electricity-monthly/pv-electricity-monthly.component';
import { PvLifetimePerformanceComponent } from './containers/pv-lifetime-performance/pv-lifetime-performance.component';
import { PvLossArrowComponent } from './containers/pv-performance-losses/pv-loss-arrow.component';
import { PvLossHeaderComponent } from './containers/pv-performance-losses/pv-loss-header.component';
import { PvPerformanceLossesComponent } from './containers/pv-performance-losses/pv-performance-losses.component';
import { ReportsComponent } from './containers/reports/reports.component';
import { SolarMeteoHourlyComponent } from './containers/solar-meteo-hourly/solar-meteo-hourly.component';
import { SolarMeteoMonthlyComponent } from './containers/solar-meteo-monthly/solar-meteo-monthly.component';
import { DetailSharedModule } from './detail-shared.module';
import { routes } from './detail.routes';
import {
  SolarMeteoTableSettingsDialogComponent
} from './dialogs/solar-meteo-table-settings-dialog/solar-meteo-table-settings-dialog.component';
import { DetailRouteGuard } from './guards/detail-route.guard';
import { DummyGuard } from './guards/dummy.guard';
import { EconomyUnsavedChangesGuard } from './guards/economy.guard';
import { ProjectHasLatestDataGuard } from './guards/project-has-latest-data.guard';
import { ProjectLoadGuard } from './guards/project-load.guard';
import { SelectEnergySystemGuard } from './guards/select-energy-system.guard';
import { UnsavedProjectGuard } from './guards/unsaved-project.guard';
import { DetailRouteService } from './services/detail-route.service';
import { HorizonService } from './services/horizon.service';
import { ProjectPvSystDataCsvService } from './services/project-pvsyst-data-csv.service';
import { ReportsService } from './services/reports.service';

@NgModule({
  imports: [
    CdkTableModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterModule.forChild([
      // detail routes
      {
        path: ':id',
        component: ProspectDetailComponent,
        canActivate: [
          ProjectLoadGuard,
          SelectEnergySystemGuard,
          UnsavedProjectGuard,
        ],
        canActivateChild: [ DetailRouteGuard ],
        // Router: CanDeactivate guard on child doesn't fire on changing parent routing segment
        // https://github.com/angular/angular/issues/11664
        // Putting dummy guard on parent is a fix
        canDeactivate: [ DummyGuard ],
        children: [
          {
            path: 'configure',
            loadChildren: () => import('ng-project/pv-config/pv-config.module').then(m => m.PvConfigModule),
            canActivate: [ ProjectHasLatestDataGuard ],
            data: {  }
          },
          ...routes,
          {
            path: 'pdf',
            loadChildren: () => import('../report/report.module').then(mod => mod.ReportModule),
            data: { access: 'prospect:report', print: true }
          },
          { path: '', pathMatch: 'full', redirectTo: routes[0].path }
        ]
      },
      // if no project selected
      {
        path: '',
        component: NoProjectComponent
      },
    ]),
    DetailSharedModule,
    ProjectDetailModule,
    ReactiveFormsModule,
    SharedModule,
    SideNavigationModule,
  ],
  providers: [
    DetailRouteGuard,
    DetailRouteService,
    DummyGuard,
    EconomyUnsavedChangesGuard,
    HorizonService,
    ProjectLoadGuard,
    ProjectHasLatestDataGuard,
    ReportsService,
    SelectEnergySystemGuard,
    UnsavedProjectGuard,
    ProjectPvSystDataCsvService
  ],
  declarations: [
    ChartCardComponent,
    ChartCardLabelComponent,
    DetailToolbarComponent,
    DownloadDataComponent,
    EconomyCalculatorComponent,
    EconomyCalculatorResultsComponent,
    EconomyTariffDialogComponent,
    EditHorizonDialogComponent,
    NoProjectComponent,
    OverviewDataComponent,
    ProjectDetailSideNavigationComponent,
    ProjectInfoViewComponent,
    ProjectSiteCardComponent,
    ProspectDetailComponent,
    ProspectDetailHeadingComponent,
    ProspectOverviewComponent,
    ProspectOverviewNavButtonComponent,
    PvConfigurationComponent,
    PvElectricityHourlyComponent,
    PvElectricityMonthlyComponent,
    PvLifetimePerformanceComponent,
    PvLossArrowComponent,
    PvLossHeaderComponent,
    PvPerformanceLossesComponent,
    ReportsComponent,
    SolarMeteoTableSettingsDialogComponent,
    SolarMeteoHourlyComponent,
    SolarMeteoMonthlyComponent,
    SummaryComponent,
    SummaryDataItemComponent,
  ],
  entryComponents: [
    EconomyTariffDialogComponent,
    EditHorizonDialogComponent,
    SolarMeteoTableSettingsDialogComponent
  ]
})
export class DetailModule { }


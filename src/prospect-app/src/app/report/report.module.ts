import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

import { ProjectModule } from 'ng-project/project/project.module';
import { ReportMapModule } from 'ng-shared/report-map/report-map.module';
import { SharedModule } from 'ng-shared/shared/shared.module';

import { DetailSharedModule } from '../detail/detail-shared.module';
import { DaylengthCanvasComponent } from './components/daylength-canvas/daylength-canvas.component';
import { EconomyInputsRowComponent } from './components/economy-inputs/economy-inputs-row.component';
import { EconomyInputsComponent } from './components/economy-inputs/economy-inputs.component';
import { EconomyOverviewComponent } from './components/economy-overview/economy-overview.component';
import { IndexedTitleComponent } from './components/indexed-title/indexed-title.component';
import { MonthlyDataTableComponent } from './components/monthly-data-table/monthly-data-table.component';
import { ProjectAnnualOverviewComponent } from './components/project-annual-overview/project-annual-overview.component';
import { ProjectInfoTableComponent } from './components/project-info-table/project-info-table.component';
import { PvLifetimePerformanceTableComponent } from './components/pv-lifetime-performance-table/pv-lifetime-performance-table.component';
import { PvLossArrowComponent } from './components/pv-losses-table/pv-loss-arrow.component';
import { PvLossHeaderComponent } from './components/pv-losses-table/pv-loss-header.component';
import { PvLossesDiagramComponent } from './components/pv-losses-table/pv-losses-diagram.component';
import { PvLossesTableComponent } from './components/pv-losses-table/pv-losses-table.component';
import { SnowSoilingLossesTableComponent } from './components/snow-soiling-losses-table/snow-soiling-losses-table.component';
import { SunpathCanvasComponent } from './components/sunpath-canvas/sunpath-canvas.component';
import { TableOfContentsComponent } from './components/table-of-contents/table-of-contents.component';
import { ProjectReportComponent } from './containers/project-report/project-report.component';


const INTERNAL_COMPONENTS = [
  DaylengthCanvasComponent,
  IndexedTitleComponent,
  MonthlyDataTableComponent,
  ProjectAnnualOverviewComponent,
  ProjectInfoTableComponent,
  PvLifetimePerformanceTableComponent,
  PvLossArrowComponent,
  PvLossHeaderComponent,
  PvLossesDiagramComponent,
  PvLossesTableComponent,
  SnowSoilingLossesTableComponent,
  SunpathCanvasComponent,
  TableOfContentsComponent,
  ProjectReportComponent,
  EconomyInputsComponent,
  EconomyInputsRowComponent,
  EconomyOverviewComponent
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProjectReportComponent,
        data: { access: 'prospect:report' }
      },
    ]),
    ProjectModule,
    SharedModule,
    ReportMapModule,
    MatCardModule,
    CdkTableModule,
    DetailSharedModule,
  ],
  declarations: [...INTERNAL_COMPONENTS]
})
export class ReportModule {
}

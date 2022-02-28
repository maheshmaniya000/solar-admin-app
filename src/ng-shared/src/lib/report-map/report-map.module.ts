import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'ng-shared/shared/shared.module';

import { ReportMapComponent } from './components/report-map/report-map.component';
import { SiteLocationMapComponent } from './components/site-location-map/site-location-map.component';
import { ReportMapService } from './services/report-map.service';

const DECLARATIONS = [
  ReportMapComponent,
  SiteLocationMapComponent,
];

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
  providers: [ReportMapService]
})
export class ReportMapModule {}

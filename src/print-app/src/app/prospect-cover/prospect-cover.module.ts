import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UnitToggleService } from '@solargis/ng-unit-value';

import { UnitTogglePlainService } from 'ng-shared/plain-services/unit-toggle-plain.service';
import { ReportMapModule } from 'ng-shared/report-map/report-map.module';
import { SharedModule } from 'ng-shared/shared/shared.module';

import { ProspectCoverComponent } from './components/prospect-cover.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'prospect-cover', component: ProspectCoverComponent }
    ]),
    SharedModule,
    ReportMapModule
  ],
  providers: [
    { provide: UnitToggleService, useClass: UnitTogglePlainService, deps: [] },
  ],
  exports: [ ProspectCoverComponent ],
  declarations: [ ProspectCoverComponent ],
  entryComponents: []
})
export class ProspectCoverModule { }

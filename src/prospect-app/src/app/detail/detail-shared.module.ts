import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';

import { ProjectDetailModule } from 'ng-project/project-detail/project-detail.module';
import { SharedModule } from 'ng-shared/shared/shared.module';

import { EconomyCalculatorTableComponent } from './components/economy-calculator-table/economy-calculator-table.component';
import { GlossaryTableComponent } from './components/glossary/glossary-table.component';
import { GlossaryComponent } from './components/glossary/glossary.component';
import { HourlyHeatmapComponent } from './components/hourly-heatmap/hourly-heatmap.component';
import { ProspectMetadataComponent } from './containers/metadata/prospect-metadata.component';


@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    MatCardModule,
    MatExpansionModule,
    ProjectDetailModule,
    SharedModule,
  ],
  declarations: [
    GlossaryComponent,
    GlossaryTableComponent,
    HourlyHeatmapComponent,
    ProspectMetadataComponent,
    EconomyCalculatorTableComponent
  ],
  exports: [
    GlossaryComponent,
    GlossaryTableComponent,
    HourlyHeatmapComponent,
    ProspectMetadataComponent,
    EconomyCalculatorTableComponent
  ]
})
export class DetailSharedModule { }


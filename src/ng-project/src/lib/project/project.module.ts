import { CdkTableModule } from '@angular/cdk/table';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EffectsModule } from '@ngrx/effects';

import { ProjectCoreModule } from 'ng-project/project/project-core.module';
import { Config } from 'ng-shared/config';
import { SharedModule } from 'ng-shared/shared/shared.module';
import { UserSharedModule } from 'ng-shared/user-shared/user-shared.module';

import { ExportChartButtonComponent } from './components/export-chart-button/export-chart-button.component';
import { FavoriteButtonComponent } from './components/favorite-button/favorite-button.component';
import { HighchartsComponent } from './components/highcharts/highcharts.component';
import { MonthlyMinichartComponent } from './components/monthly-minichart/monthly-minichart.component';
import { ProjectChipsComponent } from './components/project-chips/project-chips.component';
import { ProjectDataItemComponent } from './components/project-data-item/project-data-item.component';
import { ProjectDataComponent } from './components/project-data/project-data.component';
import { ProjectNameWithStatusComponent } from './components/project-name-with-status/project-name-with-status.component';
import { ProjectSitePropertiesComponent } from './components/project-site-properties/project-site-properties.component';
import { ProjectSiteMinimapComponent } from './components/project-site/project-site-minimap.component';
import { ProjectSiteComponent } from './components/project-site/project-site.component';
import { PvConfigMiniviewerComponent } from './components/pv-config-miniviewer/pv-config-miniviewer.component';
import { PvConfigParamValueComponent } from './components/pv-config-param-value/pv-config-param-value.component';
import { PvConfigViewerComponent } from './components/pv-config-viewer/pv-config-viewer.component';
import { AddToCompareDialogComponent } from './dialogs/add-to-compare-dialog/add-to-compare-dialog.component';
import { ClaimTrialDialogComponent } from './dialogs/claim-trial-dialog/claim-trial-dialog.component';
import { CompareDialogItemComponent } from './dialogs/compare-list-projects-dialog/compare-dialog-item.component';
import { CompareReplaceProjectDialogComponent } from './dialogs/compare-replace-project-dialog/compare-replace-project-dialog.component';
import { ManageTagsDialogComponent } from './dialogs/manage-tag-dialog/manage-tag-dialog.component';
import { ProjectRenameDialogComponent } from './dialogs/project-rename-dialog/project-rename-dialog.component';
import { ProjectShareDialogComponent } from './dialogs/project-share-dialog/project-share-dialog.component';
import { SetTagDialogComponent } from './dialogs/set-tag-dialog/set-tag-dialog.component';
import { TransferProjectsDialogComponent } from './dialogs/transfer-projects-dialog/transfer-projects-dialog.component';
import { UpdateProjectDataDialogComponent } from './dialogs/update-project-data-dialog/update-project-data-dialog.component';
import { CompareEffects } from './effects/compare.effects';
import { DialogEffects } from './effects/dialog.effects';
import { EnergySystemApiEffects } from './effects/energy-system-api.effects';
import { MetadataEffects } from './effects/metadata.effects';
import { ProjectApiEffects } from './effects/project-api.effects';
import { ProjectDataApiEffects } from './effects/project-data-api.effects';
import { ProjectNotificationEffects } from './effects/project-notification.effects';
import { UserTagsEffects } from './effects/user-tags.effects';
import { combinedDatasetFactory, LTA_PVCALC_COMBINED_DATASET } from './services/combined-dataset.factory';
import { DatasetAccessService } from './services/dataset-access.service';
import { ltaDatasetFactory, LTA_DATASET } from './services/lta-dataset.factory';
import { pvCalcDatasetFactory, PVCALC_DATASET } from './services/pvcalc-dataset.factory';
import { Sg1FtpExportProjectsService } from './services/sg1-ftp-export-projects.service';
import { TimezoneService } from './services/timezone.service';
import { UserTagsService } from './services/user-tags.service';


const ENTRY_COMPONENTS = [ // FIXME only dialogs as "entryComponents"
  ClaimTrialDialogComponent,
  CompareDialogItemComponent,
  CompareReplaceProjectDialogComponent,
  CompareReplaceProjectDialogComponent,
  FavoriteButtonComponent,
  ManageTagsDialogComponent,
  MonthlyMinichartComponent,
  ProjectDataComponent,
  ProjectRenameDialogComponent,
  ProjectShareDialogComponent,
  ProjectSiteComponent,
  ProjectSitePropertiesComponent,
  PvConfigMiniviewerComponent,
  PvConfigParamValueComponent,
  PvConfigViewerComponent,
  SetTagDialogComponent,
  TransferProjectsDialogComponent,
  AddToCompareDialogComponent,
  UpdateProjectDataDialogComponent,
];

const INTERNAL_COMPONENTS = [
  ProjectDataItemComponent,
  ProjectSiteMinimapComponent
];

const EXPORTS = [
  ExportChartButtonComponent,
  HighchartsComponent,
  ProjectChipsComponent,
  ProjectNameWithStatusComponent,
  ...ENTRY_COMPONENTS
];

@NgModule({
  imports: [
    CdkTableModule,
    EffectsModule.forFeature([
      CompareEffects,
      DialogEffects,
      EnergySystemApiEffects,
      MetadataEffects,
      ProjectApiEffects,
      ProjectDataApiEffects,
      ProjectNotificationEffects,
      UserTagsEffects
    ]),
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    MatMenuModule,
    ProjectCoreModule,
    ReactiveFormsModule,
    SharedModule,
    UserSharedModule,
  ],
  declarations: [...EXPORTS, ...INTERNAL_COMPONENTS],
  entryComponents: [...ENTRY_COMPONENTS],
  providers: [
    DatasetAccessService,
    TimezoneService,
    UserTagsService,
    Sg1FtpExportProjectsService,
    { provide: LTA_DATASET, useFactory: ltaDatasetFactory, deps: [Config] },
    { provide: PVCALC_DATASET, useFactory: pvCalcDatasetFactory, deps: [Config] },
    { provide: LTA_PVCALC_COMBINED_DATASET, useFactory: combinedDatasetFactory, deps: [LTA_DATASET, PVCALC_DATASET] }
  ],
  exports: [...EXPORTS, ProjectSiteMinimapComponent, ProjectCoreModule]
})
export class ProjectModule {

}

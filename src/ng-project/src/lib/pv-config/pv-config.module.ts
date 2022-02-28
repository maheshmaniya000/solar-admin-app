import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from 'ng-shared/shared/shared.module';

import { ProjectDetailModule } from '../project-detail/project-detail.module';
import { PvConfigCopyFromProjectComponent } from './components/pv-config-copy-from-project/pv-config-copy-from-project.component';
import { PvConfigSelectDefaultListComponent } from './components/pv-config-select-default-list/pv-config-select-default-list.component';
import { PvConfigSelectDefaultComponent } from './components/pv-config-select-default/pv-config-select-default.component';
import { PvParamBacktrackingComponent } from './components/pv-param-backtracking/pv-param-backtracking.component';
import { PvParamCablingLossesComponent } from './components/pv-param-cabling-losses/pv-param-cabling-losses.component';
import { PvParamInputsComponent } from './components/pv-param-inputs/pv-param-inputs.component';
import { PvParamInverterComponent } from './components/pv-param-inverter/pv-param-inverter.component';
import { PvParamOrientationComponent } from './components/pv-param-orientation/pv-param-orientation.component';
import { PvParamPvModuleComponent } from './components/pv-param-pv-module/pv-param-pv-module.component';
import { PvParamRotationLimitsComponent } from './components/pv-param-rotation-limits/pv-param-rotation-limits.component';
import { PvParamSnowSoilingLossesComponent } from './components/pv-param-snow-soiling-losses/pv-param-snow-soiling-losses.component';
import { PvParamSystemSizeComponent } from './components/pv-param-system-size/pv-param-system-size.component';
import { PvParamTransformerComponent } from './components/pv-param-transformer/pv-param-transformer.component';
import { PvConfigEditorComponent } from './containers/pv-config-editor/pv-config-editor.component';
import { PvConfigSelectorComponent } from './containers/pv-config-selector/pv-config-selector.component';
import { reducers as pvConfigReducers } from './reducers';

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    FormsModule,
    MatToolbarModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatRadioModule,
    MatPaginatorModule,
    MatCardModule,
    MatListModule,
    MatRadioModule,
    MatSortModule,
    RouterModule.forChild([
      {
        path: 'editor',
        component: PvConfigEditorComponent,
        data: { fullscreen: true }
      },
      {
        path: 'change',
        component: PvConfigSelectorComponent,
        data: { fullscreen: true, edit: true }
      },
      {
        path: '',
        component: PvConfigSelectorComponent,
        data: { fullscreen: true }
      },
    ]),
    ReactiveFormsModule,
    StoreModule.forFeature('pvConfig', pvConfigReducers),
    SharedModule,
    ProjectDetailModule,
  ],
  declarations: [
    PvConfigCopyFromProjectComponent,
    PvConfigSelectDefaultListComponent,
    PvConfigEditorComponent,
    PvConfigSelectorComponent,
    PvConfigSelectDefaultComponent,
    PvParamPvModuleComponent,
    PvParamInverterComponent,
    PvParamSystemSizeComponent,
    PvParamOrientationComponent,
    PvParamSnowSoilingLossesComponent,
    PvParamCablingLossesComponent,
    PvParamTransformerComponent,
    PvParamInputsComponent,
    PvParamBacktrackingComponent,
    PvParamRotationLimitsComponent,
  ]
})
export class PvConfigModule { }

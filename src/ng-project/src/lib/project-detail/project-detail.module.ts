import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from 'ng-shared/shared/shared.module';

import { ProjectModule } from '../project/project.module';
import { DialogEffects } from './effects/dialog.effects';
import { SelectedEnergySystemEffects } from './effects/selected-energy-system.effects';
import { reducers as projectDetailReducers } from './reducers';

@NgModule({
  imports: [
    EffectsModule.forFeature([SelectedEnergySystemEffects, DialogEffects]),
    StoreModule.forFeature('projectDetail', projectDetailReducers),
    SharedModule,
    ProjectModule
  ],
  exports: [ProjectModule]
})
export class ProjectDetailModule {}

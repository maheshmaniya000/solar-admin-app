import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ProjectCoreModule } from 'ng-project/project/project-core.module';
import { SharedModule } from 'ng-shared/shared/shared.module';

import { ProjectListLoadService } from '../project/services/project-list-load.service';
import { FilterEffects } from './effects/filter.effects';
import { ProjectListCoreEffects } from './effects/project-list-core.effects';
import { reducers as projectListReducers } from './reducers';

@NgModule({
  imports: [
    EffectsModule.forFeature([FilterEffects, ProjectListCoreEffects]),
    StoreModule.forFeature('projectList', projectListReducers),
    ProjectCoreModule,
    SharedModule
  ],
  providers: [ProjectListLoadService],
  exports: [ProjectCoreModule]
})
export class ProjectListCoreModule {

}

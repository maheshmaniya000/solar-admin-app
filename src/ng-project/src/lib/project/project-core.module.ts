import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from 'ng-shared/shared/shared.module';
import { UserSharedModule } from 'ng-shared/user-shared/user-shared.module';

import { ProjectNamePipe } from './pipes/project-name.pipe';
import { reducers as projectReducers } from './reducers';
import { ProjectLoadService } from './services/project-load.service';

@NgModule({
  imports: [
    StoreModule.forFeature('project', projectReducers),
    SharedModule,
    UserSharedModule
  ],
  declarations: [ProjectNamePipe],
  providers: [ProjectLoadService, ProjectNamePipe],
  exports: [ProjectNamePipe]
})
export class ProjectCoreModule {

}

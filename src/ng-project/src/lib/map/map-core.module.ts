import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from 'ng-shared/shared/shared.module';

import { ProjectListModule } from '../project-list/project-list.module';
import { MapEffects } from './effects/map.effects';
import { SiteEffects } from './effects/site.effects';
import { mapReducer } from './map.reducer';

@NgModule({
  imports: [
    SharedModule,
    ProjectListModule,
    EffectsModule.forFeature([MapEffects, SiteEffects]),
    StoreModule.forFeature('map', mapReducer)
  ]
})
export class MapCoreModule {
}

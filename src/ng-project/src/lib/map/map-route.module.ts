import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MapContainerComponent } from './containers/map-container/map-container.component';
import { MapCoreModule } from './map-core.module';
import { MapModule } from './map.module';

@NgModule({
  imports: [
    MapModule,
    MapCoreModule,
    RouterModule.forChild([
      {
        path: '',
        component: MapContainerComponent,
        data: {
          fillLayout: true,
          shouldDetach: true,
          detachKey: 'prospect-map',
        }
      }
    ])
  ]
})
export class MapRouteModule {
}

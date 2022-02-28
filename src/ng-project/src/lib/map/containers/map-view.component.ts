import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { MapLayerDefWithAccess, MapSelectedLayers } from '@solargis/types/map';

import { selectSelectedProject } from 'ng-project/project-list/selectors';
import { SiteFromGeolocation } from 'ng-project/project/actions/site.actions';
import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { GeolocatorService } from 'ng-shared/core/services/geolocator.service';

import { State } from '../map.reducer';
import { selectMapLayersWithAccess } from '../selectors';


@Component({
  selector: 'sg-map-view',
  templateUrl: './map-view.component.html'
})
export class MapViewComponent {
  layers$: Observable<MapLayerDefWithAccess[]>;
  selected$: Observable<MapSelectedLayers>;
  projectWithPosition$: Observable<boolean>;

  geolocationAvailable: boolean;

  constructor(
    private readonly store: Store<State>,
    private readonly geolocator: GeolocatorService,
  ) {
    this.layers$ = this.store.pipe(selectMapLayersWithAccess);
    this.selected$ = store.select('map', 'selected');

    this.projectWithPosition$ = store.pipe(
      selectSelectedProject,
      map(project => !!(project && project.site.position)),
      distinctUntilChanged()
    );

    this.geolocationAvailable = geolocator.isGeolocationAvailable();
  }

  onGeolocation(pos: GeolocationPosition): void {
    this.store.dispatch(new SiteFromGeolocation(pos));
  }

  trackEvent(tool: string): void {
    this.store.dispatch(
      new AmplitudeTrackEvent('map_tool_use', { actionName: tool })
    );
  }
}

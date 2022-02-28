import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { merge } from 'rxjs';
import { distinctUntilChanged, filter, first, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { GeocoderService } from '@solargis/ng-geosearch';
import { Project } from '@solargis/types/project';
import { LatLng, latlngFromUrlParam, latlngToUrlParam, SiteFrom } from '@solargis/types/site';
import { removeEmptyItems } from '@solargis/types/utils';

import { Config } from 'ng-shared/config';
import { UrlParamsSync } from 'ng-shared/core/actions/url-params.actions';
import { urlParamsInit$ } from 'ng-shared/core/effects/url-params.effects';
import { selectIPGeolocation } from 'ng-shared/core/selectors/settings.selector';

import { PROJECT_LIST_SELECT, Select } from '../../project-list/actions/selected.actions';
import { State } from '../../project-list/reducers';
import { selectSelectedProject } from '../../project-list/selectors';
import { AddProject, PROJECT_ADD, PROJECT_SAVED, Saved, Update } from '../../project/actions/project.actions';
import { SiteFromIPlocation, SiteFromUrl } from '../../project/actions/site.actions';
import { TimezoneService } from '../../project/services/timezone.service';
import { distinctProjectById } from '../../project/utils/distinct-project.operator';
import { MapCenter } from '../map.actions';


@Injectable()
export class SiteEffects {

  @Effect()
  toUrl = this.store.pipe(
    selectSelectedProject,
    filter(project => !!project),
    map(project => latlngToUrlParam(project.site.point)),
    withLatestFrom(
      this.store.select('urlParams').pipe(map(params => params && params.s))
    ),
    filter(([ps, s]) => ps !== s),
    map(([ps, ]) => ps),
    map(s => new UrlParamsSync({ s }))
  );

  @Effect()
  fromUrl$ = urlParamsInit$(this.store, this.actions$).pipe(
    map(params => params.s),
    filter(s => !!s),
    distinctUntilChanged(),
    map(s => latlngFromUrlParam(s)),
    withLatestFrom(urlParamsInit$(this.store, this.actions$)),
    switchMap(([latlng, urlParams]) => removeEmptyItems([
      new SiteFromUrl(latlng),
      this.ensureMapCenterAction(latlng, urlParams, 'url')
    ]))
  );

  @Effect()
  fromIPGeolocation$ = urlParamsInit$(this.store, this.actions$).pipe(
    first(),
    map(params => params.s),
    filter(s => !s && this.config.geolocator.enabled),
    switchMap(() => this.store.pipe(selectIPGeolocation)),
    filter(loc => !!loc && !!loc.point),
    withLatestFrom(urlParamsInit$(this.store, this.actions$)),
    switchMap(([loc, urlParams]) => removeEmptyItems([
      new SiteFromIPlocation(loc),
      this.ensureMapCenterAction(loc.point, urlParams, 'iplocation')
    ]))
  );

  @Effect()
  geocoded$ = merge(
    this.actions$.pipe(
      ofType<AddProject>(PROJECT_ADD),
      map(action => action.payload)
    ),
    this.actions$.pipe(
      ofType<Saved>(PROJECT_SAVED),
      map(action => action.payload.newProject)
    )
  ).pipe(
    filter((project: Project) => !project.site.place),
    switchMap((project: Project) =>
      this.geocoder.search(project.site.point).pipe(
        map(sites => sites[0].place),
        map(place => new Update({ _id: project._id, site: { place } }))
    ))
  );

  @Effect()
  timezone$ = this.actions$.pipe(
    ofType<Select>(PROJECT_LIST_SELECT),
    switchMap(() => this.store.pipe(selectSelectedProject)),
    filter(project => project && !project.site.timezone),
    distinctProjectById(),
    switchMap(project =>
      this.timezoneService.getTimezone(project.site.point).pipe(
        map(timezone => new Update({ _id: project._id, site: { timezone }}))
    ))
  );

  constructor(private readonly actions$: Actions,
              private readonly config: Config,
              private readonly store: Store<State>,
              private readonly geocoder: GeocoderService,
              private readonly timezoneService: TimezoneService) {
  }

  private ensureMapCenterAction({lat, lng}: LatLng, urlParams: Params, from: SiteFrom): MapCenter | undefined {
    // TODO: move to config
    const MAX_LAT = 60;
    const MIN_LAT = -45;
    if (!urlParams.c) {
      // If site is outside PVOUT map bounds, use larger zoom
      const zoom = lat > MIN_LAT && lat < MAX_LAT ? 5 : 4;
      return new MapCenter({ lat, lng, zoom }, from);
    }
  }
}

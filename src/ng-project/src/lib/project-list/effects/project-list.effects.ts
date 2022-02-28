import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, merge } from 'rxjs';
import { distinctUntilChanged, filter, map, withLatestFrom } from 'rxjs/operators';

import { LatLng, latlngFromUrlParam, Site, SiteFrom } from '@solargis/types/site';

import { Config } from 'ng-shared/config';
import { LayoutProjectListToggle } from 'ng-shared/core/actions/layout.actions';
import { selectLayoutProjectListDataTab } from 'ng-shared/core/selectors/layout.selector';
import { IPGeolocation } from 'ng-shared/core/types';

import { AddProject, PROJECT_ADD, RemoveProjects } from '../../project/actions/project.actions';
import {
  Actions as SiteActions, SiteFromGeolocation, SiteFromIPlocation,
  SITE_FROM_GEOLOCATION, SITE_FROM_IPLOCATION, SITE_FROM_MAP, SITE_FROM_SEARCH, SITE_FROM_URL
} from '../../project/actions/site.actions';
import { Sg1FtpExportProjectsService } from '../../project/services/sg1-ftp-export-projects.service';
import { exportProjectsOperator } from '../../project/utils/export-projects.operator';
import { ExportSelected, PROJECT_LIST_EXPORT_SELECTED } from '../actions/selected.actions';
import { State } from '../reducers';
import {
  selectFilteredSelectedProjects,
  selectIsSelectedMulti,
  selectIsSelectedProjectTemporal,
  selectSelectedProject
} from '../selectors';
import { ensureProject } from './project-list-core.effects';

export function actionTypeToSiteFrom(type: string): SiteFrom {
  const words = type.split(' ');
  return words[words.length - 1] as SiteFrom; // last word equals to SiteFrom
}

@Injectable()
export class ProjectListEffects {

  @Effect()
  addToList$ = merge(
    this.actions$.pipe(
      ofType<SiteActions>(SITE_FROM_URL, SITE_FROM_MAP, SITE_FROM_SEARCH),
      map(action => {
        const siteLike = action.payload;
        const from = actionTypeToSiteFrom(action.type);

        if (typeof siteLike === 'string') {
          // may be latlng or siteid
          const latlng = latlngFromUrlParam(siteLike);
          return ensureProject({ point: latlng, from });
        } else if (Object.prototype.hasOwnProperty.call(siteLike, 'lat') && Object.prototype.hasOwnProperty.call(siteLike, 'lng')) {
          return ensureProject({ point: siteLike as LatLng, from });

        } else { return ensureProject({ ...siteLike, from } as Site); }
      })
    ),

    this.actions$.pipe(
      ofType<SiteFromIPlocation>(SITE_FROM_IPLOCATION),
      map(action => {
        const loc: IPGeolocation = action.payload;
        return ensureProject({
          point: loc.point,
          from: 'iplocation'
        });
      })
    ),

    this.actions$.pipe(
      ofType<SiteFromGeolocation>(SITE_FROM_GEOLOCATION),
      map(action => {
        const pos: GeolocationPosition = action.payload;
        const { latitude: lat, longitude: lng } = pos.coords;
        return ensureProject({
          point: { lat, lng },
          from: 'geolocation',
          position: pos
        });
      })
    )
  ).pipe(
    withLatestFrom(this.store.select('project', 'projects')),
    map(([project, list]) => {
      // merge site already in list
      const projectFromList = list.get(project._id);
      const projectToAdd = projectFromList ? { ...project, ...projectFromList } : project;
      return new AddProject(projectToAdd);
    })
  );

  @Effect()
  removeTemporalProjects$ = this.actions$.pipe(
    ofType<AddProject>(PROJECT_ADD),
    withLatestFrom(this.store.select('project', 'projects')),
    map(([{ payload: addedProject }, projects]) => projects
      .filter(project => project._id !== addedProject._id && !project.created)
      .map(project => project._id)
    ),
    filter(temporalIds => temporalIds && !!temporalIds.length),
    map(temporalIds => new RemoveProjects(temporalIds))
  );

  // auto-switch to map-data if temporal site in the map is selected
  @Effect()
  mapDataForUnsavedProject$ = combineLatest(
    this.store.pipe(selectIsSelectedProjectTemporal),
    this.store.pipe(selectIsSelectedMulti)
  ).pipe(
    map(([temporal, multi]) => temporal && !multi),
    distinctUntilChanged(),
    withLatestFrom(this.store.pipe(selectLayoutProjectListDataTab)),
    filter(([temporalNoMulti, dataTab]) => temporalNoMulti && dataTab === 'projectData'),
    map(() => new LayoutProjectListToggle({ dataTab: 'mapData' }))
  );

  @Effect()
  exportSelectedProjects$ = this.actions$.pipe(
    ofType<ExportSelected>(PROJECT_LIST_EXPORT_SELECTED),
    withLatestFrom(
      this.store.pipe(selectFilteredSelectedProjects), this.store.pipe(selectSelectedProject),
      (action, projects, project) => [projects, project]
    ),
    exportProjectsOperator(this.dialog, this.exportService)
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly http: HttpClient,
    private readonly config: Config,
    private readonly dialog: MatDialog,
    private readonly exportService: Sg1FtpExportProjectsService
  ) { }
}


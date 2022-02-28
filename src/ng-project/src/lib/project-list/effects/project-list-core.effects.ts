import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { range } from 'lodash-es';
import { combineLatest, defer, forkJoin, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { Project } from '@solargis/types/project';
import { LatLng, latlngToUrlParam, Site } from '@solargis/types/site';

import { selectUser } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';
import { UserState } from 'ng-shared/user/types';
import { distinctByCompanyId } from 'ng-shared/user/utils/distinct-company.operator';

import { AddProject, SetProjects } from '../../project/actions/project.actions';
import { ProjectListLoadService } from '../../project/services/project-list-load.service';
import { State } from '../reducers';
import { selectSelectedProject } from '../selectors';

const newProjectId = (point: LatLng): string => `_NEW_${latlngToUrlParam(point)}`;

export function ensureProject(site: Partial<Site>): Project {
  return {
    _id: newProjectId(site.point),
    site: { ...site } as Site,
    status: 'temporal',
  } as Project;
}

@Injectable()
export class ProjectListCoreEffects {

  private static readonly pageSize = 250;

  @Effect()
  loadProjects$ = defer(() => combineLatest(
    this.store.pipe(selectUser),
    this.store.pipe(selectActiveOrNoCompany, distinctByCompanyId())
  )).pipe(
    debounceTime(50),
    distinctUntilChanged(),
    withLatestFrom(
      this.store.pipe(selectSelectedProject),
      ([user,], project) => [user, project]
    ),
    map(([user, project]: [UserState, Project]) => {
      // keep current temporal site
      const temporalProject = project && !project.created ? project : undefined;
      // switch selected-saved project as temporal site
      const selectedProject = project && project.created && ensureProject(project.site);
      return [user, temporalProject, selectedProject];
    }),
    switchMap(([user, temporal, selected]) => user ?
      this.loadProjectList().pipe(
        map(projects => [projects, temporal, selected] as [Project[], Project, Project])
      ) :
      of([[], temporal, selected] as [Project[], Project, Project])
    ),
    switchMap(([projects, temporal, selected]) => selected
      ? [new SetProjects(projects, temporal), new AddProject(selected)]
      : [new SetProjects(projects, temporal)]
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly projectListLoadService: ProjectListLoadService
  ) {

  }

  private loadProjectList(): Observable<Project[]> {
    return this.projectListLoadService.load({ page: { index: 0, size: ProjectListCoreEffects.pageSize } }).pipe(
      switchMap(firstPage => {
        if (firstPage.count <= ProjectListCoreEffects.pageSize) {
          return of(firstPage.data);
        }
        const additionalPages$ = range(1, Math.ceil(firstPage.count / ProjectListCoreEffects.pageSize))
          .map(pageIndex => this.projectListLoadService
            .load({ page: { index: pageIndex, size: ProjectListCoreEffects.pageSize } })
            .pipe(map(additionalPage => additionalPage.data))
          );
        return forkJoin(additionalPages$)
          .pipe(map(additionalPages => firstPage.data.concat(...additionalPages)));
      })
    );
  }
}


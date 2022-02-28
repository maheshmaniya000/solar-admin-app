import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, first, map, switchMap, withLatestFrom, distinctUntilChanged } from 'rxjs/operators';

import { VersionedDatasetDataMap } from '@solargis/types/dataset';
import { getProjectDefaultSystemId, Project, getProjectAnnualData } from '@solargis/types/project';
import { latlngEquals } from '@solargis/types/site';

import { ClearProjectDetailLink, SetProjectDetailLink } from 'ng-shared/core/actions/header.actions';
import { selectUserPermissions } from 'ng-shared/user/selectors/permissions.selectors';

import { DataLoad } from '../../project/actions/project-data.actions';
import {
  PROJECT_ADD, PROJECT_SAVED, PROJECT_SET_PROJECTS,
  AddProject, BulkUpdate, BulkDelete, SetProjects
} from '../../project/actions/project.actions';
import {
  PROJECT_LIST_SELECT, PROJECT_LIST_SELECT_ALL, PROJECT_LIST_TOGGLE_SELECT_ALL, PROJECT_LIST_UPDATE_SELECTED, PROJECT_LIST_DELETE_SELECTED,
  ClearSelected, SelectMulti, Select, UpdateSelected, DeleteSelected,
} from '../actions/selected.actions';
import { State } from '../reducers';
import {
  selectFilteredProjects,
  selectFilteredSelectedProjects,
  selectIsAllProjectsSelected,
  selectIsSelectedMulti,
  selectSelectedProject,
  selectSelectedProjectData,
} from '../selectors';


@Injectable()
export class SelectedEffects {

  @Effect()
  selectNewProject$ = this.actions$.pipe(
    ofType<AddProject>(PROJECT_ADD),
    map(({ payload: project }) => new Select({ project, multi: false }))
  );

  @Effect()
  selectAll$ = this.actions$.pipe(
    ofType(PROJECT_LIST_SELECT_ALL),
    withLatestFrom(this.store.pipe(selectFilteredProjects)),
    map(([, projects]) => projects.map(project => project._id)),
    map(projectIds => new SelectMulti(projectIds))
  );

  @Effect()
  toggleSelectAll$ = this.actions$.pipe(
    ofType(PROJECT_LIST_TOGGLE_SELECT_ALL),
    withLatestFrom(this.store.pipe(selectIsAllProjectsSelected), (action, all) => all),
    withLatestFrom(this.store.pipe(selectFilteredProjects)),
    map(([isAllSelected, projects]) => isAllSelected
      ? new ClearSelected()
      : new SelectMulti(projects.map(project => project._id))
    )
  );

  @Effect()
  updateSelected$ = this.actions$.pipe(
    ofType<UpdateSelected>(PROJECT_LIST_UPDATE_SELECTED),
    withLatestFrom(this.store.pipe(selectFilteredSelectedProjects),
      (action, projects) => ({
        _id: projects.map(project => project._id),
        update: action.payload
      })),
    map(payload => new BulkUpdate(payload))
  );

  @Effect()
  unselectMultiIfEmpty = this.store.pipe(
    selectIsSelectedMulti,
    withLatestFrom(this.store.select('projectList', 'selected')),
    filter(([isSelectedMulti, selected]) =>
      !isSelectedMulti && selected.multi && !!selected.multi.length
    ),
    // here we could unselect hidden projects, but it should be the same as clearing selection
    map(() => new ClearSelected())
  );

  // unselectUpdated$

  @Effect()
  deleteSelected$ = this.actions$.pipe(
    ofType<DeleteSelected>(PROJECT_LIST_DELETE_SELECTED),
    withLatestFrom(
      this.store.pipe(selectFilteredSelectedProjects),
      (action, projects) => projects.map(project => project._id)),
    map(projectIds => new BulkDelete(projectIds))
  );

  @Effect()
  loadSelectedProjectData$ = combineLatest(
    this.actions$.pipe(ofType<Select>(PROJECT_LIST_SELECT, PROJECT_SAVED)),
    this.store.pipe(selectUserPermissions)

  ).pipe(
    map(([action,]) => action),
    withLatestFrom(this.store.pipe(selectSelectedProject), (action, project) => project),
    filter(project => project && !!project.created),
    switchMap(project => this.store.pipe(
      selectSelectedProjectData('prospect'),
      map(data => [project, data] as [Project, VersionedDatasetDataMap]),
      first()
    )),
    switchMap(([project, data]) => {
      const projectId = project._id;
      const app = 'prospect';
      const systemId = getProjectDefaultSystemId(project, 'prospect');

      const resolution = 'monthly'; // maybe also 'annual' ?

      // check if we already have monthly data
      const ltaData = data && data.lta;
      if (ltaData && ltaData[resolution] && ltaData[resolution].data) {
        return [];
      }

      const actions = [
        new DataLoad({ projectId, app, resolution })
      ];
      if (systemId) {actions.push(
        new DataLoad({ projectId, app, systemId, resolution })
      );}
      return actions;
    })
  );

  @Effect()
  selectedProjectHeaderLink$ = this.store.pipe(
    selectSelectedProject,
    map(project => {
      const data = getProjectAnnualData(project, 'prospect', 'lta');
      if (!!data && data.data && data.data.GHI) {
        return project._id;
      } else {
        return null;
      }
    }),
    distinctUntilChanged(),
    map(_id => _id ? new SetProjectDetailLink({ _id }) : new ClearProjectDetailLink())
  );

  @Effect()
  matchSelectedProjectFromUrl$ = this.actions$.pipe(
    ofType<SetProjects>(PROJECT_SET_PROJECTS),
    withLatestFrom(
      this.store.pipe(selectSelectedProject),
      (action, selected) => [action.payload, selected] as [Project[], Project]
    ),
    filter(([projects, selected]) => selected && projects && !!projects.length),
    map(([projects, selected]) =>
      projects.find((p: Project) => selected._id !== p._id && latlngEquals(p.site.point, selected.site.point))
    ),
    filter(x => !!x),
    map(matchedProject => new Select({ project: matchedProject }))
  );

  constructor(private readonly actions$: Actions, private readonly store: Store<State>) {}

}

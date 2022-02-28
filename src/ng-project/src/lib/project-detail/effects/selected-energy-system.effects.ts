import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, merge } from 'rxjs';
import { distinctUntilChanged, filter, map, withLatestFrom, tap, switchMap, mergeMap } from 'rxjs/operators';

import { EnergySystemRef, getEnergySystemRef } from '@solargis/types/project';

import { AmplitudeTrackEvent } from 'ng-shared/core/actions/amplitude.actions';
import { ClearProjectDetailLink, SetProjectDetailLink } from 'ng-shared/core/actions/header.actions';
import { selectProjectPermissions } from 'ng-shared/user/selectors/permissions.selectors';

import { ENERGY_SYSTEM_SAVED, EnergySystemUpdate, PvConfigSave, PvConfigSaved } from '../../project/actions/energy-systems.actions';
import { DataLoad } from '../../project/actions/project-data.actions';
import { PROJECT_SAVED, PROJECT_REMOVE_PROJECTS, RemoveProjects, Saved } from '../../project/actions/project.actions';
import { distinctEnergySystemByRef } from '../../project/utils/distinct-energy-system.operator';
import { distinctProjectByProjectAppSubscriptionType } from '../../project/utils/distinct-project.operator';
import { PV_CONFIG_SAVE, Save } from '../../pv-config/actions/draft.actions';
import { ClearSystem, SelectSystem } from '../actions/selected-system.actions';
import { State } from '../reducers';
import { selectSelectedEnergySystemProject, selectSelectedEnergySystemRef } from '../selectors';


@Injectable()
export class SelectedEnergySystemEffects {

  @Effect()
  savePvConfig$ = this.actions$.pipe(
    ofType<Save>(PV_CONFIG_SAVE),
    map(action => action.payload),
    withLatestFrom(this.store.select('projectDetail', 'selectedEnergySystem')),
    mergeMap(([pvConfig, systemRef]) => [
      systemRef.systemId
      ? new EnergySystemUpdate({ systemRef, update: { pvConfig }})
      : new PvConfigSave({ systemRef, isDefault: true, pvConfig }),
      new AmplitudeTrackEvent('pv_config_save', { pvConfig, energySystem: systemRef})
    ]),
  );

  @Effect({ dispatch: false })
  selectAfterSave$ = this.actions$.pipe(
    ofType<Saved>(PROJECT_SAVED),
    tap(result => {
      if (this.router.url && this.router.url.startsWith('/detail/')) {
        this.router.navigate(['detail', result.payload.newProject._id]);
      }
    })
  );

  @Effect()
  clearAfterRemoveProject$ = this.actions$.pipe(
    ofType<RemoveProjects>(PROJECT_REMOVE_PROJECTS),
    map(action => action.payload),
    withLatestFrom(this.store.pipe(selectSelectedEnergySystemRef)),
    filter(([removedProjectIds, ref]) => ref && removedProjectIds.includes(ref.projectId)),
    map(() => new ClearSystem())
  );

  private readonly selectedSystemRef$ = this.store.pipe(selectSelectedEnergySystemRef, distinctEnergySystemByRef());

  private readonly selectedSystemRefWithPermissions$ = combineLatest(
    this.selectedSystemRef$,
    this.store.pipe(selectSelectedEnergySystemProject, distinctProjectByProjectAppSubscriptionType('prospect'))
  ).pipe(
    filter(([ref, project]) => ref && project && ref.projectId === project._id), // just double-check
    switchMap(([ref, project]) => this.store.pipe(
      selectProjectPermissions(project),
      map(permissions => [ref, permissions] as [EnergySystemRef, string[]]))
    )
  );

  @Effect()
  loadSelectedEnergySystemData = merge(
    // project-app
    this.selectedSystemRefWithPermissions$.pipe(
      map(([ref]) => ref && { projectId: ref.projectId, app: ref.app }),
      filter(ref => !!ref) // intentionally filter after distinct!
    ),
    // energy system
    this.selectedSystemRefWithPermissions$.pipe(
      map(([ref]) => ref),
      filter(ref => ref && !!ref.systemId) // intentionally filter after distinct!
    )
  ).pipe(
    // later we will add some filter to check if we already have data (whitch data?)
    map(systemRef => new DataLoad(systemRef))
  );

  @Effect()
  selectSavedNewEnergySystem$ = this.actions$.pipe(
    ofType<PvConfigSaved>(ENERGY_SYSTEM_SAVED),
    map(action => action.payload),
    withLatestFrom(this.store.select('projectDetail', 'selectedEnergySystem')),
    filter(([newSystem, systemRef]) => !systemRef.systemId && newSystem.isDefault),
    map(([newSystem,]) => new SelectSystem(getEnergySystemRef(newSystem)))
  );

  @Effect()
  selectedEnergySystemDetailLink$ = this.selectedSystemRef$.pipe(
    map(ref => ref && ref.projectId),
    distinctUntilChanged(),
    map(_id => _id
      ? new SetProjectDetailLink({ _id })
      : new ClearProjectDetailLink()
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly router: Router,
  ) {}

}

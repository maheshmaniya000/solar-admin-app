import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { merge, of, Observable } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap } from 'rxjs/operators';

import { EnergySystem, EnergySystemList, EnergySystemRef, UpdateEnergySystemOpts, getEnergySystemRef } from '@solargis/types/project';

import { Config } from 'ng-shared/config';

import {
  ENERGY_SYSTEM_DELETE, ENERGY_SYSTEM_LOAD, ENERGY_SYSTEM_SAVE_PV_CONFIG, ENERGY_SYSTEM_SAVED, ENERGY_SYSTEM_UPDATE, ENERGY_SYSTEM_UPDATED,
  EnergySystemDelete, EnergySystemDeleted, EnergySystemError, EnergySystemLoad, EnergySystemLoaded, EnergySystemUpdate,
  EnergySystemUpdated, PvConfigSave, PvConfigSaved
} from '../actions/energy-systems.actions';
import { DataLoad } from '../actions/project-data.actions';
import { Load } from '../actions/project.actions';
import { State } from '../reducers';

type EnergySystemLoadResult = { err?: any; systemRef: EnergySystemRef; energySystems?: EnergySystem[] };
type EnergySystemResult = { err?: any; systemRef: EnergySystemRef; energySystem?: EnergySystem; update?: UpdateEnergySystemOpts };

@Injectable()
export class EnergySystemApiEffects {

  loadOneEnergySystem$ = this.actions$.pipe(
    ofType<EnergySystemLoad>(ENERGY_SYSTEM_LOAD),
    filter(action => !!action.payload.systemId),
    mergeMap(({ payload: systemRef }) => {
      const { projectId, app, systemId } = systemRef;
      const url = `${this.config.api.projectUrl}/${projectId}/system/${app}/${systemId}`;
      return this.http.get(url).pipe(
        map(system => ({ systemRef, energySystems: [system] })),
        catchError(err => of({ err, systemRef }))
      );
    })
  );

  loadProjectEnergySystems$ = this.actions$.pipe(
    ofType<EnergySystemLoad>(ENERGY_SYSTEM_LOAD),
    filter(action => !action.payload.systemId),
    mergeMap(({ payload: systemRef }) => {
      const { projectId, app } = systemRef;
      const url = `${this.config.api.projectUrl}/${projectId}/system` + (app ? `/${app}` : '');
      return this.http.get(url).pipe(
        map((list: EnergySystemList) => ({ systemRef, energySystems: list.data })),
        catchError(err => of({ err, systemRef }))
      );
    })
  );

  @Effect()
  loadEnergySystems$ = merge(this.loadOneEnergySystem$, this.loadProjectEnergySystems$).pipe(
    // @ts-ignore
    map(({ err, systemRef, energySystems }: EnergySystemLoadResult) => err
      ? new EnergySystemError({ ...systemRef, progressKey: 'load', error: err })
      : new EnergySystemLoaded({ ...systemRef, energySystems })
    )
  );

  @Effect()
  savePvConfig$ = this.actions$.pipe(
    ofType<PvConfigSave>(ENERGY_SYSTEM_SAVE_PV_CONFIG),
    switchMap(({ payload: opts }) => {
      const { systemRef, ...saveOpts } = opts;
      const { projectId, app } = systemRef;
      const url = `${this.config.api.projectUrl}/${projectId}/system/${app}`;
      return this.http.post(url, saveOpts).pipe(
        map((energySystem: EnergySystem) => ({ systemRef, energySystem })),
        catchError(err => of({ err, systemRef }))
      );
    }),
    map(({ err, systemRef, energySystem }: EnergySystemResult) => err
      ? new EnergySystemError({ ...systemRef, progressKey: 'save', error: err })
      : new PvConfigSaved(energySystem)
    )
  );

  @Effect()
  updateEnergySystem$ = this.actions$.pipe(
    ofType<EnergySystemUpdate>(ENERGY_SYSTEM_UPDATE),
    mergeMap(({ payload: { systemRef, update } }) => {
      const { projectId, app, systemId } = systemRef;
      const url = `${this.config.api.projectUrl}/${projectId}/system/${app}/${systemId}`;
      return this.http.patch(url, update).pipe(
        map(energySystem => ({ systemRef, energySystem, update })),
        catchError(err => of({ err, systemRef }))
      );
    }),
    // @ts-ignore
    map(({ err, systemRef, energySystem, update }: EnergySystemResult) => err
      ? new EnergySystemError({ ...systemRef, progressKey: 'update', error: err })
      : new EnergySystemUpdated({ update, updatedSystem: energySystem })
    )
  );

  @Effect()
  deleteEnergySystem$ = this.actions$.pipe(
    ofType<EnergySystemDelete>(ENERGY_SYSTEM_DELETE),
    mergeMap(({ payload: systemRef }) => {
      const { projectId, app, systemId } = systemRef;
      const url = `${this.config.api.projectUrl}/${projectId}/system/${app}/${systemId}`;
      return this.http.delete(url).pipe(
        map(() => ({ systemRef })),
        catchError(err => of({ err, systemRef }))
      );
    }),
    map(({ err, systemRef }: EnergySystemResult) => err
      ? new EnergySystemError({ ...systemRef, progressKey: 'delete', error: err })
      : new EnergySystemDeleted(systemRef)
    )
  );

  // cascade effects

  energySystemWithUpdate$: Observable<[EnergySystem, UpdateEnergySystemOpts]> = merge(
    this.actions$.pipe(
      ofType<PvConfigSaved>(ENERGY_SYSTEM_SAVED),
      map(action => [action.payload, undefined] as [EnergySystem, UpdateEnergySystemOpts])
    ),
    this.actions$.pipe(
      ofType<EnergySystemUpdated>(ENERGY_SYSTEM_UPDATED),
      map(action => [action.payload.updatedSystem, action.payload.update] as [EnergySystem, UpdateEnergySystemOpts])
    )
  );

  @Effect()
  loadEnergySystemData$ = this.energySystemWithUpdate$.pipe(
    filter(([, update]) => !update || !!update.pvConfig),
    map(([system,]) => new DataLoad(getEnergySystemRef(system)))
  );

  @Effect()
  reloadProject$ = this.energySystemWithUpdate$.pipe(
    filter(([system,]) => system.isDefault),
    map(([system,]) => new Load(system.projectId))
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly http: HttpClient,
    private readonly config: Config
  ) { }

}

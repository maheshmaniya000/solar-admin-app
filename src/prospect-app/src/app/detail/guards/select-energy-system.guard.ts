import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  getEnergySystemRef,
  getProjectDefaultSystem
} from '@solargis/types/project';
import { SolargisApp } from '@solargis/types/user-company';

import { SelectSystem } from 'ng-project/project-detail/actions/selected-system.actions';
import { selectProjectById, State } from 'ng-project/project/reducers';

const app: SolargisApp = 'prospect'; // hardcoded app for now

/**
 * Select energy system
 */
@Injectable()
export class SelectEnergySystemGuard implements CanActivate {
  constructor(private readonly store: Store<State>) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const projectId = route.params.id;

    // TODO add systemId to params

    return this.store.pipe(
      selectProjectById(projectId),
      filter(project => !!project),
      map(project => {
        if (project) {
          // now we take only default system
          const defaultSystem = getProjectDefaultSystem(project, app);

          const systemRef = defaultSystem
            ? getEnergySystemRef(defaultSystem)
            : { projectId, app }; // no energy system

          this.store.dispatch(new SelectSystem(systemRef));
          return true;
        }
        return false;
      })
    );
  }
}

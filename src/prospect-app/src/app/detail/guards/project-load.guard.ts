import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';

import { Loaded } from 'ng-project/project/actions/project.actions';
import { selectProjectById, State } from 'ng-project/project/reducers';
import { ProjectLoadService } from 'ng-project/project/services/project-load.service';
import { selectUserData } from 'ng-shared/user/selectors/auth.selectors';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';

/**
 * Load Project if not already loaded
 */
@Injectable()
export class ProjectLoadGuard implements CanActivate {

  constructor(private readonly store: Store<State>, private readonly loadService: ProjectLoadService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const projectId = route.params.id;

    return combineLatest([
      this.store.pipe(selectActiveOrNoCompany),
      this.store.pipe(selectUserData)
    ]).pipe(
      filter(([company, userData]) => !!userData && (!!company || !userData.selectedSgCompanyId)),
      switchMap(() => this.store.pipe(selectProjectById(projectId), first())),
      switchMap(selectedProject => selectedProject
        ? of(selectedProject)
        : this.loadService.loadProject(projectId).pipe(
            tap(({ project }) => project ? this.store.dispatch(new Loaded(project)) : undefined),
            map(({ project }) => project)
          )
      ),
      map(project => !!project)
    );
  }
}

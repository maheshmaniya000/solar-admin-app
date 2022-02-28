import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { withLatestFrom, map, filter } from 'rxjs/operators';

import { SetFilter, PROJECT_LIST_SET_FILTER, PROJECT_LIST_SET_TAG_FILTER } from '../actions/filter.actions';
import { ClearSelected } from '../actions/selected.actions';
import { State } from '../reducers';
import { selectSelectedProject } from '../selectors';

@Injectable()
export class FilterEffects {

  @Effect()
  unselectOnFilterChange$ = this.actions$.pipe(
    ofType<SetFilter>(PROJECT_LIST_SET_FILTER, PROJECT_LIST_SET_TAG_FILTER),
    withLatestFrom(
      this.store.select('projectList', 'selected'),
      this.store.pipe(selectSelectedProject)
    ),
    filter(([, selected, project]) =>
      ((selected.multi && !!selected.multi.length) || (project && !!project.created))
    ),
    map(() => new ClearSelected())
  );

  constructor(private readonly actions$: Actions, private readonly store: Store<State>) {
  }

}

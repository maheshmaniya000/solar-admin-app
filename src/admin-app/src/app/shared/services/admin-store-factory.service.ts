import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CreateEffectMetadata } from '@ngrx/effects/src/models';
import { ActionCreator, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { mergeMap, withLatestFrom } from 'rxjs/operators';

import { Page } from '@solargis/types/api';

import { UpdateUserSettings } from 'ng-shared/user/actions/auth.actions';

import { AdminSelectors, fromAdmin } from '../../store';

@Injectable({ providedIn: 'root' })
export class AdminStoreFactoryService {
  constructor(private readonly actions$: Actions, private readonly store: Store<fromAdmin.State>) {}

  createUpdatePageSizeEffect<T extends ActionCreator<string,() => any>>(
    trigger: ActionCreator<string, (props: { page: Page }) => { page: Page }>,
    reloadAction: T
  ): Observable<UpdateUserSettings | T> & CreateEffectMetadata {
    return createEffect(() =>
      this.actions$.pipe(
        ofType(trigger),
        withLatestFrom(this.store.select(AdminSelectors.selectAdminPageSize)),
        mergeMap(([{ page }, currentPageSize]) => [
          ...(page.size !== currentPageSize
            ? [new UpdateUserSettings({ tableView: { adminAll: { pageSize: page.size } } })]
            : []),
          reloadAction()
        ])
      )
    );
  }
}

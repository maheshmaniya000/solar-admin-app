import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, first, map, withLatestFrom, tap } from 'rxjs/operators';

import { AFTER_BOOTSTRAP } from 'ng-shared/core/actions/bootstrap.action';
import { StorageProviderService } from 'ng-shared/core/services/storage-provider.service';

import { SITE_FROM_GEOLOCATION, SITE_FROM_MAP, SITE_FROM_SEARCH, SITE_FROM_URL } from '../../project/actions/site.actions';
import { SearchClearResults } from '../actions/search.actions';
import { SEARCH_ADD_TO_HISTORY, SearchAddToHistory } from '../actions/search.actions';
import { State } from '../reducers';
import { SearchState } from '../reducers/search.reducer';

const HISTORY_STORAGE_KEY = 'search-history';

@Injectable()
export class SearchEffects {

  @Effect()
  clearResults$ = this.actions$.pipe(
    ofType(SITE_FROM_SEARCH, SITE_FROM_URL, SITE_FROM_MAP, SITE_FROM_GEOLOCATION),
    withLatestFrom(this.store.select('projectList', 'search'), (action, search) => search),
    filter((search: SearchState) => search && !!search.results),
    map(() => new SearchClearResults())
  );

  @Effect()
  initHistory$ = this.actions$.pipe(
    ofType(AFTER_BOOTSTRAP), // cannot use defer() because reducer is not listening yet
    first(),
    map(() => this.storage.getItem(HISTORY_STORAGE_KEY)),
    filter(historyStr => !!historyStr),
    map(historyStr => new SearchAddToHistory(JSON.parse(historyStr)))
  );

  @Effect({ dispatch: false })
  storeHistory$ = this.actions$.pipe(
    ofType(SEARCH_ADD_TO_HISTORY),
    withLatestFrom(this.store.select('projectList', 'search'), (action, search) => search),
    tap(search => {
      const history = search && search.history ? search.history : [];
      this.storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    })
  );

  private readonly storage: Storage;

  constructor(private readonly actions$: Actions, private readonly store: Store<State>, storageProvider: StorageProviderService) {
    this.storage = storageProvider.getLocalStorage();
  }

}

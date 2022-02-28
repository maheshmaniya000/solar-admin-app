import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { defer, of } from 'rxjs';
import { filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Config } from '../../config';
import { UpdateUserSettings } from '../../user/actions/auth.actions';
import { AFTER_BOOTSTRAP } from '../actions/bootstrap.action';
import {
  SettingsDateTimeFormat,
  SettingsGeolocation,
  SettingsInit,
  SettingsToggles,
  SETTINGS_ACCEPT_COOKIES,
  SETTINGS_COMPARE_DIALOG_PAGE_SIZE,
  SETTINGS_DATE_FORMAT,
  SETTINGS_LAYOUT,
  SETTINGS_SELECT_MAP_DATA_KEYS,
  SETTINGS_SELECT_PROJECT_LIST_DATA_KEYS,
  SETTINGS_SELECT_SOLAR_METEO_TABLE_KEYS,
  SETTINGS_TOGGLES,
  SETTINGS_TRANSLATE_LANG
} from '../actions/settings.actions';
import { State } from '../reducers';
import { DEFAULT_SETTINGS } from '../reducers/settings.reducer';
import { GeolocatorService } from '../services/geolocator.service';
import { StorageProviderService } from '../services/storage-provider.service';

const STORAGE_KEY = 'settings'; // TODO configurable?

@Injectable()
export class SettingsEffects {
  @Effect()
  initSettings$ = defer(() => {
    const settingsStr = this.storage.getItem(STORAGE_KEY);
    if (settingsStr) {
      const initialSettings = JSON.parse(settingsStr);
      return of(new SettingsInit(initialSettings));
    }
  });

  @Effect()
  geolocate$ = this.actions$.pipe(
    ofType(AFTER_BOOTSTRAP),
    switchMap(() => this.config.geolocator.enabled
      ? this.geolocator.locateIP().pipe(map(location => new SettingsGeolocation(location)))
      : of(null)
    ),
    filter(x => !!x)
  );

  @Effect({ dispatch: false })
  storeSettings$ = this.actions$.pipe(
    ofType(
      SETTINGS_SELECT_MAP_DATA_KEYS,
      SETTINGS_SELECT_PROJECT_LIST_DATA_KEYS,
      SETTINGS_ACCEPT_COOKIES,
      SETTINGS_COMPARE_DIALOG_PAGE_SIZE,
      SETTINGS_LAYOUT,
      SETTINGS_TOGGLES,
      SETTINGS_TRANSLATE_LANG,
      SETTINGS_DATE_FORMAT,
      SETTINGS_SELECT_SOLAR_METEO_TABLE_KEYS
    ),
    withLatestFrom(this.store.select('settings'), (action, settings) => settings),
    tap(settings => {
      if (isEqual(settings, DEFAULT_SETTINGS)) {
        this.storage.removeItem(STORAGE_KEY);
      } else {
        const settingsStr = JSON.stringify(settings);
        this.storage.setItem(STORAGE_KEY, settingsStr);
      }
    })
  );

  @Effect()
  updateUnitToggleSettings$ = this.actions$.pipe(
    ofType<SettingsToggles>(SETTINGS_TOGGLES),
    filter(action => !!action.payload && action.payload.length > 0 && action.save),
    map(action => {
      const unitToggles = action.payload.reduce((result, item) => {
        const { settingsKey, toggleKey } = item;
        result[settingsKey] = toggleKey;
        return result;
      }, {});
      return new UpdateUserSettings({ unitToggles });
    })
  );

  @Effect()
  updateDateTimeSettings$ = this.actions$.pipe(
    ofType<SettingsDateTimeFormat>(SETTINGS_DATE_FORMAT),
    filter(action => !!action.payload && action.save),
    map(action => new UpdateUserSettings({ dateTimeFormat: action.payload }))
  );

  private readonly storage: Storage;

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly geolocator: GeolocatorService,
    private readonly config: Config,
    storageProvider: StorageProviderService
  ) {
    this.storage = storageProvider.getLocalStorage();
  }
}

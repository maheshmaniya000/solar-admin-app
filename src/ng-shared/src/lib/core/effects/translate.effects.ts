import { Injectable } from '@angular/core';
import { getBrowserLang, TranslocoService } from '@ngneat/transloco';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { defer, of } from 'rxjs';
import { delay, filter, map, tap, withLatestFrom } from 'rxjs/operators';

import { UpdateUserSettings } from '../../user/actions/auth.actions';
import { SettingsTranslateLang, SETTINGS_TRANSLATE_LANG } from '../actions/settings.actions';
import { availableLanguages } from '../models';
import { State } from '../reducers';

const availableLangs = availableLanguages.map(l => l.lang);

@Injectable()
export class TranslateEffects {

  @Effect()
  init$ = defer(() => of(getBrowserLang())).pipe(
    withLatestFrom(this.store.select('settings', 'translate'),
      (browserLang, settings) => [settings ? settings.lang : undefined, browserLang, 'en']),
    map((langs: string[]) => langs.filter(lang => !!lang && availableLangs.includes(lang))),
    map(lang => new SettingsTranslateLang(lang[0])),
    delay(50)
  );

  @Effect({ dispatch: false })
  use$ = this.actions$.pipe(
    ofType<SettingsTranslateLang>(SETTINGS_TRANSLATE_LANG),
    map(action => action.payload),
    filter(lang => lang !== this.transloco.getActiveLang()),
    tap(lang => {
      this.transloco.setActiveLang(lang);
    }),
  );

  @Effect()
  saveOnChange$ = this.actions$.pipe(
    ofType<SettingsTranslateLang>(SETTINGS_TRANSLATE_LANG),
    filter(action => action.payload && action.save),
    map(action => new UpdateUserSettings({ lang: action.payload })),
  );

  constructor(private readonly actions$: Actions, private readonly store: Store<State>, private readonly transloco: TranslocoService) {
    transloco.setDefaultLang('en');
  }

}

import { TranslocoService } from '@ngneat/transloco';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { TranslationDef } from '@solargis/types/translation';
import { isFunction } from '@solargis/types/utils';
import { Unit, UnitHtmlFn, UnitToggleSettings, getToggleKeys, getMultiToggleKeys, UnitResolution } from '@solargis/units';

export function getToggleKeys$(u: Unit, unitToggle$: Observable<UnitToggleSettings>): Observable<string[]> {
  return unitToggle$.pipe(
    map((toggle: UnitToggleSettings) => getToggleKeys(u, toggle)),
    distinctUntilChanged()
  );
}

export function getMultiToggleKeys$(units: Unit[], unitToggle$: Observable<UnitToggleSettings>): Observable<string[]> {
  return unitToggle$.pipe(
    map((toggle: UnitToggleSettings) => getMultiToggleKeys(units, toggle)),
    distinctUntilChanged()
  );
}

function getUnitHtml$(u: Unit, parentHtml: any, transloco?: TranslocoService, translateKey?: string): Observable<string> {

  const html = u.html;

  if (isFunction(html)) {
    const htmlFn: UnitHtmlFn = html as UnitHtmlFn;
    return of(htmlFn(parentHtml));

  } else if (html) {
    const td: TranslationDef = html as TranslationDef;
    const key = (typeof td.translate === 'string' ? td.translate : translateKey) as string;

    const translateParams = td.translateParams || {};
    return transloco
      ? transloco.selectTranslate(key, { ...translateParams, unit: parentHtml })
      : of(translateParams.defaultText ?? key);

  } else {
    return of(null as any as string);
  }
}

export function getToggleHtml$(u: Unit, transloco?: TranslocoService, toggleKeys?: string[]): Observable<string> {
  const rootHtml$ = getUnitHtml$(u, null, transloco);

  if (!toggleKeys || !u.toggle) {
    return rootHtml$;
  }
  return u.toggle.reduce((html$, toggle, i) => {

    const toggleKey = toggleKeys[i];
    const toggleUnit = toggle.units[toggleKey];
    const translateKey = `toggle.${toggle.settingsKey}.${toggleKey}`;

    return html$.pipe(
      switchMap(html => getUnitHtml$(toggleUnit, html, transloco, translateKey))
    );

  }, rootHtml$);

}

export function resolveUnit$(u: Unit,
                             unitToggle$: Observable<UnitToggleSettings>, transloco?: TranslocoService): Observable<UnitResolution> {

  if (u.toggle) {
    return getToggleKeys$(u, unitToggle$).pipe(
      switchMap(toggleKeys => getToggleHtml$(u, transloco, toggleKeys).pipe(
        map(html => new UnitResolution(u, html, toggleKeys))),
      )
    );

  } else {
    return getToggleHtml$(u, transloco).pipe(
      map(html => new UnitResolution(u, html))
    );
  }
}

export function resolveHtml$(u: Unit, unitToggle$: Observable<UnitToggleSettings>, transloco?: TranslocoService): Observable<string> {
  return resolveUnit$(u, unitToggle$, transloco).pipe(
    map(resolv => resolv.html)
  );
}

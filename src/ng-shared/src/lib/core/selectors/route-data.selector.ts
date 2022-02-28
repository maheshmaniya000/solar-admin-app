import { Data } from '@angular/router';
import { createSelector, select } from '@ngrx/store';
import { pipe } from 'rxjs';

import { State } from '../reducers';

const getRouteData = (state: State): Data => state.routeData;

const routeDataFullscreenSelector = createSelector(getRouteData, routeData => routeData ? !!routeData.fullscreen : false);
const routeDataFillLayoutSelector = createSelector(getRouteData, routeData => routeData ? !!routeData.fillLayout : false);
const routeDataPrintSelector = createSelector(getRouteData, routeData => routeData ? !!routeData.print : false);

export const selectRouteData = pipe(select(createSelector(getRouteData, routeData => routeData)));
export const selectRouteDataFullscreen = pipe(select(routeDataFullscreenSelector));
export const selectRouteDataFillLayout = pipe(select(routeDataFillLayoutSelector));
export const selectRouteDataPrint = pipe(select(routeDataPrintSelector));

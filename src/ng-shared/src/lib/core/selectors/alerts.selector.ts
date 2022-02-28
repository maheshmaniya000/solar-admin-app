import { createSelector, MemoizedSelector, select } from '@ngrx/store';
import { OperatorFunction, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProjectId } from '@solargis/types/project';

import { State } from '../reducers';
import { AlertsState } from '../reducers/alerts.reducer';
import { Alert, AlertRoute } from '../types';


const alertsSelector = (state: State): AlertsState => state.alerts;

export function selectAlerts(route?: AlertRoute): OperatorFunction<State, Alert[]> {
  return pipe(
    select(alertsSelector),
    map((alerts: Alert[]) => route ? alerts.filter(alert => !alert.routes || alert.routes.includes(route)) : alerts),
  );
}

export function selectAlertsCount(route?: AlertRoute): OperatorFunction<State, number> {
  return pipe(
    selectAlerts(route),
    map(alerts => alerts.length)
  );
}

export function selectAlertsByProjectId(projectId: ProjectId): MemoizedSelector<State, Alert[]> {
   return createSelector(alertsSelector, alerts => alerts.filter(alert => alert.projectId === projectId));
}

import { Action } from '@ngrx/store';

import { ProjectId } from '@solargis/types/project';

import { Alert } from '../types';


export const ALERT_ADD = '[alert] add';
export const ALERT_CLOSE = '[alert] close';
export const ALERT_PROJECT_CLOSE = '[alert] project close';

export class AddAlert implements Action {
  readonly type = ALERT_ADD;
  constructor(public alert: Alert) {}
}

export class CloseAlerts implements Action {
  readonly type = ALERT_CLOSE;
  constructor(public alerts: Alert[]) {}
}

export class CloseProjectAlerts implements Action {
  readonly type = ALERT_PROJECT_CLOSE;
  constructor(public projectId: ProjectId ) {}
}

export type AlertActions = AddAlert | CloseAlerts | CloseProjectAlerts;

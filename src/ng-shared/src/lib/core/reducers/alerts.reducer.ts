
import { AlertActions, ALERT_ADD, ALERT_CLOSE, ALERT_PROJECT_CLOSE } from '../actions/alerts.actions';
import { Alert } from '../types';

export type AlertsState = Alert[];

export function alertsReducer(state: AlertsState = [], action: AlertActions): AlertsState {
  switch (action.type) {
    case ALERT_ADD: {
      return[ ...state, action.alert];
    }
    case ALERT_CLOSE: {
      const idsToClose = action.alerts.map(alert => alert.id);
      return state.filter(alert => !idsToClose.includes(alert.id));
    }
    case ALERT_PROJECT_CLOSE: {
      return state.filter(alert => alert.projectId && alert.projectId !== action.projectId);
    }
    default:
      return state;
  }
}

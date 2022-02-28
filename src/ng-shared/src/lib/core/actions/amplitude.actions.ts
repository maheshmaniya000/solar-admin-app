import { Action } from '@ngrx/store';

import { AmplitudeEventCode, AmplitudeEventData } from '../services/amplitude-analytics.service';

export const AMPLITUDE_TRACK_EVENT = '[amplitude] track event';

export class AmplitudeTrackEvent implements Action {
  readonly type = AMPLITUDE_TRACK_EVENT;

  constructor(public event: AmplitudeEventCode, public data: AmplitudeEventData = {}) {}
}

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { tap, filter } from 'rxjs/operators';

import { AmplitudeTrackEvent, AMPLITUDE_TRACK_EVENT } from '../actions/amplitude.actions';
import { AmplitudeAnalyticsService } from '../services/amplitude-analytics.service';


@Injectable()
export class AmplitudeEffects {

  @Effect({ dispatch: false})
  amplitudeTrackEvents$ = this.actions$.pipe(
    ofType<AmplitudeTrackEvent>(AMPLITUDE_TRACK_EVENT),
    filter(action => !!action.event),
    tap(action => this.amplitude.trackEvent(action.event, action.data)),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly amplitude: AmplitudeAnalyticsService
  ) { }

}

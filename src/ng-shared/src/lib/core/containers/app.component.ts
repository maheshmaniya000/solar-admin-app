import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { AnalyticsService } from '@solargis/ng-analytics';

import { Config } from '../../config';
import { selectRouteDataFillLayout, selectRouteDataFullscreen, selectRouteDataPrint } from '../../core/selectors/route-data.selector';
import { SettingsAcceptCookies } from '../actions/settings.actions';
import { State } from '../reducers';
import { AmplitudeAnalyticsService } from '../services/amplitude-analytics.service';


@Component({
  selector: 'sg-app',
  styleUrls: ['./app.component.scss'],
  templateUrl: 'app.component.html',
})
export class AppComponent {
  noFillLayout$: Observable<boolean>;
  noFullscreen$: Observable<boolean>;

  showHeader$: Observable<boolean>;
  showAcceptCookies$: Observable<boolean>;

  constructor(
    config: Config, // force eager instance
    analytics: AnalyticsService,
    amplitude: AmplitudeAnalyticsService,
    private readonly store: Store<State>,
  ) {
    analytics.initTracking();
    amplitude.initTracking();

    this.noFillLayout$ = store.pipe(selectRouteDataFillLayout, map(fillLayout => !fillLayout));
    this.noFullscreen$ = store.pipe(selectRouteDataFullscreen, map(fullscreen => !fullscreen));

    const print$ = store.pipe(selectRouteDataPrint);

    this.showHeader$ = combineLatest([this.noFullscreen$, print$]).pipe(
      map(([noFullscreen, print]) => noFullscreen && !print),
      distinctUntilChanged()
    );

    const cookiesAccepted$ = this.store.select('settings', 'cookies', 'accepted');

    this.showAcceptCookies$ = combineLatest([print$, cookiesAccepted$]).pipe(
      map(([print, cookiesAccepted]) => !print && !cookiesAccepted),
      distinctUntilChanged()
    );
  }

  acceptCookies(): void {
    this.store.dispatch(new SettingsAcceptCookies(true));
  }
}

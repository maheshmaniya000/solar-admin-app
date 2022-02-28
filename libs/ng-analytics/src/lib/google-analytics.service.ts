import { Inject, Injectable, OnDestroy, InjectionToken } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { removeEmpty } from '@solargis/types/utils';

import { AnalyticsService } from './analytics.service';
import { GoogleAnalyticsConfig } from './types';

// how to bypass ad blockers:
// https://medium.freecodecamp.org/save-your-analytics-from-content-blockers-7ee08c6ec7ee

export const GOOGLE_ANALYTICS_CONFIG_TOKEN = new InjectionToken<GoogleAnalyticsConfig>('GoogleAnalyticsConfig');

@Injectable()
export class GoogleAnalyticsService extends AnalyticsService implements OnDestroy {

  private subscription: Subscription | undefined;

  constructor(@Inject(GOOGLE_ANALYTICS_CONFIG_TOKEN) private readonly gaConfig: GoogleAnalyticsConfig,
              private readonly router: Router, @Inject('Window') window: Window) {
    super(window);
  }

  initTracking(): void {
    const { trackingId, linkerAutolink, pageviewStrip } = this.gaConfig;

    console.log(`[GA] init: ${trackingId}`, linkerAutolink);

    ga('create', trackingId, 'auto', { allowLinker: !!linkerAutolink});

    if (linkerAutolink) {
      ga('require', 'linker');
      ga('linker:autoLink', linkerAutolink);
    }

    this.subscription = this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.urlAfterRedirects),
        map(url => pageviewStrip ? url.split(/[?#]/)[0] : url),
        distinctUntilChanged()
      )
      .subscribe(url => {
        ga('set', 'page', url);
        ga('send', 'pageview');
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  trackEvent(category: string, action: string, label?: string, value?: number/*, nonInteractive?: boolean*/): void {
    ga('send', 'event', removeEmpty({
      eventCategory: category,
      eventLabel: label,
      eventAction: action,
      eventValue: value
    }));
  }

  trackTime(category: string, variable: string, time: number, label?: string): void {
    ga('send', 'timing', removeEmpty({
      timingCategory: category,
      timingVar: variable,
      timingValue: time,
      timingLabel: label
    }));
  }

  set(name: string, value: string): void {
    ga('set', name, value);
  }

}

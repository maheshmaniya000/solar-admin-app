import { Component } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

import { AnalyticsService } from '@solargis/ng-analytics';

import { Config } from 'ng-shared/config';

@Component({
  selector: 'sg-app-print',
  template: '<router-outlet></router-outlet>',
})
export class PrintAppComponent {
  constructor(
    config: Config, // force eager instance
    analytics: AnalyticsService,
    transloco: TranslocoService
  ) {
    analytics.initTracking();
    transloco.setDefaultLang('en');
  }

}

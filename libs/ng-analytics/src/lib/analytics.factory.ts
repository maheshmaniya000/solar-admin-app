import { Router } from '@angular/router';

import { AnalyticsService } from './analytics.service';
import { GoogleAnalyticsService } from './google-analytics.service';
import { LogAnalyticsService } from './log-analytics.service';
import { GoogleAnalyticsConfig } from './types';

export function analyticsFactory(config: { ga?: GoogleAnalyticsConfig }, router: Router, window: Window): AnalyticsService {
  if (config.ga) {

    // GA code snippet
    /* eslint-disable */
    // @ts-ignore
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      // @ts-ignore
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*<any>new Date();a=s.createElement(o),
      // @ts-ignore
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,window.document,'script','https://www.google-analytics.com/analytics.js','ga');
    /* eslint-enable */

    return new GoogleAnalyticsService(config.ga, router, window);
  } else {
    return new LogAnalyticsService(window);
  }
}

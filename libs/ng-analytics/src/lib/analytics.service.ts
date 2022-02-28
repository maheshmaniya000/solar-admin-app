import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { removeEmpty } from '@solargis/types/utils';

export type TrackTimeOpts = {
  category: string;
  variable: string;
  label?: string;
};

@Injectable()
export abstract class AnalyticsService {

  performance: Performance;
  markCounter = 0;

  constructor(@Inject('Window') window: Window) {
    this.performance = window.performance;
  }

  abstract initTracking(): void;

  abstract trackEvent(category: string, action: string, label?: string, value?: number, nonInteractive?: boolean): void;

  abstract trackTime(category: string, variable: string, time: number, label?: string): void;

  abstract set(name: string, value: string): void;

  trackLoadTime(): void {
    if (!this.performance || !this.performance.mark) {
      return;
    }

    const timing = this.performance.timing;
    this.performance.mark('angularFirstDigestEnd');

    if (timing) {
      const { navigationStart, connectEnd, loadEventEnd } = timing;
      this.trackTime('network', 'latency', connectEnd - navigationStart);
      this.trackTime('page', 'load', loadEventEnd - navigationStart);
    }

    setTimeout(() => {
      this.performance.measure('angularFirstDigest', 'loadEventEnd', 'angularFirstDigestEnd');
      this.performance.measure('angularFullLoad', 'navigationStart', 'angularFirstDigestEnd');

      const angularFirstDigest = Math.round(this.performance.getEntriesByName('angularFirstDigest')[0].duration);
      const angularFullLoad = Math.round(this.performance.getEntriesByName('angularFullLoad')[0].duration);

      this.trackTime('angular', 'digest', angularFirstDigest);
      this.trackTime('angular', 'full load', angularFullLoad);
    });
  }

  trackTimeAsync<T = any>(source: Observable<T> | Promise<T>, category?: string, variable?: string, label?: string): void {
    if (!this.performance || !this.performance.mark) {
      return;
    }

    const markKey = `trackTimeAsync_${(++this.markCounter)}`;
    const measureKey = `${markKey}_measure`;

    this.performance.mark(markKey);

    const promise = source instanceof Observable
      ? (source as Observable<T>).toPromise()
      : source;

    promise.then(
      res => {
        this.performance.measure(measureKey, markKey);
        const measures = this.performance.getEntriesByName(measureKey);
        if (measures && measures.length) {
          const opts = {
            ...removeEmpty({ category, variable, label }),
            ...(res || {})
          } as TrackTimeOpts;
          const measuredMillis = Math.round(measures[0].duration);
          this.trackTime(opts.category, opts.variable, measuredMillis, opts.label);
          this.performance.clearMeasures(measureKey);
        }
        this.performance.clearMarks(markKey);
      },
      (/*err*/) => {
        this.performance.clearMarks(markKey);
      });
  }

}

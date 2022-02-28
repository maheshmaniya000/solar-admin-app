import { Injectable } from '@angular/core';

import { removeEmpty } from '@solargis/types/utils';

import { AnalyticsService } from './analytics.service';

@Injectable()
export class LogAnalyticsService extends AnalyticsService {

  private params = {};

  initTracking(): void {
    console.log('[LOG] init');
  }

  trackEvent(category: string, action: string, label?: string, value?: number, nonInteractive?: boolean): void {
    console.log('[LOG] event', category, action, label, value, nonInteractive, this.params);
  }

  trackTime(category: string, variable: string, time: number, label?: string): void {
    console.log('[LOG] time', category, variable, time, label, this.params);
  }

  set(name: string, value: string): void {
    this.params = removeEmpty({ ...this.params, [name]: value });
  }

}

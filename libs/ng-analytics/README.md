# @solargis/ng-analytics


### Usage

Add to providers in the angular module
  
    import { analyticsFactory } from '@solargis/ng-analytics';
    
    providers: [
      // other providers ...
      { provide: AnalyticsService, useFactory: analyticsFactory, deps: [Config, Router, 'Window'] }
    ]  
    
Config is anything with `{ ga?: GoogleAnlyticsConfig }`

`GoogleAnalyticsConfig` is defined as:

    export type GoogleAnalyticsConfig = {
      linkerAutolink?: string[],
      trackingId: string
    }
    
### Generic Analytics service

    // track single event
    abstract trackEvent(category: string, action: string, label?: string, value?: number, nonInteractive?: boolean): void;

    // track time as number
    abstract trackTime(category: string, variable: string, time: number, label?: string): void;

    // track time when Observable emits new event or Promise resolves
    trackTimeAsync(source: Observable<any> | Promise<any>, category: string, variable: string, label?: string) {

### Analytics service implementations

#### GoogleAnalyticsService

- Tracking route changes as page views.
- Support for `trackEvent`

#### LogAnalyticsService

- no-op analytics, logging to console only

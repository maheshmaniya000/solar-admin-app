import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import {
  geocoord,
  initGeocoder,
  DebugFn,
  Geocoder,
  GeocodeOpts,
  HereOpts,
  InitOpts,
  Result,
  TimeoutFn
} from '@solargis/geosearch';
import { LatLng, Site } from '@solargis/types/site';
import { removeEmpty } from '@solargis/types/utils';

type GeocoderWithProgress = Geocoder & {
  searchInProgress?: boolean;
};

export interface GeocoderConfig {
  here?: HereOpts;
  mapbox?: string;
  mapquest?: string;
  nominatim?: boolean;
  opencage?: string;
  bing?: string;
  yandex?: boolean;
  includeRawResponse?: boolean;
  timeout?: number | 0 | TimeoutFn;
  debug?: boolean | DebugFn;
  disableStorageCache?: boolean;
  /** Initial static lang setting */
  language?: string;
  /** Set lang on each request */
  getLanguageOnEachRequest?: () => string;
} // Partial<InitOpts>;

export const GEOCODER_CONFIG_TOKEN= new InjectionToken<GeocoderConfig>('GeocoderConfig');

@Injectable()
export class GeocoderService {
  private readonly geocoders: GeocoderWithProgress[] = [];
  private readonly initOpts: InitOpts;

  constructor(
    http: HttpClient,
    @Inject(GEOCODER_CONFIG_TOKEN) private readonly config: GeocoderConfig,
    @Inject('Window') window: Window
  ) {
    function jqueryAjaxShim(): {ajax: (options: any) => void} {
      return {
        ajax(options: any) {
          const params = Object.keys(options.data).reduce(
            (p: HttpParams, key) => p.set(key, options.data[key]), new HttpParams());

          const response$ = options.jsonp
            ? http.jsonp(`${options.url}?${params.toString()}`, options.jsonp)
            : http.get(options.url, { params });

          response$.subscribe(options.success, options.error);
        }
      };
    }

    this.initOpts = {
      ajax: ((window as any).$ || jqueryAjaxShim()).ajax,
      ...config
    };
  }

  parse(query: string): LatLng | undefined {
    try {
      return geocoord(query);
    } catch (e) {
      return undefined;
    }
  }

  search(query: LatLng | string): Observable<Partial<Site>[]> {
    const isLatLng = (value: LatLng | string): value is LatLng =>
      Object.prototype.hasOwnProperty.call(query, 'lat') &&
      Object.prototype.hasOwnProperty.call(query, 'lng');

    const geocoder = this.getFreshGeocoder();
    geocoder.searchInProgress = true;

    const out: Observable<Result> = new Observable(observer => {
      const opts: GeocodeOpts = {
        success: (res: Result) => {
          observer.next(res);
          observer.complete();
        },
        fail: err => {
          observer.error(err);
          observer.complete();
        }
      };

      if (isLatLng(query)) {
        opts.latlng = query;
      } else {
        opts.address = query;
      }

      if (this.config.getLanguageOnEachRequest) {
        opts.language = this.config.getLanguageOnEachRequest();
      }

      geocoder.geocode(opts);
    });

    return out.pipe(
      tap(() => geocoder.searchInProgress = false),
      filter(res => !!(res.places && res.places.length)),
      map(res => res.places),
      map(places => places.map(place => {
        // convert to site
        const point = isLatLng(query) ? query : place.point;
        return removeEmpty({ point, place });
      }))
    );
  }

  private getFreshGeocoder(): GeocoderWithProgress {
    return this.geocoders.find(g => !g.searchInProgress) || this.initNewGeocoder();
  }

  private initNewGeocoder(): GeocoderWithProgress {
    const newGeocoder = initGeocoder(this.initOpts);
    this.geocoders.push(newGeocoder);
    return newGeocoder;
  }

}

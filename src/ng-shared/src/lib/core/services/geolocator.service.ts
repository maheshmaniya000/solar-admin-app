import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AnalyticsService } from '@solargis/ng-analytics';
import { latlngFromUrlParam } from '@solargis/types/site';

import { Config } from '../../config';
import { IPGeolocation } from '../types';
import { StorageProviderService } from './storage-provider.service';

const STORAGE_KEY = 'geolocation';

type GeolocationStorage = {
  [ ip: string ]: IPGeolocation;
};

@Injectable()
export class GeolocatorService {

  private readonly http: HttpClient;
  private readonly storage: Storage;

  constructor(
    private readonly analytics: AnalyticsService,
    private readonly config: Config,
    private readonly httpBackend: HttpBackend,
    storageProvider: StorageProviderService,
  ) {
    this.http = new HttpClient(httpBackend);
    this.storage = storageProvider.getLocalStorage();
  }

  locateIP(): Observable<IPGeolocation> {
    const locStr = this.storage.getItem(STORAGE_KEY);
    const loc: GeolocationStorage = locStr ? JSON.parse(locStr) : {};
    const ip = this.config.ip;
    const ipstack = this.config.ipstack;

    if (loc) {
      const locIP: IPGeolocation = loc[ip];
      if (locIP) {
        return of(locIP);
      }
    }

    const params = new HttpParams({ fromObject: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      access_key: ipstack.key,
      output: 'json' }
    });

    return this.http.get(`${ipstack.url}/check`, { params })
      .pipe(
        map((res: any) => {
          const { latitude: lat, longitude: lng } = res;

          if (typeof lat !== 'undefined' && typeof lng !== 'undefined') {
            const locIP: IPGeolocation = {
              point: { lat, lng },
              provider: 'ipstack',
              countryCode: res.country_code,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              raw_response: res
            };

            loc[ip] = locIP;
            this.storage.setItem(STORAGE_KEY, JSON.stringify(loc));
            return locIP;

          } else {return this.fallbackLocateIP('latlng missing');}
        }),
        catchError(() => of(this.fallbackLocateIP('error')))
      );
  }

  private fallbackLocateIP(label: string): IPGeolocation {
    this.analytics.trackEvent('geolocator', 'fallback', label, undefined, true);

    const point = latlngFromUrlParam(this.config.geolocator.fallback);
    return { point, provider: 'fallback' };
  }

  isGeolocationAvailable(): boolean {
    const isSecure = location.protocol === 'https:';
    const hasGeolocation = navigator.geolocation && navigator.geolocation.getCurrentPosition;
    return isSecure && !!hasGeolocation;
  }

  locate(timeout: number = 15000): Observable<GeolocationPosition> {
    if (!this.isGeolocationAvailable()) {
      // @ts-ignore
      const err = new PositionError();
      return throwError({
        code: err.POSITION_UNAVAILABLE,
        message: 'geolocator API is not available'
      });
    }

    const loc = new Subject<GeolocationPosition>();
    const desiredAccuracy = 100; // m
    let watchId: number;

    const finish = (): void => {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      loc.complete();
    };

    watchId = navigator.geolocation.watchPosition(
      (pos: GeolocationPosition) => {
        loc.next(pos);
        if (pos.coords.accuracy < desiredAccuracy) {
          finish();
        }
      },
      (err: GeolocationPositionError) => {
        loc.error(err);
        finish();
      },
      {
        enableHighAccuracy: true,
        timeout
      }
    );

    return loc;
  }

  // freegeoip response:
  // {
  //   ip: '188.121.182.162',
  //   country_code: 'SK',
  //   country_name: 'Slovak Republic',
  //   region_code: 'BL',
  //   region_name: 'Bratislava',
  //   city: 'Malacky',
  //   zip_code: '901 01',
  //   time_zone: 'Europe/Bratislava',
  //   latitude: 48.436,
  //   longitude: 17.0219,
  //   metro_code: 0
  // }

}

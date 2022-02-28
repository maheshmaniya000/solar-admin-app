import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { merge, Observable, of } from 'rxjs';
import { catchError, filter, last, map, switchMap } from 'rxjs/operators';

import { getMeridianTimezone, gmtOffsetToUtcString, LatLng, Timezone, TimezoneDef } from '@solargis/types/site';

import { ProspectAppConfig } from 'ng-shared/config';

type TimezoneDbResponse = {
  status: string;           // "OK",
  message: string;           // "" or error message,
  countryCode: string;       // "SK",
  countryName: string;       // "Slovakia",
  regionName: string;        // "Trnavský",
  cityName: string;          // "Holice",
  zoneName: string;          // "Europe/Bratislava",
  abbreviation: string;      // "CEST",
  gmtOffset: number;         // 7200,
  dst: '0' | '1';            // 1",
  dstStart: number;          // 1521939600,
  dstEnd: number;            // 1540688400,
  nextAbbreviation: string;  // "CET",
  timestamp: number;         // 1528248262,
  formatted: string;         // "2018-06-06 01:24:22"
};

function getTimezoneDef(res: TimezoneDbResponse): TimezoneDef {
  const { abbreviation, gmtOffset, timestamp, dstStart: start, dstEnd: end } = res;
  const tz: TimezoneDef = {
    abbreviation,
    gmtOffset,
    timestamp,
    start, end,
    // raw_response: res
  };
  if (!end) {delete tz.end;}
  return tz;
}


@Injectable()
export class TimezoneService {

  private readonly http: HttpClient;

  constructor(private readonly httpBackend: HttpBackend, private readonly config: ProspectAppConfig) {
    this.http = new HttpClient(httpBackend);
  }

  // https://vip.timezonedb.com/v2/get-time-zone?key=OX7AD7FQO41D&by=zone&format=json&zone=America/Denver&time=1541318400

  getTimezone(point: LatLng): Observable<Timezone> {
    const url = `${this.config.timezonedb.url}/get-time-zone`;
    const params = {
      key: this.config.timezonedb.key,
      by: 'position', format: 'json',
      lat: point.lat.toString(),
      lng: point.lng.toString()
    };

    const timezone$ = merge(
      this.http.get<TimezoneDbResponse>(url, { params }).pipe(
        filter(res => res.status === 'OK' && !res.message),
        switchMap((res): Observable<Timezone> => {
          const { zoneName } = res;
          const tzDef: TimezoneDef = getTimezoneDef(res);

          if (res.nextAbbreviation && res.dstEnd) { // has DST
            const nextParams = {
              key: this.config.timezonedb.key,
              by: 'zone', format: 'json',
              zone: zoneName,
              time: res.dstEnd.toString()
            };
            return this.http.get<TimezoneDbResponse>(url, { params: nextParams }).pipe(
              filter(resNext => resNext.status === 'OK' && !resNext.message),
              map(resNext => {
                const tzNextDef = getTimezoneDef(resNext);
                const [baseTzDef, dstTzDef] = res.dst === '1' ? [tzNextDef, tzDef] : [tzDef, tzNextDef];
                return {
                  source: 'timezonedb',
                  zoneName,
                  utcString: gmtOffsetToUtcString(baseTzDef.gmtOffset),
                  ...baseTzDef,
                  dst: dstTzDef
                } as Timezone;
              })
            );

          } else {return of({
            source: 'timezonedb',
            zoneName,
            utcString: gmtOffsetToUtcString(tzDef.gmtOffset),
            ...tzDef
          } as Timezone);}
        }),
        catchError(() => of(getMeridianTimezone(point)))
      ),
      of(getMeridianTimezone(point))
    ).pipe(last());

    return timezone$;
  }

}

// /* singleton pattern taken from https://github.com/angular/angular/issues/13854 */
// export function TIMEZONE_SERVICE_PROVIDER_FACTORY(http: HttpClient, config: Config, parentDispatcher: TimezoneService) {
//   return parentDispatcher || new TimezoneService(http, config);
// }
//
// export const TIMEZONE_SERVICE_PROVIDER = {
//   provide: TimezoneService,
//   deps: [HttpClient, Config, [new Optional(), new SkipSelf(), TimezoneService]],
//   useFactory: TIMEZONE_SERVICE_PROVIDER_FACTORY
// };

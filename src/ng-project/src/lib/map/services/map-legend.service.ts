import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { GrassFileLegend, GrassFileParser } from '../utils/grass-file.parser';

@Injectable()
export class MapLegendService {

  private readonly http: HttpClient;
  private cache: { [url: string]: GrassFileLegend } = {};

  private readonly grassParser = new GrassFileParser();

  constructor(private readonly httpBackend: HttpBackend) {
    this.http = new HttpClient(httpBackend);
  }

  getGrassFileLegend(url: string, dataKey: string): Observable<GrassFileLegend> {
    if (this.cache[url]) {
      return of(this.cache[url]);
    }
    return this.http.get(url, { responseType: 'text'}).pipe(
      map(grassFile => this.grassParser.parse(grassFile, dataKey)),
      tap(lists => this.cache[url] = lists)
    );
  }

}

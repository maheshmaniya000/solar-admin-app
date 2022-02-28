import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, publishReplay, refCount, tap } from 'rxjs/operators';

import { VersionedDatasetData, VersionedDatasetDataMap, DataResolution } from '@solargis/types/dataset';
import { keySeparator, Project } from '@solargis/types/project';
import { getProjectAppHorizonRef, Horizon, horizonRefToDatasetRef } from '@solargis/types/site';

import { Config } from 'ng-shared/config';

@Injectable()
export class HorizonService {

  // TODO store horizon in Store instead of local caching

  horizonCache = {};

  constructor(private readonly http: HttpClient, private readonly config: Config) {}

  getHorizon(project: Project, resolution?: DataResolution): Observable<Horizon> {
    if (!project) {return of(undefined);}

    let horizonRef: string;

    if (!resolution) {
      horizonRef = getProjectAppHorizonRef(project, 'prospect') || `horizon${keySeparator}default`;
    } else if (resolution === 'default') {
      horizonRef = `horizon${keySeparator}default`;
    } else {
      horizonRef = getProjectAppHorizonRef(project, 'prospect');
    }

    const horizonCacheId = project._id + keySeparator + horizonRef;
    resolution = horizonRefToDatasetRef(horizonRef).resolution;

    if (!this.horizonCache[horizonCacheId]) {
      return this.http.get(`${this.config.api.projectUrl}/${project._id}/site/horizon`).pipe(
        map((data: VersionedDatasetDataMap) => data && data.horizon), // TODO here we have both 'default' and 'custom' horizons
        map((horizonDatasetData: VersionedDatasetData) => horizonDatasetData && horizonDatasetData[resolution]),
        map(horizonData => horizonData?.data?.HORIZON as Horizon),
        tap(horizon => this.horizonCache[horizonCacheId] = horizon),
        publishReplay(1), refCount()
      );
    }

    return of(this.horizonCache[horizonCacheId]);
  }

  updateHorizon(project: Project, horizon: Horizon): Observable<any> {
    if (!project) {return of(undefined);}

    return this.http.put(`${this.config.api.projectUrl}/${project._id}/site/horizon`, horizon).pipe(
      tap(() => this.removeFromCache(project))
    );
  }

  deleteHorizon(project: Project): Observable<any> {
    if (!project) {return of(undefined);}

    return this.http.delete(`${this.config.api.projectUrl}/${project._id}/site/horizon`).pipe(
      tap(() => this.removeFromCache(project))
    );
  }

  private removeFromCache(project: Project): void {
    let horizonRef = getProjectAppHorizonRef(project, 'prospect');
    let horizonCacheId = project._id + keySeparator + horizonRef;
    delete this.horizonCache[horizonCacheId];

    horizonRef =  `horizon${keySeparator}default`;
    horizonCacheId = project._id + keySeparator + horizonRef;
    delete this.horizonCache[horizonCacheId];
  }
}

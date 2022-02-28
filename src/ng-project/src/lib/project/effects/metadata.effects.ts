import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType, OnInitEffects } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { VersionedDatasetMetadataMap } from '@solargis/types/dataset/data.types';

import { Config } from 'ng-shared/config';

import { MetadataError, MetadataLoad, MetadataLoaded, METADATA_LOAD } from '../actions/metadata.actions';

@Injectable()
export class MetadataEffects implements OnInitEffects {
  @Effect()
  load$ = this.actions$.pipe(
    ofType<MetadataLoad>(METADATA_LOAD),
    switchMap(() =>
      this.http.get<VersionedDatasetMetadataMap>(`${this.config.api.prospectUrl}/metadata`).pipe(
        map(metadata => new MetadataLoaded({ app: 'prospect', metadata })),
        catchError(() => of(new MetadataError({ status: 'error' })))
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly http: HttpClient, private readonly config: Config) {}

  ngrxOnInitEffects(): Action {
    return new MetadataLoad();
  }
}

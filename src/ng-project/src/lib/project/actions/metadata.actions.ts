import { Action } from '@ngrx/store';

import { VersionedDatasetMetadataMap } from '@solargis/types/dataset';
import { SolargisApp } from '@solargis/types/user-company';

import { ErrorType } from '../types/error.types';

export const METADATA_LOAD = '[metadata] load';
export const METADATA_LOADED = '[metadata] loaded';
export const METADATA_ERROR = '[metadata] error';

export class MetadataLoad implements Action {
  readonly type = METADATA_LOAD;
}

export class MetadataLoaded implements Action {
  readonly type = METADATA_LOADED;
  constructor(public payload: { app: SolargisApp; metadata: VersionedDatasetMetadataMap }) {}
}

export class MetadataError implements Action {
  readonly type = METADATA_ERROR;
  constructor(public payload: ErrorType) {}
}

export type Actions = MetadataLoad | MetadataLoaded | MetadataError;

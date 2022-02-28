import { HttpErrorResponse } from '@angular/common/http';
import { Action } from '@ngrx/store';

import { DataResolution, UpdateProjectDataOpts, VersionedDatasetDataMap } from '@solargis/types/dataset';
import { EnergySystemRef, Project } from '@solargis/types/project';

// API actions
export const PROJECT_DATA_LOAD = '[project data] load';
export const PROJECT_DATA_LOADED = '[project data] loaded';
export const PROJECT_DATA_UPDATE = '[project data] update';
export const PROJECT_DATA_UPDATED = '[project data] updated';
export const PROJECT_DATA_CLEAR = '[project data] clear';
export const PROJECT_DATA_ERROR = '[project data] error';
export const PROJECT_DATA_NOT_FOUND = '[project data] not found';

export type ProjectDataLoad = EnergySystemRef & {
  resolution?: DataResolution | DataResolution[];
};

export type ProjectDataLoaded = EnergySystemRef & {
  dataset: VersionedDatasetDataMap;
};

export type ProjectDataUpdate = EnergySystemRef & {
  updateOpts: UpdateProjectDataOpts;
};

export type ProjectDataError = EnergySystemRef & {
  err: HttpErrorResponse;
};

export type ProjectDataNotFound = EnergySystemRef & {
  resolution?: DataResolution | DataResolution[];
};

export class DataLoad implements Action {
  readonly type = PROJECT_DATA_LOAD;
  constructor(public payload: ProjectDataLoad) {}
}

export class DataLoaded implements Action {
  readonly type = PROJECT_DATA_LOADED;
  constructor(public payload: ProjectDataLoaded) {}
}

export class DataUpdate implements Action {
  readonly type = PROJECT_DATA_UPDATE;
  constructor(public payload: ProjectDataUpdate) {}
}

export class DataUpdated implements Action {
  readonly type = PROJECT_DATA_UPDATED;
  constructor(public payload: Project) {}
}

export class DataClear implements Action {
  readonly type = PROJECT_DATA_CLEAR;
  constructor(public payload: EnergySystemRef) {}
}

export class DataError implements Action {
  readonly type = PROJECT_DATA_ERROR;
  constructor(public payload: ProjectDataError) {}
}

export class DataNotFound implements Action {
  readonly type = PROJECT_DATA_NOT_FOUND;
  constructor(public payload: ProjectDataNotFound) {}
}

export type Actions = DataLoad | DataLoaded | DataUpdate | DataUpdated | DataClear | DataError | DataNotFound;

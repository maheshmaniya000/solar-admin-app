import { Action } from '@ngrx/store';

import { BulkUpdateProjectOpts, Project, ProjectId, ProjectIdOnly, UpdateProjectOpts } from '@solargis/types/project';
import { SolargisApp } from '@solargis/types/user-company';

import { MetadataStatus } from '../reducers/projects.reducer';
import { ErrorType } from '../types/error.types';

export type ProjectError = ProjectIdOnly & ErrorType;
export type ProjectUpdate = ProjectIdOnly & UpdateProjectOpts;
export type ProjectBulkUpdate = { _id: ProjectId[]; update: BulkUpdateProjectOpts };
export type ProjectBulkError = { _id: ProjectId[]; error: ErrorType };
export type ProjectUpdateMetadataStatus = { projectId: ProjectId; app: SolargisApp } & MetadataStatus;

// load one
export const PROJECT_LOAD = '[project] load';
export const PROJECT_LOADED = '[project] loaded';

// save
export const PROJECT_SAVE_SITE = '[project] save site';
export const PROJECT_SAVED = '[project] saved';

// update
export const PROJECT_UPDATE = '[project] update';
export const PROJECT_UPDATED = '[project] updated';

// delete
export const PROJECT_DELETE = '[project] delete';
export const PROJECT_DELETED = '[project] deleted';

// export
export const PROJECT_EXPORT = '[project] export';

// bulk update
export const PROJECT_BULK_UPDATE = '[project] bulk update';
export const PROJECT_BULK_UPDATED = '[project] bulk udpdated';

// bulk delete
export const PROJECT_BULK_DELETE = '[project] bulk delete';
export const PROJECT_BULK_DELETED = '[project] bulk deleted';

// errors
export const PROJECT_ERROR = '[project] error';
export const PROJECT_BULK_ERROR = '[project] bulk error';

// list of projects
export const PROJECT_SET_PROJECTS = '[project] set projects';
export const PROJECT_REMOVE_PROJECTS = '[project] remove projects';
export const PROJECT_ADD = '[project] add project';

export const PROJECT_UPDATE_METADATA_STATUS = '[project] update metadata status';

export class Load implements Action {
  readonly type = PROJECT_LOAD;
  constructor(public payload: ProjectId) {}
}

export class Loaded implements Action {
  readonly type = PROJECT_LOADED;
  constructor(public payload: Project) {}
}

export class SaveSite implements Action {
  readonly type = PROJECT_SAVE_SITE;
  constructor(public payload: ProjectId) {}
}

export class Saved implements Action {
  readonly type = PROJECT_SAVED;
  constructor(public payload: { temporalId: ProjectId; newProject: Project }) {}
}

export class Update implements Action {
  readonly type = PROJECT_UPDATE;
  constructor(public payload: ProjectUpdate) {}
}

export class Updated implements Action {
  readonly type = PROJECT_UPDATED;
  constructor(public payload: { update: UpdateProjectOpts; updatedProject: Project }) {}
}

export class Delete implements Action {
  readonly type = PROJECT_DELETE;
  constructor(public payload: ProjectId) {}
}

export class Deleted implements Action {
  readonly type = PROJECT_DELETED;
  constructor(public payload: ProjectId) {}
}

export class Export implements Action {
  readonly type = PROJECT_EXPORT;
  constructor(public payload?: Project) {}
}

export class BulkUpdate implements Action {
  readonly type = PROJECT_BULK_UPDATE;
  constructor(public payload: ProjectBulkUpdate) {}
}

export class BulkUpdated implements Action {
  readonly type = PROJECT_BULK_UPDATED;
  constructor(public payload: ProjectBulkUpdate) {}
}

export class BulkDelete implements Action {
  readonly type = PROJECT_BULK_DELETE;
  constructor(public payload: ProjectId[]) {}
}

export class BulkDeleted implements Action {
  readonly type = PROJECT_BULK_DELETED;
  constructor(public payload: ProjectId[]) {}
}

export class Error implements Action {
  readonly type = PROJECT_ERROR;
  constructor(public payload: ProjectError) {}
}

export class BulkError implements Action {
  readonly type = PROJECT_BULK_ERROR;
  constructor(public payload: ProjectBulkError) {}
}

export class SetProjects implements Action {
  readonly type = PROJECT_SET_PROJECTS;
  constructor(public payload: Project[], public temporal: Project) {}
}

export class RemoveProjects implements Action {
  readonly type = PROJECT_REMOVE_PROJECTS;
  constructor(public payload: ProjectId[]) {}
}

export class AddProject implements Action {
  readonly type = PROJECT_ADD;
  constructor(public payload: Project) {}
}

export class UpdateMetadataStatus implements Action {
  readonly type = PROJECT_UPDATE_METADATA_STATUS;
  constructor(public payload: ProjectUpdateMetadataStatus[]) {}
}

export type Actions =
  Load | Loaded
  | SaveSite | Saved
  | Update | Updated
  | Delete | Deleted
  | BulkUpdate | BulkUpdated
  | BulkDelete | BulkDeleted
  | Error | BulkError
  | SetProjects | RemoveProjects | AddProject
  | Export
  | UpdateMetadataStatus;

export type SaveRemoveActions = Saved | RemoveProjects;

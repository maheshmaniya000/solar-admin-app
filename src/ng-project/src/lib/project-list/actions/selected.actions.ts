import { Action } from '@ngrx/store';

import { BulkUpdateProjectOpts, Project, ProjectId } from '@solargis/types/project';

export const PROJECT_LIST_SELECT = '[project list] select';
export const PROJECT_LIST_UNSELECT = '[project list] unselect';
export const PROJECT_LIST_CLEAR_SELECTED = '[project list] clear selected';
export const PROJECT_LIST_SELECT_ALL = '[project list] select all';
export const PROJECT_LIST_SELECT_MULTI = '[project list] select multi';
export const PROJECT_LIST_TOGGLE_SELECT_ALL = '[project list] toggle select all';

// bulk actions on selected projects
export const PROJECT_LIST_UPDATE_SELECTED = '[project list] update selected';
export const PROJECT_LIST_DELETE_SELECTED = '[project list] delete selected';
export const PROJECT_LIST_EXPORT_SELECTED = '[project list] export selected';

export class Select implements Action {
  readonly type = PROJECT_LIST_SELECT;
  constructor(public payload: {
    project: ProjectId | Project;
    multi?: boolean;
  }) {}
}

export class Unselect implements Action {
  readonly type = PROJECT_LIST_UNSELECT;
  constructor(public payload: ProjectId | Project) {}
}

export class ClearSelected implements Action {
  readonly type = PROJECT_LIST_CLEAR_SELECTED;
}

export class SelectAll implements Action {
  readonly type = PROJECT_LIST_SELECT_ALL;
}

export class SelectMulti implements Action {
  readonly type = PROJECT_LIST_SELECT_MULTI;
  constructor(public payload: (ProjectId | Project)[]) {}
}

export class ToggleSelectAll implements Action {
  readonly type = PROJECT_LIST_TOGGLE_SELECT_ALL;
}

export class UpdateSelected implements Action {
  readonly type = PROJECT_LIST_UPDATE_SELECTED;
  constructor(public payload: BulkUpdateProjectOpts) {}
}

export class DeleteSelected implements Action {
  readonly type = PROJECT_LIST_DELETE_SELECTED;
}

export class ExportSelected implements Action {
  readonly type = PROJECT_LIST_EXPORT_SELECTED;
}

export type Actions = Select | Unselect | ClearSelected | SelectAll | SelectMulti | ToggleSelectAll;

export type BulkActions = UpdateSelected | DeleteSelected | ExportSelected;

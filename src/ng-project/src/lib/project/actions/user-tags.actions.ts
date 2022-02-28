import { Action } from '@ngrx/store';

import { UserTag, BulkAssignUserTagOpts } from '@solargis/types/project';

import { RenameUserTagOpts } from 'ng-project/project/types/user-tag.types';

export const TAG_INIT = '[tag] init';
export const TAG_CREATE = '[tag] create';
export const TAG_CREATE_RESULT = '[tag] create result';
export const TAG_RENAME = '[tag] rename';
export const TAG_RENAME_RESULT = '[tag] rename result';
export const TAG_DELETE = '[tag] delete';
export const TAG_DELETE_RESULT = '[tag] delete result';
export const TAG_BULK_ASSIGN = '[tag] bulk assign';
export const TAG_BULK_ASSIGN_RESULT = '[tag] bulk assign result';

export class TagsInit implements Action {
  readonly type = TAG_INIT;
  constructor(public payload: UserTag[]) {}
}

export class CreateTag implements Action {
  readonly type = TAG_CREATE;
  constructor(public payload: string) {}
}

export class CreateTagResult implements Action {
  readonly type = TAG_CREATE_RESULT;
  constructor(public payload: UserTag) {}
}

export class RenameTag implements Action {
  readonly type = TAG_RENAME;
  constructor(public payload: RenameUserTagOpts) {}
}

export class RenameTagResult implements Action {
  readonly type = TAG_RENAME_RESULT;
  constructor(public payload: RenameUserTagOpts) {}
}

export class DeleteTag implements Action {
  readonly type = TAG_DELETE;
  constructor(public payload: UserTag) {}
}

export class DeleteTagResult implements Action {
  readonly type = TAG_DELETE_RESULT;
  constructor(public payload: UserTag) {}
}

export class BulkAssignTags implements Action {
  readonly type = TAG_BULK_ASSIGN;
  constructor(public payload: BulkAssignUserTagOpts) {}
}

export class BulkAssignTagsResult implements Action {
  readonly type = TAG_BULK_ASSIGN_RESULT;
  constructor(public payload: UserTag[]) {}
}

export type Actions =
  TagsInit |
  CreateTag | CreateTagResult |
  RenameTag | RenameTagResult |
  DeleteTag | DeleteTagResult |
  BulkAssignTags | BulkAssignTagsResult;

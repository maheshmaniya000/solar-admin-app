import { Action } from '@ngrx/store';

import { ProjectIdOnly } from '@solargis/types/project';

export const HEADER_SET_PROJET_DETAIL_LINK = '[header] set project detail link';
export const HEADER_CLEAR_PROJECT_DETAIL_LINK = '[header] clear project detail link';

export class SetProjectDetailLink implements Action {
  readonly type = HEADER_SET_PROJET_DETAIL_LINK;
  constructor(public payload: ProjectIdOnly) {}
}

export class ClearProjectDetailLink implements Action {
  readonly type = HEADER_CLEAR_PROJECT_DETAIL_LINK;
}

export type Actions = SetProjectDetailLink | ClearProjectDetailLink;

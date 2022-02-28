import { Action } from '@ngrx/store';

import { Project, ProjectId } from '@solargis/types/project';

export const PROJECT_LIST_HIGHLIGHT = '[project list] highlight';
export const PROJECT_LIST_CLEAR_HIGHLIGHT = '[project list] clear highlight';

export class Highlight implements Action {
  readonly type = PROJECT_LIST_HIGHLIGHT;
  constructor(public payload: ProjectId | Project) {}
}

export class ClearHighlight implements Action {
  readonly type = PROJECT_LIST_CLEAR_HIGHLIGHT;
}

export type Actions = Highlight | ClearHighlight;

import { Action } from '@ngrx/store';

import { DrawerModeState, OpenedClosedState, ProjectListDataTabState, ProjectListSidebarState } from '../reducers/layout.reducer';

export const LAYOUT_DRAWER_TOGGLE = '[layout] drawer toggle';
export const LAYOUT_DRAWER_STATE_UPDATE = '[layout] drawer state update';
export const LAYOUT_DRAWER_CLOSE_IF_OVER = '[layout] drawer close if over';
export const LAYOUT_GLOSSARY_TOGGLE = '[layout] glossary toggle';
export const LAYOUT_MAP_LEGEND_TOGGLE = '[layout] map legend toggle';
export const LAYOUT_MAP_PREVIEWS_TOGGLE = '[layout] map previews toggle';
export const LAYOUT_PROJECT_LIST_TOGGLE = '[layout] project list toggle';

export class LayoutDrawerToggle implements Action {
  readonly type = LAYOUT_DRAWER_TOGGLE;
}

export class LayoutDrawerStateUpdate implements Action {
  readonly type = LAYOUT_DRAWER_STATE_UPDATE;

  constructor(public payload: {
    toggle?: OpenedClosedState;
    mode?: DrawerModeState;
  }) {}
}

export class LayoutDrawerCloseIfOver implements Action {
  readonly type = LAYOUT_DRAWER_CLOSE_IF_OVER;
}

export class LayoutGlossaryToggle implements Action {
  readonly type = LAYOUT_GLOSSARY_TOGGLE;
  constructor(public payload: OpenedClosedState) {}
}

export class LayoutMapLegendToggle implements Action {
  readonly type = LAYOUT_MAP_LEGEND_TOGGLE;
  constructor(public payload: OpenedClosedState) {}
}

export class LayoutMapPreviewsToggle implements Action {
  readonly type = LAYOUT_MAP_PREVIEWS_TOGGLE;
}

export class LayoutProjectListToggle implements Action {
  readonly type = LAYOUT_PROJECT_LIST_TOGGLE;
  constructor(public payload: { dataTab?: ProjectListDataTabState; sidebar?: ProjectListSidebarState }) {}
}

export type Actions =
  LayoutDrawerToggle
  | LayoutDrawerStateUpdate
  | LayoutDrawerCloseIfOver
  | LayoutGlossaryToggle
  | LayoutMapLegendToggle
  | LayoutMapPreviewsToggle
  | LayoutProjectListToggle;

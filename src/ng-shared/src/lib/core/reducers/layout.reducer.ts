import { removeEmpty } from '@solargis/types/utils';

import {
  Actions,
  LAYOUT_DRAWER_STATE_UPDATE,
  LAYOUT_GLOSSARY_TOGGLE,
  LAYOUT_MAP_LEGEND_TOGGLE,
  LAYOUT_MAP_PREVIEWS_TOGGLE,
  LAYOUT_PROJECT_LIST_TOGGLE
} from '../actions/layout.actions';

export type OpenedClosedState = 'opened' | 'closed';

export type DrawerModeState = 'over' | 'side';

export type ProjectListDataTabState = 'mapData' | 'projectData';
export type ProjectListSidebarState = 'none' | 'map' | 'info';

export type LayoutState = {
  drawer: {
    /** Drawer toggle may still be closed if user is not logged in */
    toggle?: OpenedClosedState;
    mode?: DrawerModeState;
  };
  // TODO: move all specific states to corresponding modules
  glossary: OpenedClosedState;
  mapLegend: OpenedClosedState;
  mapPreviews: boolean;
  projectList: {
    dataTab: ProjectListDataTabState;
    sidebar: ProjectListSidebarState;
  };
};

const defaultLayout: LayoutState = {
  drawer: {
    toggle: 'opened'
  },
  glossary: 'opened',
  mapLegend: 'opened',
  mapPreviews: true,
  projectList: {
    dataTab: 'mapData',
    sidebar: 'none'
  }
};

export function layoutReducer(state: LayoutState = defaultLayout, action: Actions): LayoutState {
  switch (action.type) {
    case LAYOUT_DRAWER_STATE_UPDATE:
      return { ...state, drawer: { ...state.drawer, ...removeEmpty(action.payload)} };
    case LAYOUT_GLOSSARY_TOGGLE:
      return { ...state, glossary: action.payload };
    case LAYOUT_MAP_LEGEND_TOGGLE:
      return { ...state, mapLegend: action.payload };
    case LAYOUT_MAP_PREVIEWS_TOGGLE:
      return { ...state, mapPreviews: !state.mapPreviews };
    case LAYOUT_PROJECT_LIST_TOGGLE:
      return { ...state, projectList: { ...state.projectList, ...action.payload }};
    default: {
      return state;
    }
  }
}

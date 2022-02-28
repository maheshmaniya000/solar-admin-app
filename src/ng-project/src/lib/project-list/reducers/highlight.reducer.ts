import { ProjectId, getProjectId } from '@solargis/types/project';

import { SaveRemoveActions, PROJECT_SAVED, PROJECT_REMOVE_PROJECTS } from '../../project/actions/project.actions';
import { Actions, PROJECT_LIST_CLEAR_HIGHLIGHT, PROJECT_LIST_HIGHLIGHT } from '../actions/highlight.actions';

export function highlightReducer(state: ProjectId = undefined, action: Actions | SaveRemoveActions): ProjectId {
  switch (action.type) {
    case PROJECT_LIST_HIGHLIGHT: {
      return getProjectId(action.payload);
    }
    case PROJECT_LIST_CLEAR_HIGHLIGHT: {
      return undefined;
    }
    // replace highlighted project ID after project save
    case PROJECT_SAVED: {
      const { temporalId, newProject: { _id: newId } } = action.payload;
      return state === temporalId ? newId : state;
    }
    case PROJECT_REMOVE_PROJECTS: {
      const _id: ProjectId[] = action.payload;
      return _id.includes(state) ? undefined : state;
    }
    default:
      return state;
  }
}

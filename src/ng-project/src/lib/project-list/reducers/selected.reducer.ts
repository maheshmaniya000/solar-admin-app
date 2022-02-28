import { ProjectId, getProjectId } from '@solargis/types/project';

import { PROJECT_REMOVE_PROJECTS, PROJECT_SAVED, SaveRemoveActions } from '../../project/actions/project.actions';
import {
  Actions, PROJECT_LIST_CLEAR_SELECTED, PROJECT_LIST_SELECT, PROJECT_LIST_SELECT_MULTI, PROJECT_LIST_UNSELECT
} from '../actions/selected.actions';

export type ProjectSelected = {
  single?: ProjectId;
  multi: ProjectId[];
};

function replaceSelectedProjectId(state: ProjectSelected, temporalId, _id): ProjectSelected {
  const { single, multi } = state;
  return {
    ...state,
    single: single === temporalId ? _id : single,
    multi: multi.map(projectId => projectId === temporalId ? _id : projectId)
  };
}

export function selectedReducer(state: ProjectSelected = { multi: [] }, action: Actions | SaveRemoveActions): ProjectSelected {
  switch (action.type) {
    case PROJECT_LIST_SELECT: {
      const { project, multi } = action.payload;
      const _id = getProjectId(project);
      const isMultiSelectActive = !!state.multi.length;

      if (multi || (typeof multi === 'undefined' && isMultiSelectActive)) {
        return state.multi.includes(_id)
          ? state
          : { multi: [...state.multi, _id] };
      } else {
        return { single: _id, multi: [] };
      }
    }
    case PROJECT_LIST_UNSELECT: {
      const _id = getProjectId(action.payload);

      if (state.single === _id) {
        return { multi: state.multi };

      } else if (state.multi.includes(_id)) {
        return { multi: state.multi.filter(selectedId => selectedId !== _id) };

      } else {return state;}
    }
    case PROJECT_REMOVE_PROJECTS: {
      const _id: ProjectId[] = action.payload;

      if (_id.find(id => state.single === id)) {
        return { multi: state.multi };

      } else if (state.multi && _id.find(id => state.multi.includes(id))) {
        return { multi: state.multi.filter(idMulti => !_id.includes(idMulti)) };

      } else {return state;}
    }
    case PROJECT_LIST_CLEAR_SELECTED: {
      return { multi: [] };
    }
    case PROJECT_LIST_SELECT_MULTI: {
      const payload = action.payload;
      const selected = state.multi ? state.multi : [];
      const newProjects = payload.map(item => getProjectId(item))
        .filter(item => !selected.includes(item));

      return { multi: [...selected, ...newProjects] };
    }
    // replace selected project ID after project save
    case PROJECT_SAVED: {
      const { temporalId, newProject: { _id: newId } } = action.payload;
      return replaceSelectedProjectId(state, temporalId, newId);
    }
  }
  return state;
}

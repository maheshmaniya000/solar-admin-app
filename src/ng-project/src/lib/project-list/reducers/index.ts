import { ProjectId } from '@solargis/types/project';

import { State as ProjectState } from '../../project/reducers';
import { filterReducer, ProjectFilter } from './filter.reducer';
import { highlightReducer } from './highlight.reducer';
import { SearchState, siteSearchReducer } from './search.reducer';
import { ProjectSelected, selectedReducer } from './selected.reducer';
import { sortReducer, SortState } from './sort.reducer';

export interface ProjectListState {
  filter: ProjectFilter;
  highlight?: ProjectId;
  search: SearchState;
  selected: ProjectSelected;
  sort: SortState;
}

export interface State extends ProjectState {
  projectList: ProjectListState;
}

export const reducers = {
  highlight: highlightReducer,
  selected: selectedReducer,
  filter: filterReducer,
  sort: sortReducer,
  search: siteSearchReducer
};

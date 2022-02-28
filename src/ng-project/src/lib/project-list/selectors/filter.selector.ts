import { createSelector, select } from '@ngrx/store';
import { pipe } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { Project, UserTag } from '@solargis/types/project';
import { isFunction, sum } from '@solargis/types/utils';

import { UserTagsState } from 'ng-project/project/reducers/user-tags.reducer';

import { ProjectsState } from '../../project/reducers/projects.reducer';
import { State } from '../reducers';
import { defaultProjectFilter, getRecentFilter, ProjectFilter } from '../reducers/filter.reducer';

const getProjects = (state: State): ProjectsState => state.project.projects;
export const getProjectListFilter = (state: State): ProjectFilter => state.projectList.filter;
const getUserTags = (state: State): UserTagsState => state.project.userTags;

const isSavedProject = (project: Project): boolean => !!project.created;

// filters for stats

type ProjectFilterFactory = () => ProjectFilter;

const statsFilterMap: { [key: string]: ProjectFilter | ProjectFilterFactory } = {
  all: defaultProjectFilter,
  recent: () => ({ ...defaultProjectFilter, ...getRecentFilter() }),
  archived: { archived: true }
};

// project filter functions

type ProjectFilterFn = (project: Project, filter?: ProjectFilter, tagFilter?: Set<string /* ProjectId */>) => boolean;

const filterRecent: ProjectFilterFn = (project, filter) => {
  if (filter.recent) {
    const ts = (project.updated || project.created).ts;
    return filter.recent <= ts;
  }
  return true;
};

const filterArchived: ProjectFilterFn = (project, filter) => {
  if (typeof filter.archived !== 'undefined') {
    return filter.archived === !!(project.status === 'archived');
  }
  return true;
};

const filterTag: ProjectFilterFn = (project, filter, tagFilter) => !tagFilter || tagFilter.has(project._id);

const projectFilters: ProjectFilterFn[] = [filterRecent, filterArchived, filterTag];

/**
 * Determine if project is visible according to current filter
 *
 * @param project
 * @param filter
 * @returns
 */
 function filterProject(project: Project, filter: ProjectFilter, tagFilter: Set<string>): boolean {
  if (!filter) {return true;}
  for (const projectFilterFn of projectFilters) {
    if (!projectFilterFn(project, filter, tagFilter)) {return false;}
  }
  return true;
}


const projectsSelector = createSelector(getProjects, projects => projects);

const tagsFilterSelector = createSelector(
  getProjectListFilter,
  getUserTags,
  (filter, userTags) => {
    if (!filter.tags || Object.keys(filter.tags).length === 0) {return null;}
    const tagFilter = new Set<string>();
    Object.keys(filter.tags || {})
      .filter(tag => filter.tags[tag])
      .forEach(tag =>
        userTags.get(tag)?.projects.forEach(project => tagFilter.add(project)
      )
    );
    return tagFilter;
  }
);

export const filteredProjectsSelector = createSelector(
  projectsSelector,
  getProjectListFilter,
  tagsFilterSelector,
  (projects, filter, tagFilter) => projects.filter(project => isSavedProject(project) && filterProject(project, filter, tagFilter))
);

/**
 * Selects observable of sorted and filtered project list
 */
export const selectFilteredProjects = pipe(
  select(filteredProjectsSelector),
  map(projects => projects.toArray())
);

export type FilterStats = {[key: string]: number | {[key: string]: number}};

function getFilterStats(projects: ProjectsState, tags: UserTag[]): FilterStats {
  const statsKeys = Object.keys(statsFilterMap);
  const initStats: any = statsKeys.reduce((stats, key) => (stats[key] = 0, stats), {});

  initStats.userTag = tags.reduce((stats, tag) => {
    const noFilter = { archived: false };
    const tagFilter = new Set<string>(tag.projects);
    stats[tag.tagName] = sum(projects.map(project => +filterProject(project, noFilter, tagFilter)));
    return stats;
  }, {});

  return projects.filter(isSavedProject).reduce((stats, project) => {
    statsKeys.forEach(key => {
      const filterOrFactory = statsFilterMap[key];
      const filter = isFunction(filterOrFactory) ? (filterOrFactory as ProjectFilterFactory)() : filterOrFactory as ProjectFilter;
      const filterPassed = filterProject(project, filter, null);
      if (filterPassed) {stats[key]++;}
    });
    return stats;
  }, initStats);
}

/**
 * Select stats of project counts in different filter categories
 */
export const selectFilterStats = pipe(
  select(createSelector(projectsSelector, getUserTags, (projects, userTags) => [projects, userTags])),
  map(([projects, userTags]) => getFilterStats(projects as ProjectsState, userTags as any as UserTag[])),
  distinctUntilChanged()
);

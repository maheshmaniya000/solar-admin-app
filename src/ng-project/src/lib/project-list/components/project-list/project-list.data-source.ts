import { DataSource } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { deburr } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, publishReplay, refCount, switchMap, tap } from 'rxjs/operators';

import { Dataset } from '@solargis/dataset-core';
import { mergeData, VersionedDatasetDataMap } from '@solargis/types/dataset';
import { getProjectDatasetDataMap, Project } from '@solargis/types/project';

import { ProjectListDataTabState } from 'ng-shared/core/reducers/layout.reducer';
import { selectIsFreetrialActive } from 'ng-shared/user/selectors/company.selectors';

import { ProjectNamePipe } from '../../../project/pipes/project-name.pipe';
import { isFreetrialProject } from '../../../project/utils/project-freetrial.utils';
import { State } from '../../reducers';
import { selectFilteredProjects } from '../../selectors';
import { DataLayerColumn, pvcalc, pvcalcDetails } from './project-list-layers.data';

export type ProjectData = { data: VersionedDatasetDataMap };

export type ProjectListRow = Project & ProjectData & { freetrial: boolean };

function selectedFirstSort(projects: ProjectListRow[], selected: string[]): ProjectListRow[] {
  projects.sort((a, b) => {
    if (selected.includes(a._id)) { return -1; }
    else if (selected.includes(b._id)) { return 1; }
    else { return -1; }
  });
  return projects;
}

function compareNumbers(operand1: number = 0, operand2: number = 0, coeff: 1 | -1 = 1): number {
  return (operand1 - operand2) * coeff;
}

export class ProjectListDataSource extends DataSource<ProjectListRow> {
  count$ = new BehaviorSubject(0);

  constructor(
    private readonly store: Store<State>,
    private readonly dataTab$: Observable<ProjectListDataTabState>,
    private readonly pagination$: Observable<PageEvent>,
    private readonly projectNamePipe: ProjectNamePipe,
    private readonly ltaDataset: Dataset,
    private readonly searchQuery$: Observable<string>
  ) {
    super();
  }

  sort(projects: ProjectListRow[], selected$: Observable<string[]>): Observable<ProjectListRow[]> {
    return combineLatest([
      this.store.select('projectList', 'sort'),
      this.dataTab$,
      selected$
    ]).pipe(
      map(([sort, dataTab, selected]) => {
        // Javascript WTF: sorting alters ngrx state, so we need to make a copy
        // this is described functionality of Array.sort that it sorts array directly
        let projectsToSort = [...projects];
        if (sort.direction) {
          const directionCoeff = sort.direction === 'asc' ? 1 : -1;

          switch (sort.active) {
            case 'name':
              projectsToSort.sort(
                (p1, p2) => p1.name.localeCompare(p2.name) * directionCoeff
              );
              break;
            case 'created':
              projectsToSort.sort(
                (p1, p2) => compareNumbers(p1.created.ts, p2.created.ts, directionCoeff)
              );
              break;
            default: {
              let layer: DataLayerColumn[];
              if (dataTab === 'mapData') {
                const activeLayer = this.ltaDataset.annual.keys.filter(l => l === sort.active);
                layer = [{ dataset: 'lta', layerKey: activeLayer[0] }];
              }
              if (dataTab === 'projectData') {
                layer = [...pvcalc, ...pvcalcDetails].filter(l => l.layerKey === sort.active);
              }
              projectsToSort.sort(
                (proj1, proj2) =>
                  compareNumbers(
                    proj1.data[layer[0]?.dataset]?.annual?.data[layer[0]?.layerKey],
                    proj2.data[layer[0]?.dataset]?.annual?.data[layer[0]?.layerKey],
                    directionCoeff
                  )
              );
            }
          }
        }
        if (sort?.selectedFirst) {
          projectsToSort = selectedFirstSort(projectsToSort, selected);
        }
        return projectsToSort;
      })
    );
  }

  /**
   * @deprecated filtering is done in project selectors
   */
  filter(projects: ProjectListRow[]): Observable<ProjectListRow[]> {
    return this.searchQuery$.pipe(
      map(query => {
        if (!query) { return projects; }
        else {
          return projects.filter(project => {
            const deburredProjectName = deburr(project.name).toLowerCase();
            return deburredProjectName.includes(query.toLowerCase());
          });
        }
      })
    );
  }

  setPaging(projects: ProjectListRow[]): Observable<ProjectListRow[]> {
    return this.pagination$.pipe(
      map(pagination => {
        const { pageIndex, pageSize } = pagination;
        return projects.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
      })
    );
  }

  connect(): Observable<ProjectListRow[]> {
    const filteredProjectList$ = this.store.pipe(selectFilteredProjects);
    const filteredProjectListWithData$ = filteredProjectList$.pipe(
      map(list =>
        list.map(project => ({
          ...project,
          data: mergeData(
            getProjectDatasetDataMap(project, 'prospect') || {},
            getProjectDatasetDataMap(project, 'prospect', true) || {}
          )
        }))
      ),
      distinctUntilChanged()
    );

    const freetrialActive$ = this.store.pipe(selectIsFreetrialActive);
    const selected$ = this.store.select('projectList', 'selected', 'multi');

    return combineLatest([filteredProjectListWithData$, freetrialActive$]).pipe(
      map(([projects, freetrialActive]) =>
        projects.map(project => ({
          ...project,
          name: this.projectNamePipe.transform(project),
          freetrial: freetrialActive && isFreetrialProject(project)
        }))
      ),
      switchMap(projects => this.filter(projects)), // FIXME double filtering
      switchMap(projects => this.sort(projects, selected$)),
      tap(projects => this.count$.next(projects.length)),
      switchMap(projects => this.setPaging(projects)),
      distinctUntilChanged(),
      publishReplay(),
      refCount()
    );
  }

  disconnect(): void {
    // empty implementation
  }
}

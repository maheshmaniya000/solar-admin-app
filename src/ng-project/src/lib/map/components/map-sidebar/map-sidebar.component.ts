import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, first, map, withLatestFrom } from 'rxjs/operators';

import { Dataset, filterDataset } from '@solargis/dataset-core';
import { combineDataArray, VersionedDatasetData } from '@solargis/types/dataset';
import { MapLayerDefWithAccess } from '@solargis/types/map';
import { Project, ProjectId } from '@solargis/types/project';
import { latlngToAzimuth, Site } from '@solargis/types/site';

import { LayoutProjectListToggle } from 'ng-shared/core/actions/layout.actions';
import { SettingsToggles as SettingsToggleAction } from 'ng-shared/core/actions/settings.actions';
import { selectLayoutProjectListDataTab } from 'ng-shared/core/selectors/layout.selector';
import { SelectedSettings } from 'ng-shared/core/types';
import { ToggleDataUnitsDialogComponent } from 'ng-shared/shared/components/toggle-data-units-dialog/toggle-data-units-dialog.component';
import { RequireUserLogin } from 'ng-shared/user/actions/auth.actions';
import { selectUserRef } from 'ng-shared/user/selectors/auth.selectors';
import { selectHasAnyCompany, selectIsFreetrialActive } from 'ng-shared/user/selectors/company.selectors';

import { ClearSelected, ExportSelected, Select, Unselect } from '../../../project-list/actions/selected.actions';
import { SearchState } from '../../../project-list/reducers/search.reducer';
import {
  selectFilteredSelectedProjects,
  selectIsSelectedProjectTemporal,
  selectSelectedProject,
  selectSelectedProjectData
} from '../../../project-list/selectors';
import { transferAvailable } from '../../../project-list/utils/project.utils';
import { SaveSite } from '../../../project/actions/project.actions';
import { SiteFromSearch } from '../../../project/actions/site.actions';
import { getProjectProgress, ExtendedProject } from '../../../project/reducers/projects.reducer';
import { LTA_DATASET } from '../../../project/services/lta-dataset.factory';
import { PVCALC_DATASET } from '../../../project/services/pvcalc-dataset.factory';
import { isFreetrialProject } from '../../../project/utils/project-freetrial.utils';
import { MapCenter, MapSelectedLayerId } from '../../map.actions';
import { State } from '../../map.reducer';
import { selectMapLayersWithAccess } from '../../selectors';


@Component({
  selector: 'sg-map-sidebar',
  styleUrls: ['./map-sidebar.component.scss'],
  templateUrl: './map-sidebar.component.html'
})
export class MapSidebarComponent implements OnInit {

  @Input() searchedProjects: ExtendedProject[];

  project$: Observable<ExtendedProject>;
  projectId$: Observable<string>;
  projectTemporal$: Observable<boolean>;
  projectFreetrial$: Observable<boolean>;
  projectTransferAvailable$: Observable<boolean>;

  selectedProjects$: Observable<Project[]>;
  selectedProjectsCount$: Observable<number>;

  mapLayers$: Observable<MapLayerDefWithAccess[]>;
  mapLayerId$: Observable<string>;

  searchResults$: Observable<Site[]>;
  searchHighlightIndex$: Observable<number>;

  showProject$: Observable<boolean>;

  selectedLtaKeys$: Observable<string[]>;
  selectedPvcalcKeys$: Observable<string[]>;

  ltaData$: Observable<VersionedDatasetData>;
  ltaDataInProgress$: Observable<boolean>;

  pvcalcData$: Observable<VersionedDatasetData>;
  pvcalcDataInProgress$: Observable<boolean> = of(false);

  dataTabIndex$: Observable<number>;

  constructor(private readonly store: Store<State>,
              private readonly dialog: MatDialog,
              @Inject(LTA_DATASET) public ltaDataset: Dataset,
              @Inject(PVCALC_DATASET) public pvcalcDataset: Dataset,
    ) {
    this.mapLayers$ = this.store.pipe(selectMapLayersWithAccess);
  }

  ngOnInit(): void {
    this.project$ = this.store.pipe(selectSelectedProject);

    this.projectId$ = this.project$.pipe(
      map(project => project && project._id),
      distinctUntilChanged()
    );

    this.projectTemporal$ = this.store.pipe(selectIsSelectedProjectTemporal);

    const freetrialActive$ = this.store.pipe(selectIsFreetrialActive);

    this.projectFreetrial$ = combineLatest(this.project$, freetrialActive$).pipe(
      map(([project, freetrialActive]) => freetrialActive && isFreetrialProject(project))
    );

    this.projectTransferAvailable$ = combineLatest(
      this.project$.pipe(
        map(project => project && project.status !== 'temporal' ? [project] : [])
      ),
      this.store.pipe(selectUserRef),
      this.store.pipe(selectHasAnyCompany)
    ).pipe(
      map(([projects, user, hasAnyCompany]) => transferAvailable(projects, user, hasAnyCompany))
    );

    this.ltaDataInProgress$ = this.project$.pipe(
      map(project => getProjectProgress(project).siteData),
      distinctUntilChanged()
    );

    this.selectedProjects$ = this.store.pipe(selectFilteredSelectedProjects);

    this.selectedProjectsCount$ = this.selectedProjects$.pipe(
      map(projects => projects.length)
    );

    this.mapLayerId$ = this.store.select('map', 'selected').pipe(
      filter(sel => !!sel),
      map(selected => selected.layerId),
      distinctUntilChanged()
    );

    const appData$ = this.store.pipe(
      selectSelectedProjectData('prospect'),
    );

    this.ltaData$ = appData$.pipe(
      map(data => data && data.lta),
      distinctUntilChanged(),
      withLatestFrom(this.project$),
      map(([ltaData, project]) => ltaData && ltaData.annual ?
        { ...ltaData,
          annual: {
            ...ltaData.annual,
            data: { ...ltaData.annual.data, OPTA_AZIMUTH: latlngToAzimuth(project.site.point) }
          }
        } : ltaData
      )
    );

    const pvcalcDetailsData$ = appData$.pipe(
      map(data => data && data.pvcalcDetails),
      distinctUntilChanged()
    );

    const pvcalcData$ = this.store.pipe(
      selectSelectedProjectData('prospect', true),
      map(data => data && data.pvcalc),
      distinctUntilChanged()
    );

    this.pvcalcData$ = combineLatest(pvcalcDetailsData$, pvcalcData$).pipe(
      map(([pvcalcDetails, pvcalc]) => combineDataArray(pvcalcDetails, pvcalc)),
      map(data => {
        // remove GTI_opta if GTI is present
        const GTI = data && data.annual && data.annual.data.GTI;
        return typeof GTI !== 'undefined'
          ? filterDataset(this.pvcalcDataset, data, { keys: ['!GTI_opta'] })
          : data;
      })
    );

    this.searchResults$ = this.store.select('projectList', 'search').pipe(
      map((search: SearchState) => search ? search.results : undefined),
      distinctUntilChanged()
    );

    this.searchHighlightIndex$ = this.store.select('projectList', 'search').pipe(
      map((search: SearchState) => search ? search.highlightIndex : undefined),
      distinctUntilChanged()
    );

    this.showProject$ = combineLatest(this.searchResults$, this.project$).pipe(
      map(([results, project]) => !results && !!project)
    );

    this.selectedLtaKeys$ = this.store.select('settings', 'selected', 'map').pipe(
      map((selected: SelectedSettings) => selected.ltaKeys),
      distinctUntilChanged()
    );

    this.selectedPvcalcKeys$ = this.store.select('settings', 'selected', 'map').pipe(
      map((selected: SelectedSettings) => selected.pvcalcKeys),
      distinctUntilChanged()
    );

    this.dataTabIndex$ = this.store.pipe(
      selectLayoutProjectListDataTab,
      map(dataTab => dataTab === 'mapData' ? 0 : 1)
    );
  }

  selectSiteFromSearch(site: Site): void {
    this.store.dispatch(new SiteFromSearch(site));
  }

  saveProject(saved: boolean): void {
    of(saved)
      .pipe(withLatestFrom(this.projectId$), first())
      .subscribe(([, projectId]) => {
        const action = new RequireUserLogin(new SaveSite(projectId));
        this.store.dispatch(action);
      });
  }

  openUnitSettings(): void {
    this.dialog.open(ToggleDataUnitsDialogComponent, {}).afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (result) {
          this.store.dispatch(new SettingsToggleAction(result));
        }
      });
  }

  clearSelection(): void {
    this.store.dispatch(new ClearSelected());
  }

  unselectProject(projectId: ProjectId): void {
    this.store.dispatch(new Unselect(projectId));
  }

  selectMap(mapLayerId: string): void {
    this.store.dispatch(new MapSelectedLayerId(mapLayerId));
  }

  dataTabChange(tabIndex: number): void {
    const dataTab = tabIndex === 0 ? 'mapData' : 'projectData';
    this.store.dispatch(new LayoutProjectListToggle({ dataTab }));
  }

  onSelectProject(project: ExtendedProject): void {
    this.store.dispatch(new MapCenter({
      lat: project.site.point.lat,
      lng: project.site.point.lng,
      zoom: 10
    }));
    this.store.dispatch(new Select({ project: project._id, }));
  }

  exportProject(): void {
    this.store.dispatch(new ExportSelected());
  }
}

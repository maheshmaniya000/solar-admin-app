import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, first, map, switchMap } from 'rxjs/operators';

import { DataLayerMap, Dataset } from '@solargis/dataset-core';
import { EnergySystemRef, Project, ProjectStatus } from '@solargis/types/project';
import { Site } from '@solargis/types/site';

import { OpenUpdateProjectDataDialog } from 'ng-shared/core/actions/dialog.actions';
import { LayoutProjectListToggle } from 'ng-shared/core/actions/layout.actions';
import {
  SettingsSelectMapDataKeys,
  SettingsSelectProjectListDataKeys,
  SettingsToggles as SettingsToggleAction
} from 'ng-shared/core/actions/settings.actions';
import { ProjectListSidebarState } from 'ng-shared/core/reducers/layout.reducer';
import { selectLayoutProjectListSidebar } from 'ng-shared/core/selectors/layout.selector';
import { SelectedSettings } from 'ng-shared/core/types';
import { ConfirmationDialogComponent } from 'ng-shared/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ToggleDataUnitsDialogComponent } from 'ng-shared/shared/components/toggle-data-units-dialog/toggle-data-units-dialog.component';
import { selectIsUserLogged, selectUserRef } from 'ng-shared/user/selectors/auth.selectors';
import { selectHasAnyCompany, selectIsFreetrialToClaim } from 'ng-shared/user/selectors/company.selectors';
import { selectHasUserCompareAccess } from 'ng-shared/user/selectors/permissions.selectors';

import { MapCenter } from '../../../map/map.actions';
import { CompareAddProjectRequest } from '../../../project/actions/compare.actions';
import { Delete, Update } from '../../../project/actions/project.actions';
import { SiteFromSearch } from '../../../project/actions/site.actions';
import { AddToCompareDialogComponent } from '../../../project/dialogs/add-to-compare-dialog/add-to-compare-dialog.component';
import { ClaimTrialDialogComponent } from '../../../project/dialogs/claim-trial-dialog/claim-trial-dialog.component';
import { ProjectRenameDialogComponent } from '../../../project/dialogs/project-rename-dialog/project-rename-dialog.component';
import { ProjectShareDialogComponent } from '../../../project/dialogs/project-share-dialog/project-share-dialog.component';
import { SetTagDialogComponent } from '../../../project/dialogs/set-tag-dialog/set-tag-dialog.component';
import { TransferProjectsDialogComponent } from '../../../project/dialogs/transfer-projects-dialog/transfer-projects-dialog.component';
import { ExtendedProject, getProjectMetadataStatus } from '../../../project/reducers/projects.reducer';
import { DatasetAccessService } from '../../../project/services/dataset-access.service';
import { LTA_DATASET } from '../../../project/services/lta-dataset.factory';
import { PVCALC_DATASET } from '../../../project/services/pvcalc-dataset.factory';
import { mapDefaultEnergySystem } from '../../../project/utils/map-default-energy-system.operator';
import { projectToClaimFreetrial } from '../../../project/utils/project-to-claim-freetrial.operator';
import { SearchClearResults, SearchResults } from '../../actions/search.actions';
import { ExportSelected, Select } from '../../actions/selected.actions';
import { SelectDataLayersDialogComponent } from '../../dialogs/select-data-layers-dialog/select-data-layers-dialog.component';
import { State } from '../../reducers';
import { ProjectFilter } from '../../reducers/filter.reducer';
import { SearchState } from '../../reducers/search.reducer';
import { selectSelectedProject } from '../../selectors';
import { getProjectDefaultEnergySystemRef, transferAvailable } from '../../utils/project.utils';

@Component({
  selector: 'sg-project-toolbar',
  templateUrl: './project-toolbar.component.html',
  styleUrls: ['./project-toolbar.component.scss']
})
export class ProjectToolbarComponent implements OnInit, OnDestroy {
  @Input() componentName: 'map' | 'list' | 'detail';

  @Output() foundProjects = new EventEmitter();
  @Output() onSearchQuery = new EventEmitter();

  sidebarState: ProjectListSidebarState;
  subscriptions: Subscription[] = [];

  filter$: Observable<ProjectFilter>;

  ltaAnnualLayers$: Observable<DataLayerMap>;
  pvcalcAnnualLayers$: Observable<DataLayerMap>;

  searchResults$: Observable<Site[]>;

  selectedLtaKeys$: Observable<string[]>;
  selectedPvcalcKeys$: Observable<string[]>;

  selectedEnergySystemRef$: Observable<EnergySystemRef>;
  projectToClaimFreetrial$: Observable<Project>;

  hasCompareAccess$: Observable<boolean>;

  project$: Observable<ExtendedProject>;
  transferAvailable$: Observable<boolean>;
  updateDataAvailable$: Observable<boolean>;

  isProjectSelected: boolean;

  showFilter$: Observable<boolean>;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private readonly store: Store<State>,
    private readonly dialog: MatDialog,
    datasetService: DatasetAccessService,
    private readonly router: Router,
    @Inject(LTA_DATASET) ltaDataset: Dataset,
    @Inject(PVCALC_DATASET) pvcalcDataset: Dataset
  ) {
    this.project$ = this.store.pipe(selectSelectedProject);
    this.ltaAnnualLayers$ = datasetService.dataLayersWithAccess$(ltaDataset.annual, this.project$);
    this.pvcalcAnnualLayers$ = datasetService.dataLayersWithAccess$(pvcalcDataset.annual, this.project$);
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.store
        .pipe(selectLayoutProjectListSidebar)
        .subscribe(state => this.sidebarState = state),

      this.project$.subscribe(project => {
        this.isProjectSelected = !!project && !!project.created;
      })
    );

    this.isLoggedIn$ = this.store.pipe(selectIsUserLogged);

    this.showFilter$ = this.store.select('projectList', 'search').pipe(
      map(search => !search.showSearch)
    );

    this.filter$ = this.store.select('projectList', 'filter');

    const unsafeLtaKeys$ = this.store.select('settings', 'selected', this.componentName === 'map' ? 'map' : 'projectList')
      .pipe(
        map((settings: SelectedSettings) => settings.ltaKeys),
        distinctUntilChanged()
      );

    const unsafePvcalcKeys$ = this.store.select('settings', 'selected', this.componentName === 'map' ? 'map' : 'projectList')
      .pipe(
        map((settings: SelectedSettings) => settings.pvcalcKeys),
        distinctUntilChanged()
      );

    const selectedPvcalcKeys = (unsafePvcalKeys$: Observable<string[]>): Observable<string[]> =>
      combineLatest([unsafePvcalKeys$, this.pvcalcAnnualLayers$])
        .pipe(
          map(([pvcalcKeys, pvcalcAnnualLayers]) => pvcalcKeys.filter(key => !!pvcalcAnnualLayers.get(key)))
        );

    const selectedLtaKeys = (unsafeLtaKeys: Observable<string[]>): Observable<string[]> =>
      combineLatest([unsafeLtaKeys, this.ltaAnnualLayers$])
        .pipe(
          map(([mapDataKeys, ltaAnnualLayers]) => mapDataKeys.filter(key => !!ltaAnnualLayers.get(key)))
        );

    this.selectedPvcalcKeys$ = selectedPvcalcKeys(unsafePvcalcKeys$);

    this.selectedLtaKeys$ = selectedLtaKeys(unsafeLtaKeys$);

    this.selectedEnergySystemRef$ = this.project$.pipe(mapDefaultEnergySystem());

    this.projectToClaimFreetrial$ = combineLatest([
      this.project$,
      this.store.pipe(selectIsFreetrialToClaim)
    ]).pipe(
      projectToClaimFreetrial()
    );

    this.hasCompareAccess$ = this.store.pipe(selectHasUserCompareAccess);

    this.transferAvailable$ = combineLatest([
      this.project$,
      this.store.pipe(selectUserRef),
      this.store.pipe(selectHasAnyCompany)
    ]).pipe(
      filter(([project]) => !!project && !!project.access),
      map(([project, user, hasAnyCompany]) => transferAvailable([project], user, hasAnyCompany))
    );

    this.updateDataAvailable$ = this.project$.pipe(map(project => !getProjectMetadataStatus(project, 'prospect').latest));

    this.searchResults$ = this.store.select('projectList', 'search').pipe(
      map((search: SearchState) => search ? search.results : undefined),
      distinctUntilChanged()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openProject(): void {
    this.project$
      .pipe(first())
      .subscribe(project => this.router.navigate(['/detail', project._id]));
  }

  // FIXME copy-pasted code from project-menu.component, other methods too

  compare(): void {
    this.selectedEnergySystemRef$
      .pipe(first())
      .subscribe((ref: EnergySystemRef) => {
        if (ref) {
          this.store.dispatch(new CompareAddProjectRequest(ref));
          this.router.navigate(['compare']);
        } else {
          this.dialog
            .open(AddToCompareDialogComponent, { data: { sortBy: 'isSelected', order: 'desc' } })
            .afterClosed().subscribe(res => {
              if (res && res.length > 0) { this.router.navigate(['compare']); }
            });
        }
      });
  }

  renameProject(): void {
    this.project$
      .pipe(first())
      .subscribe((project: Project) => {
        this.dialog.open(ProjectRenameDialogComponent, { disableClose: false, data: { project } });
      });
  }

  addTo(): void {
    this.project$
      .pipe(first())
      .subscribe(({ _id }) => {
        this.dialog.open(SetTagDialogComponent, { data: { projectIds: [_id] } });
      });
  }

  updateStatus(status: ProjectStatus, requireConfirmation = false): void {
    this.project$
      .pipe(first())
      .subscribe(({ _id }) => {
        if (!requireConfirmation) {
          this.store.dispatch(new Update({ _id, status }));
        } else {
          const data = status === 'active'
            ? { heading: 'project.action.unArchive', text: 'project.action.unArchiveText' }
            : { heading: 'project.action.archive', text: 'project.action.archiveText' };
          this.dialog
            .open(ConfirmationDialogComponent, { data })
            .afterClosed()
            .pipe(filter(x => !!x))
            .subscribe(() => {
              this.store.dispatch(new Update({ _id, status }));
            });
        }
      });
  }

  delete(): void {
    this.project$
      .pipe(first())
      .subscribe(({ _id }) => {
        this.dialog
          .open(ConfirmationDialogComponent, { data: { text: 'common.confirmDialog.usure' } })
          .afterClosed().subscribe(result => {
            if (result) { this.store.dispatch(new Delete(_id)); }
          });
      });
  }

  transfer(): void {
    this.project$
      .pipe(first())
      .subscribe(({ _id }) => {
        this.dialog.open(TransferProjectsDialogComponent, { data: { projectIds: [_id] } }).afterClosed();
      });
  }

  openLayerSettings(): void {
    combineLatest([
      this.selectedLtaKeys$,
      this.selectedPvcalcKeys$,
      this.ltaAnnualLayers$,
      this.pvcalcAnnualLayers$
    ]).pipe(
      first(),
      switchMap(([selectedLtaKeys, selectedPvcalcKeys, ltaAnnualLayers, pvcalcAnnualLayers]) =>
        this.dialog.open(SelectDataLayersDialogComponent, {
          data: {
            selectedLtaKeys,
            selectedPvcalcKeys,
            ltaAnnualLayers,
            pvcalcAnnualLayers,
            componentName: this.componentName
          }
        }).afterClosed()
      ),
      first()
    ).subscribe(result => {
      // dispatch project-data-item keys
      if (result && this.componentName === 'map') {
        this.store.dispatch(new SettingsSelectMapDataKeys(result));
      }
      if (result && this.componentName === 'list') {
        this.store.dispatch(new SettingsSelectProjectListDataKeys(result));
      }
      if (result?.dataTabValue) {
        const dataTab = result.dataTabValue === 'mapData' ? 'mapData' : 'projectData';
        this.store.dispatch(new LayoutProjectListToggle({ dataTab }));
      }
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

  selectProject(project: Project): void {
    this.store.dispatch(new MapCenter({
      lat: project.site.point.lat,
      lng: project.site.point.lng,
      zoom: 10
    }));
    this.store.dispatch(new Select({ project: project._id, }));
  }

  claimFreetrial(): void {
    this.projectToClaimFreetrial$
      .pipe(first())
      .subscribe(project =>
        this.dialog.open(ClaimTrialDialogComponent, { data: { project } })
      );
  }

  toggleListSidebarState(state: 'none' | 'map' | 'info'): void {
    const sidebar = state === this.sidebarState ? 'none' : state;
    this.store.dispatch(new LayoutProjectListToggle({ sidebar }));
  }

  openShareDialog(): void {
    this.dialog.open(ProjectShareDialogComponent, {});
  }

  openUpdateDataDialog(): void {
    this.project$
      .pipe(first())
      .subscribe(project =>
        this.store.dispatch(new OpenUpdateProjectDataDialog(getProjectDefaultEnergySystemRef(project, 'prospect')))
      );
  }

  selectSiteFromSearch(site: Site): void {
    this.store.dispatch(new SiteFromSearch(site));
  }

  showSearchResults(sites: Site[]): void {
    this.store.dispatch(new SearchResults(sites));
  }

  clearSearchResults(): void {
    this.onSearchQuery.emit('');
    this.store.dispatch(new SearchClearResults());
  }

  exportProjects(): void {
    this.store.dispatch(new ExportSelected());
  }
}

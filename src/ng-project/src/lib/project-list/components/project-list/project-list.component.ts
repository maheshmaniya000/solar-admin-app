import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges, ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort as MaterialSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, map, pairwise, throttleTime } from 'rxjs/operators';

import { Dataset } from '@solargis/dataset-core';
import { Project } from '@solargis/types/project';
import { Unit } from '@solargis/units';

import { LayoutProjectListToggle } from 'ng-shared/core/actions/layout.actions';
import { ProjectListDataTabState } from 'ng-shared/core/reducers/layout.reducer';
import { selectLayoutProjectListDataTab } from 'ng-shared/core/selectors/layout.selector';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { selectIsProLicenceActive } from 'ng-shared/user/selectors/company.selectors';

import { MapCenter } from '../../../map/map.actions';
import { Export } from '../../../project/actions/project.actions';
import { ProjectRenameDialogComponent } from '../../../project/dialogs/project-rename-dialog/project-rename-dialog.component';
import { ProjectNamePipe } from '../../../project/pipes/project-name.pipe';
import { getProjectMetadataStatus } from '../../../project/reducers/projects.reducer';
import { LTA_DATASET } from '../../../project/services/lta-dataset.factory';
import { PVCALC_DATASET } from '../../../project/services/pvcalc-dataset.factory';
import { Select, ToggleSelectAll, Unselect } from '../../actions/selected.actions';
import { Sort } from '../../actions/sort.actions';
import { State } from '../../reducers';
import { SortState } from '../../reducers/sort.reducer';
import { selectFilteredProjects, selectFilteredSelectedProjects, selectIsAllProjectsSelected } from '../../selectors';
import { DataLayerColumn, hideLayersInFreeTrial, pvcalc, pvcalcDetails } from './project-list-layers.data';
import { ProjectListDataSource, ProjectListRow } from './project-list.data-source';

type SelectedState = 'SINGLE' | 'MULTI_SOME' | 'MULTI_ALL';
const COLUMN_LENGTH = 120;
const TABLE_WIDTH_DEFAULT = 400;

@Component({
  selector: 'sg-project-list',
  styleUrls: ['./project-list.component.scss'],
  templateUrl: './project-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent extends SubscriptionAutoCloseComponent implements OnInit, AfterViewInit, OnChanges {
  getProjectMetadataStatus = getProjectMetadataStatus;
  @Input() searchQuery: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSource: ProjectListDataSource;

  itemColumns = ['checkbox', 'latest-data', 'name', 'created'];    // fixed columns

  dataLayerColumns$: Observable<DataLayerColumn[]>; // dynamic columns
  allColumns$: Observable<string[]>;                // all columns combined, ordered

  dataTab$: Observable<ProjectListDataTabState>;
  dataTabIndex$: Observable<number>;

  isSelected: { [id: string]: boolean } = {};
  selectedState: SelectedState;

  isScrollHeader = false;
  isScrollNav = true;

  mapDataColumns$: Observable<DataLayerColumn[]>;
  projectDataColumns$: Observable<DataLayerColumn[]>;

  sort: SortState;

  private readonly searchQuery$ = new BehaviorSubject<string>('');

  defaultPageSettings: PageEvent = {
    pageSize: 20,
    pageIndex: 0,
    length: 0,
  };

  tableWidth: number;
  tableBottomHeight = 105;

  private readonly pagination$ = new BehaviorSubject(this.defaultPageSettings);

  countTableItems$: Observable<number>;

  constructor(private readonly store: Store<State>,
              private readonly dialog: MatDialog,
              private readonly projectNamePipe: ProjectNamePipe,
              @Inject(LTA_DATASET) private readonly ltaDataset: Dataset,
              @Inject(PVCALC_DATASET) private readonly pvcalcDataset: Dataset,
              private readonly cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.dataTab$ = this.store.pipe(selectLayoutProjectListDataTab);

    this.addSubscription(
      this.store.select('projectList', 'sort').subscribe(sort => this.sort = sort)
    );

    this.dataTabIndex$ = this.dataTab$.pipe(
      map(dataTab => dataTab === 'mapData' ? 0 : 1),
      distinctUntilChanged()
    );

    this.dataSource = new ProjectListDataSource(
      this.store, this.dataTab$, this.pagination$, this.projectNamePipe, this.ltaDataset, this.searchQuery$
    );

    const selectedProjectsLayers$ = this.store.select('settings', 'selected', 'projectList');

    this.mapDataColumns$ = selectedProjectsLayers$.pipe(
      map(keys => keys.ltaKeys.map(key => ({ dataset: 'lta', layerKey: key })))
    );

    this.projectDataColumns$ = selectedProjectsLayers$.pipe(
      map(keys => [...pvcalc, ...pvcalcDetails].filter(layer => keys.pvcalcKeys.includes(layer.layerKey)))
    );

    const hasProLicence$ = this.store.pipe(selectIsProLicenceActive);

    this.dataLayerColumns$ = combineLatest([this.dataTab$, this.mapDataColumns$, this.projectDataColumns$, hasProLicence$]).pipe(
      map(([dataTab, mapDataColumns, projectDataColumns, hasProLicence]) => {
        const allDataLayers = (dataTab === 'mapData' ? mapDataColumns : projectDataColumns);
        if (hasProLicence) {return allDataLayers;}
        else {return allDataLayers.filter(layer => hideLayersInFreeTrial.every(noShow => layer.layerKey !== noShow.layerKey));}
      })
    );

    this.addSubscription(
      this.dataLayerColumns$.subscribe(columns => this.tableWidth = columns.length * COLUMN_LENGTH + TABLE_WIDTH_DEFAULT)
    );

    this.allColumns$ = this.dataLayerColumns$.pipe(
      map(dataLayerColumns => [
        ...this.itemColumns,
        ...dataLayerColumns.map(col => col.layerKey)
      ])
    );

    this.countTableItems$ = this.dataSource.count$;
    this.cdr.detectChanges();

    const filteredSelectedProjects$ = this.store.pipe(selectFilteredSelectedProjects);
    const isAllProjectsSelected$ = this.store.pipe(selectIsAllProjectsSelected);

    const selectedState$ = combineLatest(filteredSelectedProjects$, isAllProjectsSelected$).pipe(
      map(([selectedProjects, isAllSelected]) => {
        if (!selectedProjects || selectedProjects.length === 0) {return 'SINGLE';}
        else if (!isAllSelected) {return 'MULTI_SOME';}
        else {return 'MULTI_ALL';}
      })
    );

    this.subscriptions.push(
      selectedState$.subscribe(state => {
        this.selectedState = state;
        // this.ref.markForCheck();
      })
    );

    const filteredProjectIds$ = this.store.pipe(
      selectFilteredProjects,
      map(projects => projects.map(project => project._id))
    );

    const projectSelected$ = this.store.select('projectList', 'selected');

    this.subscriptions.push(
      combineLatest(filteredProjectIds$, projectSelected$)
        .pipe(
          // map of selected projects {id: true/false }
          map(([ids, selected]) => ids.reduce((isSelected, id) => {
            isSelected[id] = selected.multi.includes(id) || selected.single === id;
            return isSelected;
          }, {})),
          distinctUntilChanged()
        )
        .subscribe(isSelected => this.isSelected = isSelected)
    );
  }

  isChecked(isSelected: boolean, state: SelectedState): boolean {
    return state !== 'SINGLE' && isSelected;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchQuery) {
      this.searchQuery$.next(this.searchQuery);
    }
  }

  ngAfterViewInit(): void {
    const bottomHeight1 = 55;
    const bottomHeight2 = 105;
    const content = document.querySelector('.table-wrapper');
    this.addSubscription(fromEvent(content, 'scroll').pipe(
      throttleTime(10),
      map(() => content.scrollTop),
      pairwise(),
      map(([scrollUp, scrollDown]) => scrollDown > scrollUp),
      ).subscribe( scrollDown => {
        if (scrollDown) {
          this.isScrollHeader = this.isScrollNav = !scrollDown;
        } else {
          this.isScrollHeader = this.isScrollNav = true;
        }
        this.tableBottomHeight = scrollDown ? bottomHeight1 : bottomHeight2;
      })
    );


    this.addSubscription(
      this.store.select('projectList', 'filter').subscribe(() => {
        this.paginator.firstPage();
      })
    );
  }

  selectProjectMenu(project: Project, selected: boolean): void {
    if (selected) {
      this.store.dispatch(new Select({ project: project._id}));
    }
  }

  selectProject(project: Project, selected: boolean, multi?: boolean): void {
    if (selected) {
      this.store.dispatch(new Select({ project: project._id, multi }));
      if (!multi) {
        this.store.dispatch(new MapCenter({ ...project.site.point }));
      }
    } else {
      this.store.dispatch(new Unselect(project._id));
    }
  }

  selectAll(): void {
    this.store.dispatch(new ToggleSelectAll());
  }

  onCheckboxClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  // TODO allow rename only if user is owner or editor
  renameProject(event: MouseEvent, project: Project): void {
    this.dialog.open(ProjectRenameDialogComponent, {
      // hasBackdrop: false,
      disableClose: false,
      // backdropClass: 'backdrop-invisible',
      data: { project },
    });

    event.stopPropagation();
  }

  sortData(sort: MaterialSort): void {
    this.store.dispatch(new Sort(sort));
  }

  pageChange(pageSetting: PageEvent): void {
    this.pagination$.next(pageSetting);
  }

  // used for caching table rows
  trackById(index: number, item: ProjectListRow): string {
    return item._id;
  }

  unit(column: DataLayerColumn): Unit {
    return column.dataset === 'lta'
      ? this.ltaDataset.annual.get(column.layerKey).unit
      : this.pvcalcDataset.annual.get(column.layerKey).unit;
  }

  hasValue(row: ProjectListRow, col: DataLayerColumn): boolean {
    const data = row.data[col.dataset];
    return data && data.annual && typeof data.annual.data[col.layerKey] !== 'undefined';
  }

  toggleDataTab(tabIndex: number): void {
    const dataTab = tabIndex === 0 ? 'mapData' : 'projectData';
    this.store.dispatch(new LayoutProjectListToggle({ dataTab }));
  }

  exportProject(project: Project): void {
    this.store.dispatch(new Export(project));
  }
}

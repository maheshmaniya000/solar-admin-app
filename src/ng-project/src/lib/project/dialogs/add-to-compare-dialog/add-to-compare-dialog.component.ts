import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { translate } from '@ngneat/transloco';
import { Store } from '@ngrx/store';
import { deburr, orderBy } from 'lodash-es';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { getEnergySystemRef } from '@solargis/types/project';
import { PvConfig, pvInstalledPower } from '@solargis/types/pv-config';
import { installedPowerUnit } from '@solargis/units';

import { selectAllProjectsAsCompareItem } from 'ng-project/project/selectors/energy-system.selectors';
import { SettingsCompareDialogPageSize } from 'ng-shared/core/actions/settings.actions';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { CompareBulkEdit } from '../../actions/compare.actions';
import { ProjectNamePipe } from '../../pipes/project-name.pipe';
import { State } from '../../reducers';
import { COMPARE_MAX_PROJECTS } from '../../reducers/compare.reducer';
import { getProjectMetadataStatus } from '../../reducers/projects.reducer';
import { selectCompareItems } from '../../selectors/compare.selectors';
import { CompareItem } from '../../types/compare.types';

type TableRow = {
  projectId: string;
  energySystemId: string;
  latestData: boolean;
  name: string;
  deburredName: string;
  systemType: string;
  installedSizeValue: number | string;
  pvConfig: PvConfig;
  lastChange: number;
  isSelected: boolean;
};

@Component({
  selector: 'sg-add-to-compare-dialog',
  templateUrl: './add-to-compare-dialog.component.html',
  styleUrls: ['./add-to-compare-dialog.component.scss']
})
export class AddToCompareDialogComponent extends SubscriptionAutoCloseComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  COMPARE_MAX_PROJECTS = COMPARE_MAX_PROJECTS;

  allProjects: TableRow[];
  dataSource: MatTableDataSource<TableRow>;

  compare$: Observable<CompareItem[]>;
  selected: Set<string> = new Set();

  actionButtonLabel = 'common.action.add';
  installedPowerUnit = installedPowerUnit;
  pvInstalledPower = pvInstalledPower;

  pageSize$: Observable<number>;

  columns = ['checked', 'latestData', 'name', 'systemType', 'installedSizeValue', 'lastChange'];

  constructor(
    public dialogRef: MatDialogRef<AddToCompareDialogComponent>,
    private readonly projectNamePipe: ProjectNamePipe,
    private readonly store: Store<State>,
    private readonly router: Router,
    @Inject(MAT_DIALOG_DATA) public data: | { sortBy: string | undefined; order: 'asc' | 'desc' | undefined } | undefined) {
    super();
  }

  ngOnInit(): void {
    this.compare$ = this.store.pipe(selectCompareItems);
    this.subscriptions.push(
      this.compare$
        .pipe(first())
        .subscribe(compare =>
          compare.forEach(item => this.selected.add(item.energySystemId))
        )
    );
    this.subscriptions.push(
      this.store
        .pipe(selectAllProjectsAsCompareItem)
        .pipe(
          map(projects => {
            const tableData = projects.map(project => {
              const projectId = project.project._id;
              const energySystemId = project.energySystemId;
              const name = this.projectNamePipe.transform(project.project, null);
              const deburredName = deburr(name);
              const systemType = project.energySystem
                ? translate(`pvConfig.type.${project.energySystem.pvConfig.type}.name`)
                : '-';
              const pvConfig = project.energySystem
                ? project.energySystem.pvConfig
                : null;
              const installedSizeValue =
                !!project.energySystem && !!project.energySystem.pvRequest
                  ? project.energySystem.pvRequest.pvInstalledPower
                  : null;
              const lastChange = project.project.updated.ts;
              const isSelected = this.selected.has(project.energySystemId);
              const latestData = getProjectMetadataStatus(project.project, 'prospect').latest;
              const tableRow: TableRow = {
                projectId,
                energySystemId,
                latestData,
                name,
                deburredName,
                systemType,
                installedSizeValue,
                pvConfig,
                lastChange,
                isSelected
              };

              return tableRow;
            });
            if (!!this.data && !!this.data.sortBy) {
              return orderBy(tableData, [this.data.sortBy], [this.data.order]);
            } else {
              return tableData;
            }
          })
        )
        .subscribe(projects => {
          this.allProjects = projects;
          this.dataSource = new MatTableDataSource(this.allProjects);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        })
    );

    if (!this.router.url.includes('compare')) {
      this.actionButtonLabel = 'common.action.compare';
    }

    this.pageSize$ = this.store
      .select('settings', 'pagination')
      .pipe(map(item => item.compareDialog.pageSize));
  }

  isSelected(item: CompareItem): boolean {
    return this.selected.has(item.energySystemId);
  }

  onItemChange(item: CompareItem): void {
    if (this.selected.size < COMPARE_MAX_PROJECTS) {
      if (this.selected.has(item.energySystemId)) {
        this.selected.delete(item.energySystemId);
      } else {
        this.selected.add(item.energySystemId);
      }
    } else {
      if (this.selected.size >= COMPARE_MAX_PROJECTS && this.selected.has(item.energySystemId)) {
        this.selected.delete(item.energySystemId);
      }
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  setPageSize(pageEvent: PageEvent): void {
    const { pageSize } = pageEvent;
    this.store.dispatch(new SettingsCompareDialogPageSize(pageSize));
  }

  save(): void {
    this.subscriptions.push(
      this.compare$.pipe(first()).subscribe(compare => {
        const toRemove = compare
          .filter(item => !this.selected.has(item.energySystemId))
          .map(item => item.energySystemRef);

        const inCompare = new Set(compare.map(item => item.energySystemId));
        const toAdd = Array.from(this.selected)
          .filter((ref: string) => !inCompare.has(ref))
          .map(ref => getEnergySystemRef(ref));

        this.store.dispatch(new CompareBulkEdit({ toAdd, toRemove }));
        this.closeDialog(Array.from(this.selected));
      })
    );

    this.router.navigate(['/compare']);
  }

  closeDialog(selected?: string[]): void {
    this.dialogRef.close(selected);
  }
}

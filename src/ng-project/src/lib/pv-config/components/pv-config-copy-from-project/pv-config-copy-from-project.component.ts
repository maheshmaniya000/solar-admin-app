import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslocoService } from '@ngneat/transloco';
import { BehaviorSubject,  combineLatest, Observable } from 'rxjs';
import { debounceTime, map, startWith, withLatestFrom } from 'rxjs/operators';

import { Project, ProjectId } from '@solargis/types/project';
import { Orientation, PvConfig, pvConfigTemplateMap, PvConfigType, pvInstalledPower, SystemPvConfig } from '@solargis/types/pv-config';
import { ProspectLicense } from '@solargis/types/user-company';
import { installedPowerUnit } from '@solargis/units';

import { ProjectNamePipe } from '../../../project/pipes/project-name.pipe';

type TableRow = {
  project: Project;
  pvConfig: SystemPvConfig;
  disabled: boolean;
  searchString: string; // for fulltext search
  systemType: string;
  name: string;
};

type Order = {
  active: string;
  direction: 'asc' | 'desc';
};

@Component({
  selector: 'sg-pv-config-copy-from-project',
  templateUrl: './pv-config-copy-from-project.component.html',
  styleUrls: ['./pv-config-copy-from-project.component.scss']
})
export class PvConfigCopyFromProjectComponent implements OnInit {

  @Input() projectPvConfigTuples: [Project, PvConfig][];
  @Input() optimalOrientation: Orientation;
  @Input() permissions: string[];
  @Input() license: ProspectLicense;

  @Output() onSelected = new EventEmitter<PvConfig>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  defaultOrder: Order = { active: '', direction: 'asc' };
  order: Order = this.defaultOrder;
  sort$ = new BehaviorSubject<Order>(this.defaultOrder);

  allRows$: Observable<TableRow[]>;

  selected: ProjectId;

  searchResults$: Observable<TableRow[]>;
  dataSource$: Observable<TableRow[]>;
  columns = ['checked', 'name', 'systemType', 'systemSize', 'created'];

  pvInstalledPower = pvInstalledPower;
  installedPowerUnit = installedPowerUnit;

  form: FormGroup;

  defaultPageSize = 10;
  pageEvent$ = new BehaviorSubject<PageEvent>({ pageSize: this.defaultPageSize, pageIndex: 0, length: 0 });

  constructor(
    private readonly projectNamePipe: ProjectNamePipe,
    private readonly transloco: TranslocoService,
  ) { }

  getPvConfigTypeTranslateKey(pvConfigType: PvConfigType | 'noPvSystem'): string {
    return `pvConfig.type.${pvConfigType}.name`;
  }

  isPvConfigDisabled(pvConfig: PvConfig): boolean {
    const template = pvConfigTemplateMap[pvConfig.type];
    return template.access && !this.permissions.includes(template.access);
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      query: new FormControl('', []),
    });

    this.allRows$ = this.transloco.selectTranslateObject('pvConfig.type').pipe(
      map(pvConfigTypesTranslated =>
        this.projectPvConfigTuples.map(([project, pvConfig]: [Project, PvConfig]) => {
          const projectName = this.projectNamePipe.transform(project, null);
          const pvTypeTranslated = pvConfigTypesTranslated[pvConfig.type]?.name;
          return {
            project,
            pvConfig: pvConfig as SystemPvConfig,
            searchString: `${projectName} ${pvTypeTranslated}`.toLowerCase(),
            name: projectName ,
            systemType: pvTypeTranslated,
            disabled: this.isPvConfigDisabled(pvConfig)
          };
        })
      )
    );

    // input does never change
    this.searchResults$ = this.form.valueChanges.pipe(
      map(values => values.query.toLowerCase() || ''),
      debounceTime(50),
      startWith(''),
      withLatestFrom(this.allRows$),
      // split query and test name for every subquery
      map(([query, rows]) => {
        const subqueries = query.toLowerCase().split(' ');
        return rows.filter(row => subqueries.map(subq => row.searchString.includes(subq)).every(Boolean));
      }),
    );

    this.dataSource$ = combineLatest(
      this.searchResults$,
      this.pageEvent$,
      this.sort$,
    ).pipe(
      map(([results, pageEvent, sort]) => {
        const page = pageEvent.pageIndex;
        const { pageSize } = pageEvent;
        results = this.sortByHeader(results, sort);
        return results.slice(page * pageSize, (page + 1) * pageSize);
      })
    );
  }

  sortByHeader(results: TableRow[], sort: Order): TableRow[] {
    switch (sort.active) {
      case 'created': {
        const sortedData = results.sort((r1, r2) => r1.project.created.ts - r2.project.created.ts);
        return (sort.direction === 'asc' ? sortedData : sortedData.reverse());
      }

      case 'name': {
        const name = results.sort(
          (r1, r2) => r1.name.localeCompare(r2.name, 'fr', { ignorePunctuation: true })
        );
        return (sort.direction === 'asc' ? name : name.reverse());
      }

      case 'systemType': {
        const type = results.sort(
          (r1, r2) => r1.systemType.localeCompare(r2.systemType, 'fr', { ignorePunctuation: true })
        );
        return (sort.direction === 'asc' ? type : type.reverse());
      }

      case 'systemSize': {
        const size = results.sort((r1, r2) => r1.pvConfig.systemSize?.value - r2.pvConfig.systemSize?.value);
        return (sort.direction === 'asc' ? size : size.reverse());
      }

      default:
        return results;
    }
  }

  sortData(order: Order): void {
    this.sort$.next(order);
    this.order = order;
  }

  changePage(pageSetting: PageEvent): void {
    this.pageEvent$.next(pageSetting);
  }

  select(row: TableRow): void {
    if (this.isPvConfigDisabled(row.pvConfig)) {return;}
    this.selected = row.project._id;
    const pvConfig = { ...row.pvConfig } as SystemPvConfig;
    if (pvConfig.orientation && pvConfig.type !== PvConfigType.BuildingIntegrated) {
      pvConfig.orientation = this.optimalOrientation;
    }
   this.onSelected.emit(pvConfig);
  }
}

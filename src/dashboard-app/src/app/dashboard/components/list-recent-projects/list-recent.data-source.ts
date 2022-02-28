import { DataSource } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { PlacemarkPartPipe } from '@solargis/ng-geosearch';
import { StaticMapSize, staticMapUrl } from '@solargis/types/map';
import { latlngToUrlParam, LatLngZoom } from '@solargis/types/site';

import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { satelliteMapLayerId } from 'ng-project/utils/map.constants';
import { ProspectAppConfig } from 'ng-shared/config';

import { TableRow } from '../../types/list-recent-layers.types';
import { DashboardRecentProjectsItem } from '../../types/recent-projects.types';

export class RecentProjetsDataSource extends DataSource<TableRow> {

  constructor(
    private readonly allProjects$: Observable<DashboardRecentProjectsItem[]>,
    private readonly pageEvent$: BehaviorSubject<PageEvent>,
    private readonly sort$: BehaviorSubject<Sort>,
    private readonly projectNamePipe: ProjectNamePipe,
    private readonly config: ProspectAppConfig,
    public placemarkPart: PlacemarkPartPipe,
    private readonly devicePixelRatio: number,
  ) { super(); }

  getCount(): Observable<number> {
    return this.allProjects$.pipe(
      map(orders => orders && orders?.length)
    );
  }

  connect(): Observable<TableRow[]> {
    return combineLatest([this.allProjects$, this.pageEvent$, this.sort$]).pipe(
      map(([projects, pageEvent, sort]) => {
        const tableData = projects.map(values => {
          const center: LatLngZoom = { ...values.project.site.point, zoom: 16 };
          const layerDef = this.config.map.layers.find(layer => layer._id === satelliteMapLayerId);
          const size: StaticMapSize = { width: 300, height: 200, devicePixelRatio: this.devicePixelRatio };
          const placemarkAddress = this.placemarkPart?.transform(values?.project?.site?.place?.placemark, 'address');
          const placemarkCountry = this.placemarkPart?.transform(values?.project?.site?.place?.placemark, 'country');
          const tableRow: TableRow = {
            app: values.project.app?.prospect?.app,
            address: [placemarkAddress, placemarkCountry].filter(x => !!x).join(', '),
            point: latlngToUrlParam(values.project.site.point),
            projectId: values.project._id,
            projectName: this.projectNamePipe.transform(values.project, null),
            pvInstalledPower: values?.energySystem?.pvRequest?.pvInstalledPower,
            srcImg: staticMapUrl(layerDef, center, size, center),
            updatedTs: values.project.updated.ts,
          };
          return tableRow;
        });
        const pageIndex = pageEvent ? (pageEvent as PageEvent).pageIndex : 0;
        const pageSize = (pageEvent as PageEvent)?.pageSize ? (pageEvent as PageEvent)?.pageSize : 10;
        const sortedProjects = sort.direction === 'desc'
          ? this.sortByHeader(tableData, sort).reverse()
          : this.sortByHeader(tableData, sort);
        return sortedProjects.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
      }),
      distinctUntilChanged(),
    );
  }

  sortByHeader(tableData: TableRow[], sort: Sort): TableRow[] {
    switch (sort.active) {
      case 'name':
        return tableData.sort((a: TableRow, b: TableRow) => a.projectName.localeCompare(b.projectName));

      case 'address':
        return tableData.sort((a: TableRow, b: TableRow) => a.address.localeCompare(b.address));

      case 'capacity':
        return tableData.sort((a: TableRow, b: TableRow) => (
          (a.pvInstalledPower ? a.pvInstalledPower : 0) - (b.pvInstalledPower ? b.pvInstalledPower : 0)
        ));

      case 'updatedTs':
        return tableData.sort((a: TableRow, b: TableRow) => a.updatedTs - b.updatedTs);

      default:
      return tableData;
    }
  }

  disconnect(): void {
    // do nothing
  }

}

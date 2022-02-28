import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Options } from 'highcharts';
import { Observable } from 'rxjs';

import { DataLayer } from '@solargis/dataset-core';
import { Project } from '@solargis/types/project';
import { PvConfig } from '@solargis/types/pv-config';

import { ProjectNamePipe } from 'ng-project/project/pipes/project-name.pipe';
import { ExportChartOpts } from 'ng-project/project/types/export-chart.types';
import { prospectUpgradeUrl } from 'ng-shared/shared/utils/url.utils';

export type ChartCardInput = {
  layers: DataLayer | DataLayer[];
  chart: Observable<Options>;
  hasPermission?: boolean;
}[];

@Component({
  selector: 'sg-chart-card',
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCardComponent implements OnInit {
  @Input() project: Project;
  @Input() pvConfig: PvConfig;
  @Input() charts: ChartCardInput;
  @Input() allowExporting = false;

  isMulti: boolean;
  allDisabled: boolean;
  prospectPricingUrl = prospectUpgradeUrl;
  selectedTabIndex = 0;

  constructor(private readonly projectNamePipe: ProjectNamePipe) {}

  ngOnInit(): void {
    this.isMulti = this.charts.length > 1;
    this.allDisabled = this.charts.map(c => c.hasPermission).every(x => !x);
  }

  tabIndexChange(id: number): void {
    this.selectedTabIndex = id;
  }

  exportingOpts = (layers: DataLayer | DataLayer[]): ExportChartOpts => this.allowExporting && {
    layers,
    single: {
      projectName: this.projectNamePipe.transform(this.project),
      pvConfig: this.pvConfig
    }
  };

}

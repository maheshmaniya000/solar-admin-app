import { ChangeDetectionStrategy, Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';

import { BASIC_NOPV, BASIC_PV, PRO_NOPV, PRO_PV, TableOfContents } from '../../utils/table-of-contents';

@Component({
  selector: 'sg-table-of-contents',
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TableOfContentsComponent implements OnChanges {
  @Input() hasPvConfig: boolean;
  @Input() includeEconomy: boolean;
  @Input() companyLicense: string;

  table: TableOfContents;
  pageNumbers: number[];

  ngOnChanges(): void {
    this.table = this.hasPvConfig ? [
      { id: 'overview', title: 'projectDetail.nav.overview' },
      { id: 'projectInfo', title: 'projectDetail.info.info' },
      { id: 'pvConfig', title: 'projectDetail.pvConfig.pvConfiguration' },
      { id: 'solarMeteo', title: 'projectDetail.nav.solarMeteo', subtitle: 'projectDetail.nav.monthlyStatistics' },
      { id: 'pvElectricity', title: 'projectDetail.nav.pvElectricity', subtitle: 'projectDetail.nav.monthlyStatistics' },
      { id: 'pvElectricityHourly', title: 'projectDetail.nav.pvElectricity', subtitle: 'projectDetail.nav.hourlyProfiles' },
      { id: 'pvPerformanceLosses', title: 'projectDetail.nav.pvPerformance', subtitle: 'projectDetail.nav.pvLosses' },
      { id: 'pvPerformanceLifetime', title: 'projectDetail.nav.pvPerformance', subtitle: 'projectDetail.nav.lifetimePerformance'}
    ] : [
      { id: 'overview', title: 'projectDetail.nav.overview' },
      { id: 'projectInfo', title: 'projectDetail.info.info' },
      { id: 'solarMeteo', title: 'projectDetail.nav.solarMeteo', subtitle: 'projectDetail.nav.monthlyStatistics' },
      { id: 'solarMeteoDaily', title: 'projectDetail.nav.solarMeteo', subtitle: 'report.dailyStats' }
    ];

    if (this.includeEconomy && this.hasPvConfig) {
      this.table = [...this.table, { id: 'economy', title: 'projectDetail.nav.finance' }];
    }

    this.table = [
      ...this.table,
      { id: 'glossary', title: 'report.glossary.title' },
      { id: 'metadata', title: 'projectDetail.nav.metadata' },
      { id: 'disclaimer', title: 'report.legal.title' }
    ];

    if (this.companyLicense === 'BASIC') {
      this.pageNumbers = this.hasPvConfig ? BASIC_PV(this.includeEconomy) : BASIC_NOPV;
    } else {
      this.pageNumbers = this.hasPvConfig ? PRO_PV(this.includeEconomy) : PRO_NOPV;
    }
  }
}

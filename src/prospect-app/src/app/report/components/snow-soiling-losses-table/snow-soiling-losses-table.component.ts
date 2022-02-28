import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { SnowSoilingLosses } from '@solargis/types/pv-config';
import { range } from '@solargis/types/utils';
import { units } from '@solargis/units';

import { months } from 'ng-shared/utils/translation.utils';

@Component({
  selector: 'sg-snow-soiling-losses-table',
  templateUrl: './snow-soiling-losses-table.component.html',
  styleUrls: [ './snow-soiling-losses-table.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnowSoilingLossesTableComponent implements OnInit {
  @Input() params: SnowSoilingLosses;

  dataSource: any[];
  columns: string[] = [''];
  unit = units['%'];
  months = months;

  ngOnInit(): void {
    const soiling = [];
    const snow = [];

    const soilingArray = Array.isArray(this.params.soiling) ? this.params.soiling : range(12).map(() => this.params.soiling as number);
    soilingArray.forEach((s, i) => soiling[this.months[i]] = s);

    this.params.snow.forEach((s, i) => snow[this.months[i]] = s);

    this.dataSource = [
      { type: 'soilingLossesForm', ...soiling },
      { type: 'snowLossesForm', ...snow }
    ];

    this.columns = ['type', ...months];
  }

}

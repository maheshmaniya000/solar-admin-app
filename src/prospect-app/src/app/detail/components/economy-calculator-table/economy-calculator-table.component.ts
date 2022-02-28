import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  economyLayersMap,
  EconomyCalculatorOutput,
  economyCalculatorShortenedRows,
  economyCalculatorRows,
  economyCalculatorSumRows
} from '@solargis/prospect-detail-calc';
import { range, sum } from '@solargis/types/utils';
import { Unit } from '@solargis/units';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

@Component({
  selector: 'sg-economy-calculator-table',
  templateUrl: './economy-calculator-table.component.html',
  styleUrls: ['./economy-calculator-table.component.scss']
})
export class EconomyCalculatorTableComponent extends SubscriptionAutoCloseComponent implements OnInit {

  @Input() economy$: Observable<EconomyCalculatorOutput>;
  @Input() shorten = true;
  @Input() inverse = false;
  @Input() maxHeight: number;

  dataColumns = [];
  columns = [];
  rows = [];
  table$: Observable<any>;

  sum = sum;

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (!this.inverse) {
      this.rows = this.shorten ? economyCalculatorShortenedRows : economyCalculatorRows;

      this.addSubscription(
        this.economy$.subscribe(economy => {
          this.dataColumns = range(economy.length).map(x => x.toString());
          this.columns = ['label', 'unit'].concat(this.dataColumns).concat(['sum']);
        })
      );

      this.table$ = this.economy$.pipe(
        map(economy => this.rows.map(row => ({
          id: row,
          unit: row && economyLayersMap.get(row).unit,
          data: row && economy.map(year => year[row])
        }))),
      );
    } else {
      this.dataColumns = this.shorten ? economyCalculatorShortenedRows : economyCalculatorRows;
      this.columns = ['year', ...this.dataColumns];

      this.addSubscription(
        this.economy$.subscribe(economy => {
          this.rows = range(economy.length).map(x => x.toString());
        })
      );

      this.table$ = this.economy$.pipe(
        map(economy => {
          const sumRow = {year: 'sum'};
          this.dataColumns.forEach(col => sumRow[col] = this.isSumRow(col) ? sum(economy.map(year => year[col])) : null);
          return [ ...economy, sumRow ];
        }),
      );
    }
  }

  isSumRow = (id: string): boolean => economyCalculatorSumRows.includes(id);

  getUnit = (id: string): Unit => economyLayersMap.get(id).unit;

  isLayerKey = (id: string): boolean => id.includes('_');

  // width of table - 450 is buffer and 106 is width of each data column
  tableWidth = (): string => 450 + (this.dataColumns.length * 106) + 'px';

}

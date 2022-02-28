import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DataLayer } from '@solargis/dataset-core';

@Component({
  selector: 'sg-glossary-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './glossary-table.component.html',
  styleUrls: ['./glossary-table.component.scss']
})
export class GlossaryTableComponent implements OnChanges {

  @Input() layers: DataLayer[];
  @Input() noAcronym = false;
  @Input() noSort = false;
  @Input() print = false;

  layers$: BehaviorSubject<DataLayer[]> = new BehaviorSubject<DataLayer[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.layers.currentValue && changes.layers.currentValue.length) {
      const nextLayers = this.noSort
        ? changes.layers.currentValue
        : changes.layers.currentValue.sort(
          (a: DataLayer, b: DataLayer) => a.key > b.key ? 1 : a.key < b.key ? -1 : 0
        );
      this.layers$.next(nextLayers);
    }
  }

  columns(): string[] {
    return this.noAcronym
      ? ['name', 'unit', 'explanation']
      : ['acronym', 'name', 'unit', 'explanation'];
  }

}

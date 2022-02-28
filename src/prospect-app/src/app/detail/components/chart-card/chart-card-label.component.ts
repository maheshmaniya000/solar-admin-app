import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { DataLayer } from '@solargis/dataset-core';

@Component({
  selector: 'sg-chart-card-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sg-project-data-key [key]="layers.key" *ngIf="!isArray; else array"></sg-project-data-key>
    <ng-template #array>
      <ng-container *ngFor="let layer of layers; let last = last">
        <sg-project-data-key [key]="layer.key"></sg-project-data-key>
        <span *ngIf="!last">&nbsp;+&nbsp;</span>
      </ng-container>
    </ng-template>
  `,
})
export class ChartCardLabelComponent implements OnInit {
  @Input() layers: DataLayer | DataLayer[];
  isArray: boolean;

  ngOnInit(): void {
    this.isArray = Array.isArray(this.layers);
  }

}

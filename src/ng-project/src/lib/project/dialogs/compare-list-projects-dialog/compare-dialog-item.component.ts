import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { PvConfig, NoPvSystem } from '@solargis/types/pv-config';

import { CompareItem } from '../../types/compare.types';

@Component({
  selector: 'sg-compare-dialog-item',
  template: `
    <div fxLayout="row" [ngClass]="{'highlighted': highlighted }">
      <div fxFlex="60px">
        <img src="assets/pvconfig/{{ pvConfig?.type }}.svg" width="50" height="50" />
      </div>
      <div fxFlex class="text">
        <div>{{ item.project | sgProjectName }}</div>
        <div>{{ 'pvConfig.type.' + pvConfig?.type + '.name' | transloco }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./compare-dialog-item.component.scss']
})
export class CompareDialogItemComponent implements OnChanges {

  @Input() item: CompareItem;
  @Input() highlighted = false;
  pvConfig: PvConfig;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.pvConfig = this.item.energySystem && this.item.energySystem.pvConfig || NoPvSystem;
    }
  }
}

import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';

import { DataLayer, isLayerCodelistValue } from '@solargis/dataset-core';
import { AnnualDataMap, DataStatsMap, MonthlyDataMap } from '@solargis/types/dataset';
import { MapLayerDefWithAccess } from '@solargis/types/map';
import { Unit } from '@solargis/units';

@Component({
  selector: 'sg-project-data-item',
  styleUrls: ['./project-data-item.component.scss'],
  templateUrl: './project-data-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDataItemComponent implements OnInit, OnChanges {
  @Input() inProgress: boolean;
  @Input() layerKey: string;
  @Input() layer: DataLayer;
  @Input() mapLayer: MapLayerDefWithAccess;
  @Input() isSelectedMap: boolean;
  @Input() annualData: AnnualDataMap;
  @Input() monthlyData: MonthlyDataMap;
  @Input() monthlyDataStats: DataStatsMap;

  @Output() onSelectMap = new EventEmitter<string>();

  unit: Unit;
  value: any;

  hovering = false;

  ngOnInit(): void {
    this.unit = this.layer.unit;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.annualData) {
      this.value = this.annualData ? this.annualData[this.layerKey] : undefined;
    }
  }

  hasValue(): boolean {
    return !this.inProgress && typeof this.value !== 'undefined';
  }

  canSelectMap(): boolean {
    return !this.isSelectedMap
      && this.hovering
      && !!this.layer.mapId // maybe not needed
      && (this.mapLayer && this.mapLayer.accessGranted);
  }

  selectMap(): void {
    if (this.canSelectMap()) {
      this.onSelectMap.emit(this.layer.mapId);
    }
  }

  isCodelistValue(): boolean {
    return isLayerCodelistValue(this.layer, this.value);
  }

}

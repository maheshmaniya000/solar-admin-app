import { Component, Inject, Input, OnChanges } from '@angular/core';

import { DataLayer, Dataset } from '@solargis/dataset-core';

import { LTA_DATASET } from 'ng-project/project/services/lta-dataset.factory';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { CompareItem } from 'ng-project/project/types/compare.types';

import { OverviewLayers } from '../../../utils/compare-layers.utils';

type GetLayer = (name: string) => DataLayer;

@Component({
  selector: 'sg-project-overview-table',
  templateUrl: './project-overview-table.component.html',
  styleUrls: ['./project-overview-table.component.scss']
})
export class ProjectOverviewTableComponent implements OnChanges{

  @Input() dataSource: OverviewLayers[];
  @Input() layer: GetLayer;
  @Input() compare: CompareItem[];
  @Input() isProjectSelected: boolean;
  @Input() columns: string[];
  @Input() selectedEnergySysId: string;

  isComparing: boolean;
  readonly paramNameColWidth = '134px';

  constructor(
    @Inject(LTA_DATASET) public ltaDataset: Dataset,
    @Inject(PVCALC_DATASET) public pvcalcDataset: Dataset,
  ) {}

  ngOnChanges(): void {
    this.isComparing = this.compare.some(item => item.energySystemId === this.selectedEnergySysId);
  }
}

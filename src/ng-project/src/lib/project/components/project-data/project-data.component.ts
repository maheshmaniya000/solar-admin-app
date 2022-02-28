import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataLayerMap, Dataset } from '@solargis/dataset-core';
import { DataStatsMap, VersionedData, VersionedDatasetData } from '@solargis/types/dataset';
import { MapLayerDefWithAccess } from '@solargis/types/map';
import { Project } from '@solargis/types/project';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { monthlyDataStats } from '../../../utils/stats.utils';
import { DatasetAccessService } from '../../services/dataset-access.service';

@Component({
  selector: 'sg-project-data',
  styleUrls: [ './project-data.component.scss' ],
  templateUrl: './project-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDataComponent extends SubscriptionAutoCloseComponent implements OnInit, OnChanges, OnDestroy {

  @Input() project$: Observable<Project>;

  @Input() dataset: Dataset;
  @Input() data: VersionedDatasetData;
  @Input() inProgress: boolean;

  @Input() selectedKeys: string[];
  selectedKeys$ = new BehaviorSubject<string[]>([]);
  @Input() hideMissingKeys: boolean;

  @Input() mapLayers: MapLayerDefWithAccess[];
  @Input() mapLayerId: string;

  @Output() onSelectMap = new EventEmitter<string>();

  layers: DataLayerMap;
  layers$: Observable<DataLayerMap>;
  layerKeys$: Observable<string[]>;

  annualData: VersionedData;
  monthlyData: VersionedData;
  monthlyDataStats: DataStatsMap;

  constructor(private readonly datasetService: DatasetAccessService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedKeys) {
      this.selectedKeys$.next(this.selectedKeys);
    }
    if (changes.data) {
      this.annualData = this.data && this.data.annual;
      this.monthlyData = this.data && this.data.monthly;
      this.monthlyDataStats = this.monthlyData && this.monthlyData.data
        ? monthlyDataStats(this.monthlyData.data, this.dataset.monthly)
        : undefined;
    }
  }

  ngOnInit(): void {
    this.layers$ = this.datasetService.dataLayersWithAccess$(this.dataset.annual, this.project$);

    this.addSubscription(
      this.layers$.subscribe(layers => this.layers = layers)
    );

    this.layerKeys$ = combineLatest(this.selectedKeys$, this.layers$).pipe(
      map(([selectedKeys, layers]) => selectedKeys.filter(key => !!layers.get(key)))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getMapLayer(layerKey: string): MapLayerDefWithAccess {
    return this.mapLayers && this.mapLayers.find(mapLayer => mapLayer.dataKey === layerKey);
  }

  showLayer(layerKey: string): boolean {
    const accessGranted = this.layers.get(layerKey).accessGranted;
    return this.hideMissingKeys
      ? accessGranted && this.annualData && typeof this.annualData.data[layerKey] !== 'undefined'
      : accessGranted;
  }

}

import { ChangeDetectionStrategy, Component, Input, OnChanges, Predicate } from '@angular/core';

import { hasPvConfig } from '@solargis/types/project';

import { getProjectMetadataStatus } from 'ng-project/project/reducers/projects.reducer';
import { CompareItem } from 'ng-project/project/types/compare.types';

import { CompareRouteWarningsConfig } from '../../compare.routes';
import { hasEconomyConfig } from '../../utils/energy-system.utils';

@Component({
  selector: 'sg-compare-warnings',
  templateUrl: './compare-warnings.component.html',
  styleUrls: ['./compare-warnings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompareWarningsComponent implements OnChanges {
  private static readonly defaultConfig: Required<CompareRouteWarningsConfig> = {
    noPvConfig: false,
    noEconomyConfig: false,
    noLatestData: true
  };

  private static readonly predicates: Record<keyof CompareRouteWarningsConfig, Predicate<CompareItem>> = {
    noPvConfig: item => !hasPvConfig(item.energySystem),
    noEconomyConfig: item => !hasEconomyConfig(item.energySystem),
    noLatestData: item => !getProjectMetadataStatus(item.project, 'prospect').latest
  };

  @Input() items: CompareItem[];
  @Input() config: CompareRouteWarningsConfig;

  visibleWarningKeys: string[];

  ngOnChanges(): void {
    const config = {
      ...CompareWarningsComponent.defaultConfig,
      ...this.config
    };
    this.visibleWarningKeys = Object.keys(config)
      .filter(key => config[key])
      .filter(key => this.items.some(CompareWarningsComponent.predicates[key]));
  }
}

import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { PvConfig, PvConfigTemplate } from '@solargis/types/pv-config';

type PvConfigWithStatus = PvConfig & {
  disabled?: boolean;
  selected?: boolean;
};

@Component({
  selector: 'sg-pv-config-select-default-list',
  templateUrl: './pv-config-select-default-list.component.html',
  styleUrls: ['./pv-config-select-default-list.component.scss']
})
export class PvConfigSelectDefaultListComponent implements OnChanges {

  @Input() pvConfigTemplates: PvConfigTemplate[];
  @Input() permissions: string[];
  @Output() onSelected = new EventEmitter<PvConfig>();

  pvConfigs: PvConfigWithStatus[];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pvConfigTemplates || changes.permissions) {
      this.pvConfigs = this.pvConfigTemplates.map(({ access, ...pvConfigWithoutAccess }) => ({
        ...pvConfigWithoutAccess,
        disabled: access && !this.permissions.includes(access),
        selected: false
      }));
    }
  }

  select(pvConfig: PvConfigWithStatus): void {
    this.pvConfigs.map(value => value.selected = false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { disabled, selected, ...pvConfigWithoutStatus } = pvConfig;
    if (!disabled) {
      this.onSelected.emit(pvConfigWithoutStatus);
      pvConfig.selected = true;
    }
  }

}

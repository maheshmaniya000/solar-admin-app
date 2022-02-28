import { Component, Input, Output, EventEmitter } from '@angular/core';

import { PvConfigTemplate } from '@solargis/types/pv-config';

@Component({
  selector: 'sg-pv-config-select-default',
  templateUrl: './pv-config-select-default.component.html',
  styleUrls: ['./pv-config-select-default.component.scss']
})
export class PvConfigSelectDefaultComponent {
  @Input() pvConfigTemplates: PvConfigTemplate[];
  @Input() permissions: string[];

  @Output() onSelected = new EventEmitter<PvConfigTemplate>();
}

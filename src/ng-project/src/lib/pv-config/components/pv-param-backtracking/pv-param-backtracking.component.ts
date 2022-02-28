import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Backtracking } from '@solargis/types/pv-config';

@Component({
  selector: 'sg-pv-param-backtracking',
  templateUrl: './pv-param-backtracking.component.html',
  styleUrls: ['./pv-param-backtracking.component.scss']
})
export class PvParamBacktrackingComponent {

  @Input() params: Backtracking;
  @Output() onChange: EventEmitter<Backtracking> = new EventEmitter<Backtracking>();

  setEnabled(enabled: boolean): void {
    this.onChange.emit({ enabled } as Backtracking);
  }
}

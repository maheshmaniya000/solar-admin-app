import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { EconomyInputsRow } from '../../utils/economy-inputs';

@Component({
  selector: 'sg-economy-inputs-row',
  templateUrl: './economy-inputs-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EconomyInputsRowComponent {
  @Input() def: EconomyInputsRow;
}

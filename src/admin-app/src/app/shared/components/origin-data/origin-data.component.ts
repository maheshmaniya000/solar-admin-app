import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { isEmpty } from 'lodash-es';

@Component({
  selector: 'sg-admin-origin-data',
  styleUrls: ['../../../shared/components/admin-common.styles.scss', './origin-data.component.scss'],
  templateUrl: './origin-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OriginDataComponent {
  @Input() entity: { originSystem?: string; originData?: string; originFile?: string; created?: string; updated?: string };

  hasOriginData(): boolean {
    return !isEmpty(this.entity.originData);
  }

  hasOriginFile(): boolean {
    return !isEmpty(this.entity.originFile);
  }
}

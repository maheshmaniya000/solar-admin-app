import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { isEmpty } from 'lodash-es';

import { Vector2 } from '@solargis/types/pvlib-api';

import { AbstractMarkerComponent } from '../abstract-marker.component';

@Component({
  selector: 'sg-icon-marker',
  templateUrl: './icon-marker.component.html',
  styleUrls: ['./icon-marker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // eslint-disable-next-line no-use-before-define
    { provide: AbstractMarkerComponent, useExisting: IconMarkerComponent }
  ]
})
export class IconMarkerComponent extends AbstractMarkerComponent {
  @Input() icon: string;

  isIconVisible(): boolean {
    return !isEmpty(this.icon);
  }

  getPivotPoint(): Vector2 {
    const pivotPoint = super.getPivotPoint();
    pivotPoint.v *= 0.75;
    return pivotPoint;
  }
}

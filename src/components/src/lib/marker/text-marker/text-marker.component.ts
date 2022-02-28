import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input
} from '@angular/core';

import { Vector2 } from '@solargis/types/pvlib-api';

import { AbstractMarkerComponent } from '../abstract-marker.component';

@Component({
  selector: 'sg-text-marker',
  templateUrl: './text-marker.component.html',
  styleUrls: ['./text-marker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // eslint-disable-next-line no-use-before-define
    { provide: AbstractMarkerComponent, useExisting: TextMarkerComponent }
  ]
})
export class TextMarkerComponent extends AbstractMarkerComponent {
  @Input() text: string;

  @HostBinding('class.caretHidden')
  @Input()
  caretHidden = false;

  getPivotPoint(): Vector2 {
    const pivotPoint = super.getPivotPoint();
    return {
      u: pivotPoint.u,
      v: this.caretHidden ? pivotPoint.v / 2 : pivotPoint.v * 1.25
    };
  }
}

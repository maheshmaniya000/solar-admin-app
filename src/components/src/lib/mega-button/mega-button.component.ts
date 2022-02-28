import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { MegaButtonIcon } from './mega-button-icon.enum';

@Component({
  selector: 'sg-mega-button',
  templateUrl: './mega-button.component.html',
  styleUrls: ['./mega-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MegaButtonComponent {
  imageSrc: string;

  @Input()
  set icon(icon: MegaButtonIcon) {
    this.imageSrc = `assets/img/mega-button/sprite.svg#${icon}`;
  }
}

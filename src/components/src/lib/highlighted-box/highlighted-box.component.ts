import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'sg-highlighted-box',
  templateUrl: './highlighted-box.component.html',
  styleUrls: ['./highlighted-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HighlightedBoxComponent {
  @Input() title: string;
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'sg-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionComponent {
  @Input() headerText: string;
}

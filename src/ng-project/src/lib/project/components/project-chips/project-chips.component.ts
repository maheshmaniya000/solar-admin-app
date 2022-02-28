import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'sg-project-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./project-chips.component.scss'],
  template: `
  <mat-chip-list>
    <mat-chip *ngIf="freetrial" color="primary" selected="true" selectable="false">
      {{ 'header.freeTrial' | transloco }}
    </mat-chip>
  </mat-chip-list>`
})
export class ProjectChipsComponent {

  @Input() freetrial: boolean;

}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'sg-no-value',
  template: `
    <ng-container *ngIf="muted; else notMuted">
      <sg-muted>{{ 'common.misc.n/a' | transloco }}</sg-muted>
    </ng-container>
    <ng-template #notMuted>
      {{ 'common.misc.n/a' | transloco }}
    </ng-template>`
})
export class NoValueComponent {

  @Input() muted: boolean = false;

}

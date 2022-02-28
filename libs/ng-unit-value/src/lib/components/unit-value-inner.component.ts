import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TranslationDef } from '@solargis/types/translation';

@Component({
  selector: 'sg-unit-value-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="codelistValue; else value">
      <sg-translation [str]="codelistValue"></sg-translation>
    </ng-container>
    <ng-template #value>{{ unitValue }}</ng-template>`
})
export class UnitValueInnerComponent {

  @Input() codelistValue?: TranslationDef;
  @Input() unitValue?: string | null;

}

import { Component } from '@angular/core';

@Component({
  selector: 'sg-muted',
  template: `
    <div class="mat-card-subtitle">
      <ng-content></ng-content>
    </div>
  `,
  // we need color only
  styles: [`
    .mat-card-subtitle {
      display: inline;
      margin-bottom: inherit;
      padding: 0px 4px;
    }
  `]
})
export class MutedComponent {

}

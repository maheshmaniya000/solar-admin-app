import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import { Route } from '@angular/router';

import { routes } from '../../detail.routes';

@Component({
  selector: 'sg-prospect-detail-heading',
  template: `
    <ng-container *ngIf="parentRoute">
      {{ parentRoute.data.name | transloco}}:
    </ng-container>
    <ng-container *ngIf="route">
      {{ route.data.name | transloco }}
    </ng-container>
  `,
})
export class ProspectDetailHeadingComponent implements OnChanges {
  @Input() path: string;

  route: Route;
  parentRoute: Route;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.path) {
      this.route = routes.find(item => item.path === this.path);
      this.parentRoute = null;

      if (this.route) {
        if (this.route.data.parentPath) {
          this.parentRoute = routes.find(item => item.path === this.route.data.parentPath);
        }
      }
    }
  }
}

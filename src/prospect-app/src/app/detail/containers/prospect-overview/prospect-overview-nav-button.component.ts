import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

import { routes } from '../../detail.routes';
import { DetailRouteService } from '../../services/detail-route.service';


/**
 * This component exists to avoid circular dependency between
 * detail.routes and ProspectOverviewComponent.
 *
 * It is not possible to import routes into component specified in routing.
 */
@Component({
  selector: 'sg-prospect-overview-nav-button',
  template: `<button mat-button color="accent" (click)="onSelect.emit(path)" [disabled]="(isAllowed$ | async) === false">
    {{ translationStr | transloco }}
  </button>`,
  styleUrls: ['./prospect-overview-nav-button.component.scss']
})
export class ProspectOverviewNavButtonComponent implements OnInit {
  @Input() translationStr: string;
  @Input() path: string;

  @Output() onSelect = new EventEmitter<string>();

  isAllowed$: Observable<boolean>;

  constructor(private readonly service: DetailRouteService) {}

  ngOnInit(): void {
    const route = routes.find(r => r.path === this.path);
    this.isAllowed$ = this.service.isRouteAllowed(route);
  }
}

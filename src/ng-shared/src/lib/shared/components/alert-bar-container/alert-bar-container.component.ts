import { Component, Input, OnInit } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { CloseAlerts } from 'ng-shared/core/actions/alerts.actions';
import { State } from 'ng-shared/core/reducers';
import { selectAlerts } from 'ng-shared/core/selectors/alerts.selector';
import { Alert, AlertRoute } from 'ng-shared/core/types';

@Component({
  selector: 'sg-alert-bar-container',
  templateUrl: './alert-bar-container.component.html',
  styleUrls: ['./alert-bar-container.component.scss']
})
export class AlertBarContainerComponent implements OnInit {

  @Input() route: AlertRoute;

  alerts$: Observable<Alert[]>;

  constructor(private readonly store: Store<State>) { }

  ngOnInit(): void {
    this.alerts$ = this.store.pipe(selectAlerts(this.route));
  }

  dispatch(action: Action): void {
    this.store.dispatch(action);
  }

  closeAlert(alert: Alert): void {
    this.store.dispatch(new CloseAlerts([alert]));
  }
}

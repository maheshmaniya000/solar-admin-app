import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { State } from 'ng-shared/user/reducers';
import { isUserLoading, selectIsUserLogged } from 'ng-shared/user/selectors/auth.selectors';


@Component({
  selector: 'sg-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends SubscriptionAutoCloseComponent implements OnInit {
  isLoading$: Observable<boolean>;

  constructor(
    private readonly store: Store<State>,
    private readonly router: Router,
  ) { super(); }

  ngOnInit(): void {
    this.isLoading$ = this.store.pipe(isUserLoading);

    this.addSubscription(
      combineLatest(
        this.store.pipe(selectIsUserLogged),
        this.store.pipe(isUserLoading)
      ).subscribe(([isLogged, isLoading]) => {
        if (!isLoading) {
          if (isLogged) {
            this.router.navigate(['/recent']);
          } else {
            this.router.navigate(['/']);
          }
        }
      })
    );
  }
}

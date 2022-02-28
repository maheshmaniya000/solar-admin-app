import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { State } from 'ng-shared/user/reducers';
import { isUserLoading, selectIsUserLogged } from 'ng-shared/user/selectors/auth.selectors';

@Component({
  selector: 'sg-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent extends SubscriptionAutoCloseComponent implements OnInit {

  constructor(
    private readonly store: Store<State>,
    private readonly router: Router
  ) { super(); }

  ngOnInit(): void {
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

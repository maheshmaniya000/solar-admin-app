import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

@Component({
  selector: 'sg-admin-tmy-subscriptions',
  templateUrl: './tmy-subscriptions.component.html',
  styleUrls: ['./tmy-subscriptions.component.scss']
})
export class TMYSubscriptionsComponent extends SubscriptionAutoCloseComponent {

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  onCloseClick(): void {
    this.router.navigate(['..'], { relativeTo: this.route});
  }

}

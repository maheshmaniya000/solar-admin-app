import { Directive, OnDestroy } from '@angular/core';
import { Unsubscribable } from 'rxjs';

// TODO rename: this is not auto-closing, but auto removing subscriptions on component destroy
@Directive()
export abstract class SubscriptionAutoCloseComponent implements OnDestroy {

  subscriptions: Unsubscribable[] = [];

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  addSubscription(subscription: Unsubscribable): void {
    this.subscriptions.push(subscription);
  }

}

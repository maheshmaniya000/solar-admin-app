import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, publishReplay, refCount, tap } from 'rxjs/operators';

import { TranslationDef } from '@solargis/types/translation';
import { AppSubscriptionType, Company, ProspectSubscription } from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { State } from 'ng-shared/user/reducers';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';
import { getAppSubscription } from 'ng-shared/user/utils/company.utils';

@Component({
  selector: 'sg-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  columns = ['plan', 'userLimit', 'projectLimit', 'from', 'to', 'open'];
  dataSource$: Observable<any>;

  hasData$: Observable<boolean>;

  loading$ = new BehaviorSubject(true);

  constructor(private readonly store: Store<State>) {}

  ngOnInit(): void {
    const companySubscriptions$ = this.store.pipe(selectActiveOrNoCompany).pipe(
      filter((c: Company) => !!c),
      tap(() => this.loading$.next(false)),
      map(c =>
        removeEmpty({
          prospect: getAppSubscription(c, 'prospect'),
          sdat: getAppSubscription(c, 'sdat')
        })
      ),
      publishReplay(),
      refCount()
    );

    this.dataSource$ = companySubscriptions$.pipe(
      map(subsciptions =>
        Object.values(subsciptions).map(subscription => {
          const userLimit = {
            translate: 'companyAdmin.subscription.usersLimit',
            translateParams: { current: subscription.assignedUsers?.length || 0, max: subscription.usersLimit }
          } as TranslationDef;

          const projectLimit =
            subscription.type === AppSubscriptionType.ProspectFreeTrial
              ? ({
                  translate: 'companyAdmin.subscription.projectLimit',
                  translateParams: { remaining: (subscription as ProspectSubscription).remainingProjects }
                } as TranslationDef)
              : { translate: 'companyAdmin.subscription.unlimited' };

          return {
            plan: 'common.subscriptionType.' + subscription.type,
            userLimit,
            projectLimit,
            from: subscription.from,
            to: subscription.to,
            detailUrl: subscription.type.startsWith('SDAT_')
              ? ['sdat-subscription']
              : ['prospect-subscription']
          };
        })
      )
    );

    this.hasData$ = companySubscriptions$.pipe(
      map(x => !!(x.prospect || x.sdat))
    );
  }

}

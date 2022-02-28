import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { Company } from '@solargis/types/user-company';

import { UpdateCompany } from 'ng-shared/user/actions/company.actions';
import { State } from 'ng-shared/user/reducers';
import { selectActiveOrNoCompany } from 'ng-shared/user/selectors/company.selectors';

import { UpdateCompanyApp, UPDATE_COMPANY_APP } from '../actions/company-app.actions';
import { CompanyAppService } from '../services/company-app.service';

@Injectable()
export class CompanyAppEffects {

  @Effect()
  updateCompanyApp$ = this.actions$.pipe(
    ofType<UpdateCompanyApp>(UPDATE_COMPANY_APP),
    withLatestFrom(this.store.pipe(selectActiveOrNoCompany), (action, company) => [action, company]),
    filter(([, company]) => !!company),
    switchMap(([action, company]: [UpdateCompanyApp, Company]) =>
      this.companyAppService.updateAppSubscription(company.sgCompanyId, action.app, action.update)
    ),
    map(company => new UpdateCompany(company))
  );

  constructor(
    private readonly actions$: Actions,
    private readonly companyAppService: CompanyAppService,
    private readonly store: Store<State>
  ) {}
}

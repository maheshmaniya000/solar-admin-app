import { Action } from '@ngrx/store';

import { AppSubscription, SolargisApp } from '@solargis/types/user-company';

export const UPDATE_COMPANY_APP = '[company-app] update';

export class UpdateCompanyApp implements Action {
  readonly type = UPDATE_COMPANY_APP;
  constructor(public app: SolargisApp, public update: Pick<AppSubscription, 'assignedUsers'>) {}
}

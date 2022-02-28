import { createSelector, select } from '@ngrx/store';
import * as jwt_decode from 'jwt-decode';
import { OperatorFunction, pipe } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';

import {
  CompanyTokenContent,
  CompanyWithToken,
  isProspectSubscriptionExpired,
  ProspectLicense,
  ProspectLicenseType
} from '@solargis/types/user-company';

import { State } from '../reducers';
import { CompanyState } from '../types';
import { getAppSubscription } from '../utils/company.utils';


const companyStateSelector = createSelector((state: State) => state.user.company, company => company);

const activeCompanySelector = createSelector(
  (state: State) => state.user.company,
  state => {
    if (state && state.selected && state.listLoaded) {
      return state.list.get(state.selected);
    } else { return null; };
  }
);

export const selectIsCompanyListLoaded = pipe(
  select(companyStateSelector),
  map(state => state.listLoaded),
  distinctUntilChanged()
);

export const selectActiveOrNoCompany = pipe(
  select(activeCompanySelector),
  map((cwt: CompanyWithToken) => cwt?.company),
);

/**
 * @deprecated does not reflect user logout, use selectActiveOrNoCompany instead
 */
export const selectActiveCompany = pipe(
  select(activeCompanySelector),
  filter((cwt: CompanyWithToken) => !!cwt), // there may be no company
  map((cwt: CompanyWithToken) => cwt?.company),
  distinctUntilChanged()
);

export const selectActiveCompanyToken = pipe(
  select(activeCompanySelector),
  // null to avoid deadlock
  map((cwt: CompanyWithToken) => cwt?.token)
);

export const activeCompanyTokenContentSelector = createSelector(
  activeCompanySelector,
  cwt => cwt ? jwt_decode(cwt.token) as CompanyTokenContent : null
);

export const selectActiveCompanyTokenExpiration = pipe(
  select(activeCompanyTokenContentSelector),
  map(ct => ct ? ct.exp * 1000 : null),
);

export const selectActiveCompanyTokenProspectLicense = pipe(
  select(activeCompanyTokenContentSelector),
  map((ct: CompanyTokenContent) => ct && ct.prospectLicense)
);

export const selectIsFreetrialActive = pipe(
  selectActiveCompanyTokenProspectLicense,
  map(license => license && license.licenseType === ProspectLicenseType.FreeTrial)
);

/*
 * @deprecated - we don't need to select specific license to hook specific logic to it,
 * we have dataset-assess-service to serve actual allowed data layers
 */
export const selectIsProLicenceActive = pipe(
  selectActiveCompanyTokenProspectLicense,
  map(license => license && license.licenseType === ProspectLicenseType.Pro)
);

const isFreetrialToClaim = (license): boolean => license
  && license.licenseType === ProspectLicenseType.FreeTrial
  && license.remainingFreeTrialProjects > 0;

export const selectIsFreetrialToClaim = pipe(
  selectActiveCompanyTokenProspectLicense,
  map(license => isFreetrialToClaim(license))
);

export const selectIsFreetrialToClaimAndLicenseNotExpired = pipe(
  selectActiveCompanyTokenProspectLicense,
  map(license => isFreetrialToClaim(license) && !isProspectSubscriptionExpired(license as ProspectLicense))
);

export const selectCompanyList = pipe(
  select(companyStateSelector),
  map((state: CompanyState) => state.list.toArray()),
  shareReplay()
);

export const selectHasSelectedCompany = pipe(
  select(companyStateSelector),
  map((state: CompanyState) => !!state.selected),
  shareReplay()
);

export const selectHasAnyCompany = pipe(
  selectCompanyList,
  map((companies: CompanyWithToken[]) => companies && !!companies.length)
);

export const selectHasAppSubscription = (app: 'prospect' | 'sdat'): OperatorFunction<State, boolean> =>
  pipe(
    select(activeCompanySelector),
    map((cwt: CompanyWithToken) => cwt?.company),
    map(company => company ? !!getAppSubscription(company, app) : false)
  );

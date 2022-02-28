import { Action } from '@ngrx/store';

import { CompanyInvitationDetail, CompanyWithToken } from '@solargis/types/user-company';

import { CompanyWelcomeDialogOptions } from '../components/company-welcome-dialog/company-welcome-dialog.component';
import { CompanyId } from '../types';

export const RELOAD_COMPANY = '[company] reload company';
export const RELOAD_COMPANY_LIST = '[company] reload list';
export const STORE_COMPANY_LIST = '[company] store list';
export const UNSELECT_COMPANY = '[company] unselect';
export const SELECT_COMPANY = '[company] select';
export const UPDATE_COMPANY = '[company] update company';
export const NEW_COMPANY = '[company] new';
export const ACCEPT_COMPANY_INVITATION = '[company] accept invitation';

export class ReloadCompany implements Action {
  readonly type = RELOAD_COMPANY;
  constructor(public payload: CompanyId) {}
}

export class ReloadCompanyList implements Action {
  readonly type = RELOAD_COMPANY_LIST;
}

export class StoreCompanyList implements Action {
  readonly type = STORE_COMPANY_LIST;
  // Added option to select companyId to secure atomicity of reload and selecting a company
  constructor(public payload: CompanyWithToken[], public selectCompanyId?: CompanyId) {}
}

export class SelectCompany implements Action {
  readonly type = SELECT_COMPANY;
  constructor(public payload: CompanyId, public opts?: { skipCartClear?: boolean; skipSaveOnBackend?: boolean }) {}
}

export class UnselectCompany implements Action {
  readonly type = UNSELECT_COMPANY;
  constructor(public opts?: { skipSaveOnBackend?: boolean }) {}
}

export class NewCompany implements Action {
  readonly type = NEW_COMPANY;
  constructor(public payload: CompanyWithToken, public showConfirmation = false, public dialogOptions?: CompanyWelcomeDialogOptions, ) {}
}

export class UpdateCompany implements Action {
  readonly type = UPDATE_COMPANY;
  constructor(public payload: CompanyWithToken) {}
}

export class AcceptCompanyInvitation implements Action {
  readonly type = ACCEPT_COMPANY_INVITATION;
  constructor(public payload: CompanyInvitationDetail, public showConfirmation = false) {}
}

export type CompanyActions =
  UnselectCompany
  | SelectCompany
  | ReloadCompany
  | ReloadCompanyList
  | StoreCompanyList
  | UpdateCompany
  | NewCompany
  | AcceptCompanyInvitation;

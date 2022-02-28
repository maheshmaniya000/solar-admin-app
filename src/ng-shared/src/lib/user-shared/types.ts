import { Country, State } from '@solargis/types/user-company';

export type BillingForm = {
  name: string;
  street: string;
  city: string;
  zipCode: string;
  country: Country;
  state: State;
  phoneCode: any;
  phone: any;
  VAT?: string;
};

export type FreeTrialForm = {
  phoneCode: Country;
  phone: string;
  result?: any;
};

import { CaptchaResult } from '@solargis/types/captcha';
import { CompanyWithToken, TableViewSettings, User } from '@solargis/types/user-company';
import { OrderedMap } from '@solargis/types/utils';

/**
 * Entity which contains data to register new user
 */
export type NewUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  captcha: CaptchaResult;
};

/**
 * When registration process has finished (OK, error, ...) - this type describe result
 */
export type RegistrationResult = {
  /**
   * True if registration has been successful
   */
  status: boolean;

  /**
   * Translated message which can be displayed to user
   */
  messageCode: string;
};

/**
 * Tokens returned by auth0 login process - required to perform protected backend calls
 */
 export type Tokens = {
  idToken: string;
  sgRefreshToken: string;
  expiration: number;
};

/**
 * Result of login process
 */
export type LoginResult = {
  tokens: Tokens;
};

/**
 * Type used in config for Recaptcha configuration
 */
export type RecaptchaOptions = {
  publicKey: string;
  secretKey: string;
  androidPublicKey?: string;
  androidSecretKey?: string;
};

/**
 * Type used in config for FUP
 */
export type FUPOpts = {
  level: string;
};

/**
 * emailVerify - when user verify his email (after registration) - here is saved result
 * tokens - all tokens which has been returned after successful login process
 * changePasswordToken - token which is used to change password
 */
 export type Auth0State = {
  emailVerify: boolean;
  tokens: Tokens;
  changePasswordToken: string;
  loading: boolean;
};

/**
 * Authorization metadata supplied by Auth0 Authorization extension rule
 */
 export type Authorization = {
  groups: string[];
  roles: string[];
  permissions: string[];
};

/**
 * Everything related to current logged user should be here.
 */
 export type UserState = {
  sgAccountId: string;
  email: string;
  authorization?: Authorization;
  sg1LoginSG2TermsConfirmed: boolean;
};

export type CompanyId = string;

export type CompanyState = {
  selected: CompanyId; // sgCompanyId
  listLoaded: boolean;
  list: OrderedMap<CompanyWithToken>;
};

/**
 * NgRx state for Auth
 */
export type UserModuleState = {
  auth0: Auth0State; // auth0 specific properties
  user: UserState; // current logged user in application (result from auth0)
  userData: User; // user data (from our DB)
  company: CompanyState;
};

export type AuthDialogOptions = {
  disableEmailEdit?: boolean;
  disableCompanyCreation?: boolean;
  disableDialogSwitch?: boolean;
  companyInvitationTokenId?: string;
  showTermsAndConditions?: boolean;
};

export type CompanyListItem = Partial<CompanyWithToken>;

export type RegistrationForm = {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  password: string;
  passwordConfirm: string;
};

export type TableView = {
  [key: string]: TableViewSettings;
};

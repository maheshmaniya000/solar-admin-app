import { Observable } from 'rxjs';

export interface DialogAction<T = any> {
  dismissing: boolean;
  textTranslationKey: string;
  payload: T;
  disabled?: boolean;
  dataTest: string;
}

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays
type TypesToDialogActions<Types extends any[]> = { [K in keyof Types]: DialogAction<Types[K]> };

export type DialogActions<PayloadTypes extends any[] = any[]> =
  | TypesToDialogActions<PayloadTypes>
  | Observable<TypesToDialogActions<PayloadTypes>>;

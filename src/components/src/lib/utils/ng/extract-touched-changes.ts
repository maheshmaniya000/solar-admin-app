import { AbstractControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

type ArgumentsType<F> = F extends (...args: infer A) => any ? A : never;
type ObjectLike<O, P extends keyof O = keyof O> = Pick<O, P>;

export function extractTouchedChanges(
  control: ObjectLike<AbstractControl, 'markAsTouched' | 'markAsUntouched'>
): Observable<boolean> {
  const touchedChanges$ = new Subject<boolean>();

  const overrideMarkAs = <T>(
    touched: boolean,
    originalFn: (...args: ArgumentsType<T>) => any
  ) => (...args: ArgumentsType<T>) => {
    originalFn.bind(control)(...args);
    touchedChanges$.next(touched);
  };

  control.markAsTouched = overrideMarkAs<AbstractControl['markAsTouched']>(
    true,
    control.markAsTouched
  );
  control.markAsUntouched = overrideMarkAs<AbstractControl['markAsUntouched']>(
    false,
    control.markAsUntouched
  );

  return touchedChanges$;
}

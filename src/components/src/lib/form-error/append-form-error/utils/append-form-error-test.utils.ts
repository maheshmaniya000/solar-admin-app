import { ElementRef, Type } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { SpectatorDirective } from '@ngneat/spectator/jest';
import { isEmpty } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AppendFormErrorDirective } from '../append-form-error.directive';

export class AppendFormErrorTestUtils {
  static readonly asyncRequired: (
    delayInMilliseconds: number
  ) => AsyncValidatorFn =
    (delayInMilliseconds: number) =>
    (control: AbstractControl): Observable<ValidationErrors> =>
      isEmpty(control.value)
        ? of({ required: true }).pipe(delay(delayInMilliseconds))
        : of(null);

  static expectDirectiveToBePresentOn<D extends AppendFormErrorDirective>(
    element: Element,
    type: Type<D>,
    spectator: SpectatorDirective<AppendFormErrorDirective>
  ): void {
    const appendFormErrorDirectiveElement: Element = spectator.query(type, {
      read: ElementRef
    }).nativeElement;
    expect(appendFormErrorDirectiveElement).toBe(element);
  }
}

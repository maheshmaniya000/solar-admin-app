import { MatHint } from '@angular/material/form-field';
import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator/jest';
import { isNil } from 'lodash-es';
import { MockComponents } from 'ng-mocks';

import { NoHintDirective } from './no-hint.directive';

describe('NoHintDirective', () => {
  describe('unit', () => {
    let directive: NoHintDirective;

    beforeEach(() => {
      directive = new NoHintDirective();
    });

    describe('noHintClassApplied', () => {
      const mockHint = { id: 'some-hint-id', align: 'start' };
      (
        [
          {
            hint: mockHint,
            expectedResult: false
          },
          {
            hint: undefined,
            expectedResult: true
          }
        ] as {
          hint: MatHint;
          expectedResult: boolean;
        }[]
      ).forEach(({ hint, expectedResult }) =>
        it(`should return ${expectedResult} when hint is ${isNil(hint) ? 'undefined' : 'defined'}`, () => {
          directive.hint = hint;
          expect(directive.noHintClassApplied).toBe(expectedResult);
        })
      );
    });

    describe('component', () => {
      const createDirective = createDirectiveFactory({
        directive: NoHintDirective,
        declarations: [MockComponents(MatHint)],
        shallow: true
      });
      let spectator: SpectatorDirective<NoHintDirective>;

      it(`should match snapshot with no-hint class that indicates the form
 field does not contain hint when it really does not contain any mat-hint element`, () => {
        spectator = createDirective(`
            <mat-form-field></mat-form-field>
          `);
        expect(spectator.fixture).toMatchSnapshot();
      });

      it(`should match snapshot without no-hint class when the form really
 contains a mat-hint element`, () => {
        spectator = createDirective(`
            <mat-form-field>
              <mat-hint></mat-hint>
            </mat-form-field>
          `);
        expect(spectator.fixture).toMatchSnapshot();
      });
    });
  });
});

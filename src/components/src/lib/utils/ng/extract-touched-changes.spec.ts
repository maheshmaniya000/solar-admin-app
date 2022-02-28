import { FormControl } from '@angular/forms';

import { runMarbleTest } from '../test';
import { extractTouchedChanges } from './extract-touched-changes';

describe('extractTouchedChanges', () => {
  describe('should create observable', () => {
    let control: FormControl;

    beforeEach(() => {
      control = new FormControl();
    });

    it('and not emit when markAsTouched | markAsUntouched was not called', () => {
      runMarbleTest(extractTouchedChanges(control), {
        marbles: 'a-',
        fn: () => {
          control.setValue('test');
          control.markAsDirty();
          control.markAsPristine();
        }
      }).andExpectToEmit('-');
    });

    it('and emit when markAsTouched | markAsUntouched was called', () => {
      runMarbleTest(
        extractTouchedChanges(control),
        { marbles: 'T--T-', fn: () => control.markAsTouched() },
        { marbles: '-F---F-', fn: () => control.markAsUntouched() }
      ).andExpectToEmit('TF-T-F-', { T: true, F: false });
    });
  });
});

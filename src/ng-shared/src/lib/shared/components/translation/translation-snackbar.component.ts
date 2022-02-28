import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { TranslationDef } from '@solargis/types/translation';

@Component({
  selector: 'sg-translation-snackbar',
  template: `<span [sgTranslation]="data"></span>`
})
export class TranslationSnackbarComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: TranslationDef) {}

}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

import { TranslationComponent } from './components/translation.component';
import { TranslationDirective } from './directives/translation.directive';

const DECLARATIONS = [TranslationComponent, TranslationDirective];

@NgModule({
	imports: [CommonModule, TranslocoModule],
	declarations: [...DECLARATIONS],
	exports: [...DECLARATIONS]
})
export class TranslationModule {
}

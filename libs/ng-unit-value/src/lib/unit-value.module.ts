import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

import { TranslationModule } from '@solargis/ng-translation';

import { UnitLabelComponent } from './components/unit-label.component';
import { UnitToggleLabelComponent } from './components/unit-toggle/unit-toggle-label.component';
import { UnitToggleValueComponent } from './components/unit-toggle/unit-toggle-value.component';
import { UnitToggleComponent } from './components/unit-toggle/unit-toggle.component';
import { UnitValueInnerComponent } from './components/unit-value-inner.component';
import { UnitValueComponent } from './components/unit-value.component';
import { UnitValuePipe } from './pipes/unit-value.pipe';

const DECLARATIONS = [
  UnitLabelComponent,
  UnitToggleComponent,
  UnitToggleLabelComponent,
  UnitToggleValueComponent,
  UnitValueComponent,
  UnitValuePipe
];

@NgModule({
	imports: [
	  CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
		TranslationModule
	],
  declarations: [...DECLARATIONS, UnitValueInnerComponent],
  exports: [...DECLARATIONS]
})
export class UnitValueModule {

}

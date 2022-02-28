import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { RangeIndicatorComponent } from './range-indicator.component';

@NgModule({
  declarations: [RangeIndicatorComponent],
  imports: [CommonModule, SgDefaultsModule],
  exports: [RangeIndicatorComponent]
})
export class RangeIndicatorModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { MegaButtonComponent } from './mega-button.component';

@NgModule({
  declarations: [MegaButtonComponent],
  imports: [CommonModule, MatButtonModule],
  exports: [MegaButtonComponent]
})
export class MegaButtonModule {}

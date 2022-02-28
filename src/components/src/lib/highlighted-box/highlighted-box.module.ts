import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HighlightedBoxComponent } from './highlighted-box.component';

@NgModule({
  declarations: [HighlightedBoxComponent],
  imports: [CommonModule],
  exports: [HighlightedBoxComponent]
})
export class HighlightedBoxModule {}

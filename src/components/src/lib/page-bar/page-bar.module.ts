import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PageBarComponent } from './page-bar.component';

@NgModule({
  declarations: [PageBarComponent],
  imports: [CommonModule],
  exports: [PageBarComponent]
})
export class PageBarModule {}

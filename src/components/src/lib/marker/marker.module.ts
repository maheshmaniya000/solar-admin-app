import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { IconMarkerComponent } from './icon-marker/icon-marker.component';
import { TextMarkerComponent } from './text-marker/text-marker.component';

@NgModule({
  declarations: [IconMarkerComponent, TextMarkerComponent],
  exports: [IconMarkerComponent, TextMarkerComponent],
  imports: [MatIconModule, CommonModule]
})
export class MarkerModule {}

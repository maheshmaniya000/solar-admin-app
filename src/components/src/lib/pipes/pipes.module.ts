import { NgModule } from '@angular/core';

import { SgCardinalCoordPipe } from './cardinal-coord/cardinal-coord.pipe';
import { TildePipe } from './tilde/tilde.pipe';

@NgModule({
  declarations: [SgCardinalCoordPipe, TildePipe],
  exports: [SgCardinalCoordPipe, TildePipe]
})
export class SgPipesModule {}

import { NgModule } from '@angular/core';

import { AnimationDisablerDirective } from './animation-disabler.directive';

@NgModule({
  declarations: [AnimationDisablerDirective],
  exports: [AnimationDisablerDirective]
})
export class AnimationDisablerModule {}

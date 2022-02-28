import { NgModule } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';

import { AnimationDisablerModule } from '../animation-disabler/animation-disabler.module';
import { StepControlTouchedMarkerDirective } from './step-control-touched-marker.directive';

@NgModule({
  declarations: [StepControlTouchedMarkerDirective],
  exports: [
    StepControlTouchedMarkerDirective,
    AnimationDisablerModule,
    MatStepperModule
  ]
})
export class StepperModule {}

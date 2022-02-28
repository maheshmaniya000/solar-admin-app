import { Directive, HostBinding } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-horizontal-stepper, mat-tab-group'
})
export class AnimationDisablerDirective {
  @HostBinding('@.disabled') private readonly animationsDisabled = true;
}

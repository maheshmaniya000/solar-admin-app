import { Directive, HostListener } from '@angular/core';
import { MatStep } from '@angular/material/stepper';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[matStepperNext]'
})
export class StepControlTouchedMarkerDirective {
  constructor(private readonly step: MatStep) {}

  @HostListener('click') onClick(): void {
    this.step.stepControl?.markAllAsTouched();
  }
}

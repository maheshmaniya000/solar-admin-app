import { AbstractControl } from '@angular/forms';
import {
  MatStep,
  MatStepperNext,
  MatStepperPrevious
} from '@angular/material/stepper';
import {
  createDirectiveFactory,
  SpectatorDirective
} from '@ngneat/spectator/jest';
import { MockDirectives } from 'ng-mocks';

import { StepControlTouchedMarkerDirective } from './step-control-touched-marker.directive';

describe('TouchedMarkerDirective', () => {
  describe('unit', () => {
    const stepControl: Partial<AbstractControl> = {
      markAllAsTouched: jest.fn()
    };
    const step: Partial<MatStep> = {
      stepControl: stepControl as AbstractControl
    };
    const directive = new StepControlTouchedMarkerDirective(step as MatStep);

    describe('onClick', () => {
      it(`should call markAllAsTouched method of step control of the step`, () => {
        directive.onClick();
        expect(stepControl.markAllAsTouched).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('component', () => {
    const createDirective = createDirectiveFactory({
      directive: StepControlTouchedMarkerDirective,
      declarations: [MockDirectives(MatStepperPrevious, MatStepperNext)],
      directiveMocks: [MatStep],
      shallow: true
    });
    let spectator: SpectatorDirective<StepControlTouchedMarkerDirective>;

    beforeEach(() => {
      spectator = createDirective(`
        <button matStepperPrevious></button>
        <button matStepperNext></button>
      `);
    });

    describe('binding', () => {
      it('should bind directive to element with matStepperNext directive', () => {
        expect(
          spectator.query(MatStepperNext, {
            read: StepControlTouchedMarkerDirective
          })
        ).toExist();
      });

      it('should not bind directive to element with matStepperPrevious directive', () => {
        expect(() =>
          spectator.query(MatStepperPrevious, {
            read: StepControlTouchedMarkerDirective
          })
        ).toThrow();
      });
    });
  });
});

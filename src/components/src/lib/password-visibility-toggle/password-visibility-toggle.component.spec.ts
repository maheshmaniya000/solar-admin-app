import { Component, ViewChild } from '@angular/core';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MockDirective } from 'ng-mocks';

import { PasswordVisibilityToggleComponent } from './password-visibility-toggle.component';

import spyOn = jest.spyOn;
import Mock = jest.Mock;

describe('PasswordVisibilityToggleComponent', () => {
  describe('unit', () => {
    let component: PasswordVisibilityToggleComponent;
    let querySelectorMock: Mock;
    let matFormFieldStub: Partial<MatFormField>;

    const setupTest = (matFormField: Partial<MatFormField>): void => {
      component = new PasswordVisibilityToggleComponent(
        matFormField as MatFormField
      );
      component.ngOnInit();
    };

    beforeEach(() => {
      querySelectorMock = jest.fn();
      matFormFieldStub = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _elementRef: {
          nativeElement: {
            querySelector: querySelectorMock
          }
        }
      };
    });

    describe('ngOnInit', () => {
      it('should throw an error when MatFormField does not contain input', () => {
        querySelectorMock.mockReturnValue(undefined);
        expect(() => setupTest(matFormFieldStub)).toThrow(/input/);
      });

      [
        { type: 'password', expectedIcon: 'visibility_off' },
        { type: 'text', expectedIcon: 'visibility' }
      ].forEach(({ type, expectedIcon }) =>
        it(`should set icon to '${expectedIcon}' when input type is '${type}'`, () => {
          querySelectorMock.mockReturnValue({ type });
          setupTest(matFormFieldStub);
          expect(component.icon).toBe(expectedIcon);
        })
      );
    });

    describe('onToggle', () => {
      let inputStub: Partial<HTMLInputElement>;

      beforeEach(() => {
        inputStub = { type: 'password' };
        querySelectorMock.mockReturnValue(inputStub);
        setupTest(matFormFieldStub);
      });

      it('should toggle input type', () => {
        component.onToggle();
        expect(inputStub.type).toBe('text');
        component.onToggle();
        expect(inputStub.type).toBe('password');
      });

      it('should toggle icon', () => {
        component.onToggle();
        expect(component.icon).toBe('visibility');
        component.onToggle();
        expect(component.icon).toBe('visibility_off');
      });
    });
  });

  describe('component', () => {
    @Component({
      selector: 'sg-test',
      template: `
        <mat-form-field>
          <input matInput type="password" />
          <sg-password-visibility-toggle matSuffix>
          </sg-password-visibility-toggle>
        </mat-form-field>
      `
    })
    class TestComponent {
      @ViewChild(PasswordVisibilityToggleComponent)
      passwordVisibilityComponent: PasswordVisibilityToggleComponent;
    }

    let spectator: Spectator<TestComponent>;

    const createComponent = createComponentFactory({
      component: TestComponent,
      declarations: [
        PasswordVisibilityToggleComponent,
        MatFormField,
        MatInput,
        MockDirective(MatSuffix)
      ],
      shallow: true
    });

    beforeEach(() => {
      spectator = createComponent();
    });

    it('should match snapshot and have bound all properties and methods', () => {
      const onToggleSpy = spyOn(
        spectator.component.passwordVisibilityComponent,
        'onToggle'
      );
      spectator.click('sg-password-visibility-toggle button');
      expect(onToggleSpy).toHaveBeenCalledTimes(1);

      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});

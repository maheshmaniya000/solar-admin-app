import { FormBuilder } from '@angular/forms';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

import { Timezone } from '../models/timezone.model';
import { TimezoneInputComponent } from './timezone-input.component';

import spyOn = jest.spyOn;
import SpyInstance = jest.SpyInstance;

describe('TimezoneInputComponent', () => {
  describe('unit', () => {
    interface TimezoneForm {
      timezone: Timezone;
      utcOffset: number;
    }

    let component: TimezoneInputComponent;
    let updateValueAndValiditySpy: SpyInstance;

    beforeEach(() => {
      component = new TimezoneInputComponent();
      component.form = new FormBuilder().group({
        ...TimezoneInputComponent.createControlConfigs()
      });
      component.timezone = Timezone.site;
      component.utcOffset = 4;
      updateValueAndValiditySpy = spyOn(
        component.form,
        'updateValueAndValidity'
      );
      component.ngOnInit();
    });

    const patchForm = (formValue: TimezoneForm): void => {
      component.form.patchValue(formValue);
    };

    describe('ngOnInit', () => {
      it('should update form value and validity upon initialization', () => {
        expect(updateValueAndValiditySpy).toHaveBeenCalledTimes(2);
      });
    });

    describe('form', () => {
      it('should contain disabled utc offset form control when timezone = site', () => {
        patchForm({
          timezone: Timezone.site,
          utcOffset: 4
        });
        expect(component.form.get('utcOffset').disabled).toBe(true);
      });

      it('should contain enabled utc offset form control when timezone = utc', () => {
        patchForm({
          timezone: Timezone.utc,
          utcOffset: 12
        });
        expect(component.form.get('utcOffset')).toEqual(
          expect.objectContaining({
            disabled: false,
            value: 12
          })
        );
      });

      it('utc offset should be set to 4 (initial value) when switched to site timezone', () => {
        patchForm({
          timezone: Timezone.utc,
          utcOffset: 12
        });
        component.form.get('timezone').setValue(Timezone.site);
        expect(component.form.get('utcOffset')).toEqual(
          expect.objectContaining({
            disabled: true,
            value: 4
          })
        );
      });
    });

    describe('ngOnChanges', () => {
      it('should contain disabled utc offset form control when timezone = site', () => {
        component.timezone = Timezone.site;
        component.ngOnChanges();
        expect(component.form.get('utcOffset').disabled).toBe(true);
      });

      it('should contain enabled utc offset form control when timezone = utc', () => {
        component.timezone = Timezone.utc;
        component.ngOnChanges();
        expect(component.form.get('utcOffset')).toEqual(
          expect.objectContaining({
            disabled: false,
            value: 4
          })
        );
      });

      it('utc offset should be set to 4 (initial value) when switched to site timezone', () => {
        patchForm({
          timezone: Timezone.utc,
          utcOffset: 12
        });
        component.timezone = Timezone.site;
        component.ngOnChanges();
        expect(component.form.get('utcOffset')).toEqual(
          expect.objectContaining({
            disabled: true,
            value: 4
          })
        );
      });
    });
  });

  describe('component', () => {
    const createComponent = createComponentFactory({
      component: TimezoneInputComponent,
      shallow: true
    });
    let spectator: Spectator<TimezoneInputComponent>;

    beforeEach(() => {
      spectator = createComponent({
        props: {
          form: new FormBuilder().group({
            ...TimezoneInputComponent.createControlConfigs()
          }),
          timezone: Timezone.site,
          utcOffset: 4
        }
      });
    });

    it('should match snapshot', () => {
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});

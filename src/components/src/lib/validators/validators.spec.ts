import { fakeAsync, tick } from '@angular/core/testing';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';

import { SgValidators } from './validators';

describe('SgValidators', () => {
  describe('latLngFormat', () => {
    const invalidValues = [
      '40.32569798',
      '40.32569798,',
      '40.',
      '40.32569798,78.',
      'asdads',
      '40.32569798,d55446',
      '40s.32569798,55',
      '40.32569798,55$',
      '40.325a9798,45',
      '40.325$9798,45',
      '40,3259798,45,455',
      '40.325 9798,45.455',
      '40e259798,45',
      '40,45 ',
      '4 0,45 ',
      ' 40,45 ',
      '-91.4554,54.45454',
      '-90.00001,54.45454',
      '90.00001,54.45454',
      '91.4554,54.45454',
      '89.4554,181.45454',
      '89.4554,-181.45454',
      '89.4554,180.000001',
      '89.4554,-180.000001',
      '4444,453445',
      '-4444,-453445'
    ];
    const validValues = [
      undefined,
      null,
      '',
      '40.32569798,133.12837176',
      '3.46063271,164.56101609',
      '64.77027823,117.64406124',
      '25.43099446,19.30072771',
      '-18.42421875,-175.10770756',
      '35.22000085,-48.0604971',
      '35.35418317,40.84559172',
      '-19.24317727,-153.75938022',
      '30.94196125,161.29270637',
      '-44.16173779,-73.96227749',
      '46.18075581,-173.76441809',
      '23.11447369,-102.31963735',
      '-21.82767235,-173.84546811',
      '-19.8687984,-61.68510792',
      '12.35367735,47.23786125',
      '7.66543113,20.91818439',
      '24.0378189,137.19928025',
      '40.23141621,-28.87965459',
      '-6.1405458,-105.27093137',
      '-31.90747962,125.34637366',
      '-1.53726655,-38.72873655',
      '-50.70047089,59.0397018',
      '31.06476336,86.84693313',
      '56.94149283,153.67178988',
      '-1.16258848,169.93953628',
      '13.2891055,11.00724362',
      '2.62106013,166.47901942',
      '82.92338312,-142.39011521',
      '37.29622938,146.77376162',
      '-16.75956813,37.78760863',
      '59.03152204,56.42212552',
      '14.97784476,-152.59787739',
      '5.35241813,69.49001001',
      '38.78382995,78.0883073',
      '-58.80514934,98.54153935',
      '4.88193158,69.62015381',
      '47.4506813,-136',
      '-6.92132931,95.36799581',
      '-15.80181841,-10.6134843',
      '3.62933186,-109.51296079',
      '-57.30094325,-63.63891269',
      '-33.30953303,117.4321758',
      '-25,-106',
      '10,-80.35795284',
      '15.24154235,-158.95083765',
      '-12.73943119,-149.34868937',
      '-45.54587924,104.41210806',
      '-25.34925942,57',
      '42.23505372,139.95356118',
      '-0.64277793,-17.51035197',
      '0,0',
      '-0,0',
      '0,-0',
      '-0,-0',
      '90,0',
      '-90,0',
      '0,180',
      '0,-180',
      '90,180',
      '-90,180',
      '90,-180',
      '-90,-180'
    ];

    it(`should not return 'latLngFormat' validation error`, () => {
      validValues.forEach(value => {
        expect(SgValidators.latLngFormat(new FormControl(value))).toBeNull();
      });
    });

    it(`should return 'latLngFormat' validation error`, () => {
      invalidValues.forEach(value => {
        expect(SgValidators.latLngFormat(new FormControl(value))).toEqual({
          latLngFormat: true
        });
      });
    });
  });

  describe('conditionalValidator', () => {
    it('should use provided validator based on condition$', fakeAsync(() => {
      const condition$ = new Subject<boolean>();
      const formControl = new FormControl(undefined, [
        SgValidators.conditionalValidator(Validators.required, condition$)
      ]);
      tick(1);
      expect(formControl.errors).toEqual({ required: true });

      condition$.next(false);
      tick(1);
      expect(formControl.errors).toBe(null);
    }));
  });

  describe('asyncConditionalValidator', () => {
    it('should use provided validator based on condition$', fakeAsync(() => {
      const condition$ = new Subject<boolean>();
      const testValidator = (): Observable<{ required: boolean }> => of({ required: true }).pipe(delay(1000));
      const formControl = new FormControl(undefined, undefined, [
        SgValidators.asyncConditionalValidator(testValidator, condition$)
      ]);
      expect(formControl.status).toBe('PENDING');
      expect(formControl.errors).toBeNull();
      tick(1000);
      expect(formControl.status).toBe('INVALID');
      expect(formControl.errors).toEqual({ required: true });

      condition$.next(false);
      tick(1);
      expect(formControl.errors).toBeNull();
    }));
  });

  describe('range', () => {
    let fb: FormBuilder;
    let formGroup: FormGroup;

    beforeEach(() => {
      fb = new FormBuilder();
      formGroup = fb.group({
        from: [],
        to: []
      });
    });

    it('should throw when not used with form group', () => {
      expect(() => SgValidators.range(new FormControl())).toThrow();
      expect(() => SgValidators.range(new FormArray([]))).toThrow();
    });

    it(`should throw when form group doesn't contain 'from' or 'to' form control`, () => {
      expect(() => SgValidators.range(fb.group({ to: [] }))).toThrow();
      expect(() => SgValidators.range(fb.group({ from: [] }))).toThrow();
    });

    it(`should return null when from/to value is null`, () => {
      formGroup.patchValue({ from: null, to: null });
      expect(SgValidators.range(formGroup)).toBeNull();

      formGroup.patchValue({ from: 5, to: null });
      expect(SgValidators.range(formGroup)).toBeNull();

      formGroup.patchValue({ from: null, to: 5 });
      expect(SgValidators.range(formGroup)).toBeNull();
    });

    it(`should return null when 'from' is less than or equal as 'to'`, () => {
      formGroup.patchValue({ from: 10, to: 20 });
      expect(SgValidators.range(formGroup)).toBeNull();

      formGroup.patchValue({ from: 20, to: 20 });
      expect(SgValidators.range(formGroup)).toBeNull();
    });

    it(`should return error when 'from' is greater than 'to'`, () => {
      formGroup.patchValue({ from: 21, to: 20 });
      expect(SgValidators.range(formGroup)).toEqual({
        range: true
      });
    });
  });

  describe('maxDateRange', () => {
    const millisecondsInADay = 24 * 60 * 60 * 1000;
    let fb: FormBuilder;
    let formGroup: FormGroup;

    beforeEach(() => {
      fb = new FormBuilder();
      formGroup = fb.group({
        min: [],
        max: []
      });
      jest.useFakeTimers('modern')
          .setSystemTime(Date.UTC(2020, 6, 12, 14));
    });

    afterEach(() => jest.useRealTimers());

    it('should throw when passed max date range in milliseconds param is a negative number', () => {
      expect(() =>
        SgValidators.maxDateRange(-100)(new FormControl())
      ).toThrowErrorMatchingInlineSnapshot(
        `"Maximum date range in milliseconds param has to be a non-negative value."`
      );
    });

    it('should throw when not used with form group', () => {
      expect(() => SgValidators.maxDateRange(100)(new FormControl())).toThrow();
      expect(() => SgValidators.maxDateRange(100)(new FormArray([]))).toThrow();
    });

    it(`should throw when form group doesn't contain 'min' or 'max' form controls`, () => {
      expect(() =>
        SgValidators.maxDateRange(100)(fb.group({ to: [] }))
      ).toThrow();
      expect(() =>
        SgValidators.maxDateRange(100)(fb.group({ from: [] }))
      ).toThrow();
    });


    it(`should return null when min or max dates are null`, () => {
      [
        { min: null, max: null },
        { min: moment(), max: null },
        { min: null, max: moment() }
      ].forEach(({ min, max }) => {
        formGroup.patchValue({ min, max });
        expect(SgValidators.maxDateRange(100)(formGroup)).toBeNull();
      });
    });

    it(`should return null when the difference between min and max dates
 is equal or smaller than passed max date range in milliseconds param value`, () => {
      formGroup.patchValue({ min: moment(), max: moment().add(1, 'days') });
      expect(
        SgValidators.maxDateRange(millisecondsInADay)(formGroup)
      ).toBeNull();
    });

    it(`should return error object when the difference between min and max
 dates is bigger than passed max date range in milliseconds param value`, () => {
      formGroup.patchValue({ min: moment(), max: moment().add(2, 'days') });
      expect(SgValidators.maxDateRange(millisecondsInADay)(formGroup)).toEqual({
        sgMaxDateRange: { maxDateRangeInMilliseconds: millisecondsInADay }
      });
    });
  });

  describe('phoneNumber', () => {
    [undefined, null, '', '    ', '+421948123456', '+421 (948) 123-456'].forEach(value =>
      it(`should return null for ${JSON.stringify(value)}`, () => {
        expect(SgValidators.phoneNumber(new FormControl(value))).toBeNull();
      })
    );

    it('should return `phoneNumberFormat` error for invalid phone number and valid country code', () => {
      expect(SgValidators.phoneNumber(new FormControl('+421'))).toEqual({
        phoneNumberFormat: '+421 912 123 456'
      });
    });

    it('should return `phoneNumber` error for invalid phone number', () => {
      expect(SgValidators.phoneNumber(new FormControl('+42'))).toEqual({
        phoneNumber: true
      });
    });

    it('should return `phoneNumber` error for phone number not in international format', () => {
      expect(SgValidators.phoneNumber(new FormControl('0911 123 456'))).toEqual({
        phoneNumber: true
      });
    });
  });
});


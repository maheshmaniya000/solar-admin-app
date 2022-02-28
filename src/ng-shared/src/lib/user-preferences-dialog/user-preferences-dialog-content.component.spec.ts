import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  createComponentFactory,
  createSpyObject,
  Spectator,
  SpyObject
} from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { Subject } from 'rxjs';

import { flattenDataLayers, resolveDataset } from '@solargis/dataset-core';
import { UnitToggleService } from '@solargis/ng-unit-value';
import { UnitToggleSettings } from '@solargis/units';

import { DialogConstants } from 'components/dialog/dialog.constants';
import { Timezone } from 'components/models/timezone.model';
import { UserPreferences } from 'components/models/user-preferences.model';
import { TimezoneInputComponent } from 'components/timezone-input/timezone-input.component';

import { UnitTogglePlainService } from '../plain-services/unit-toggle-plain.service';
import { UserPreferencesDialogData } from './model/user-preferences-dialog-data.model';
import { UserPreferencesDialogPayload } from './model/user-preferences-dialog-payload.model';
import { UserPreferencesDialogContentComponent } from './user-preferences-dialog-content.component';

describe('UserPreferencesDialogContentComponent', () => {
  const dataset = resolveDataset(
    flattenDataLayers({
      ELE: { name: 'Elevation', unit: 'm' },
      GHI: {
        name: 'Global horizontal irradiation',
        resolution: {
          annual: { access: 'free' },
          monthly: { access: 'prospect:lta:paid' }
        },
        unit: ['kWh/m2', '{{resolution}}']
      },
      TEMP: { name: 'Air temperature', unit: '°C' }
    }),
    { prefix: 'test.dataLayer' }
  );

  const createDialogData = (): UserPreferencesDialogData => ({
    title: 'Dialog title',
    content: UserPreferencesDialogContentComponent,
    actions: DialogConstants.createStandardDialogDefaultActions(),
    userPreferences: { timezone: Timezone.site, utcOffset: 2 },
    unitToggles: UserPreferencesDialogContentComponent.dataLayerMapToUnitToggles(
      dataset.annual
    ),
    unitToggleSettings: { temperature: '°F' }
  });

  describe('unit', () => {
    let unitToggleServiceSpyObject: SpyObject<UnitToggleService>;
    let payload: UserPreferencesDialogPayload;
    let component: UserPreferencesDialogContentComponent;

    const mockSelectUnitToggle$ = new Subject<UnitToggleSettings>();

    beforeEach(() => {
      unitToggleServiceSpyObject = createSpyObject(UnitTogglePlainService);
      unitToggleServiceSpyObject.selectUnitToggle.andReturn(
        mockSelectUnitToggle$
      );

      component = new UserPreferencesDialogContentComponent(
        createDialogData(),
        unitToggleServiceSpyObject
      );
      component.ngOnInit();
      payload = component.data.actions[1].payload;
    });

    describe('dataLayerMapToUnitToggles', () => {
      [undefined, null].forEach(value => {
        it(`should throw if ${value} is provided`, () => {
          expect(() =>
            UserPreferencesDialogContentComponent.dataLayerMapToUnitToggles(value)
          ).toThrow();
        });
      });

      it(`should map dataset's data layers to array of unique unit toggles it contains`, () => {
        expect(
          UserPreferencesDialogContentComponent.dataLayerMapToUnitToggles(
            dataset.annual
          )
        ).toEqual(
          ['length', 'irradiation', 'ltaDaily', 'temperature'].map(
            settingsKey => expect.objectContaining({ settingsKey })
          )
        );
      });
    });

    describe('ngOnInit', () => {
      it('should set initial unit toggle settings from the injected data by dispatching unit toggle payload to UnitToggleService', () => {
        expect(
          unitToggleServiceSpyObject.dispatchUnitToggle
        ).toHaveBeenCalledTimes(1);
        expect(
          unitToggleServiceSpyObject.dispatchUnitToggle
        ).toHaveBeenCalledWith([
          { settingsKey: 'temperature', toggleKey: '°F' }
        ]);
      });

      it('should subscribe to form value changes and save emitted values to the payload', () => {
        const userPreferences: UserPreferences = {
          timezone: Timezone.utc,
          utcOffset: 5
        };
        component.form.patchValue(userPreferences);

        expect(payload.userPreferences).toEqual(userPreferences);
      });

      it('should subscribe to UnitToggleService.selectUnitToggle observable and save emitted unit toggle settings to the payload', () => {
        mockSelectUnitToggle$.next({ length: 'ft' });

        expect(
          unitToggleServiceSpyObject.selectUnitToggle
        ).toHaveBeenCalledTimes(1);
        expect(payload.unitTogglePayload).toEqual([
          { settingsKey: 'length', toggleKey: 'ft' }
        ]);
      });
    });
  });

  describe('component', () => {
    let spectator: Spectator<UserPreferencesDialogContentComponent>;

    const createComponent = createComponentFactory({
      component: UserPreferencesDialogContentComponent,
      declarations: [MockComponent(TimezoneInputComponent)],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: createDialogData() }],
      shallow: true
    });

    beforeEach(() => (spectator = createComponent()));

    it('should match snapshot and have correctly bound methods and attributes', () => {
      const timezoneComponent = spectator.query(TimezoneInputComponent);
      const { timezone, utcOffset } = spectator.component.data.userPreferences;

      expect(timezoneComponent.timezone).toEqual(timezone);
      expect(timezoneComponent.utcOffset).toEqual(utcOffset);
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});

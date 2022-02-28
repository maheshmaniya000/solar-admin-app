import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { uniqBy } from 'lodash-es';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { DataLayerMap } from '@solargis/dataset-core';
import { UnitToggleService } from '@solargis/ng-unit-value';
import { LatLng } from '@solargis/types/site';
import {
  latlngToggle,
  latlngUnit,
  UnitToggle,
  UnitToggleSettings
} from '@solargis/units';

import { TimezoneInputComponent } from 'components/timezone-input/timezone-input.component';
import { isNotEmpty, isNotNil } from 'components/utils';

import { UnitTogglePlainService } from '../plain-services/unit-toggle-plain.service';
import { UnitTogglePayload } from './model/unit-toggle-payload.model';
import { UserPreferencesDialogData } from './model/user-preferences-dialog-data.model';

@Component({
  templateUrl: './user-preferences-dialog-content.component.html',
  styleUrls: ['./user-preferences-dialog-content.component.scss'],
  providers: [{ provide: UnitToggleService, useClass: UnitTogglePlainService }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPreferencesDialogContentComponent implements OnInit, OnDestroy {
  readonly latlngToggle = latlngToggle;
  readonly latlngUnit = latlngUnit;
  readonly latlngSample: LatLng = { lat: 47.10127, lng: 8.027484 };
  readonly unitToggleSettingsKeyToLabel = {
    latlng: 'Latitude and longitude',
    area: 'Area',
    distance: 'Distance',
    installedPower: 'Installed power',
    irradiation: 'Solar radiation',
    length: 'Elevation and length',
    ltaDaily: 'Long-term averages',
    pvoutTotal: 'Total power output',
    temperature: 'Temperature'
  };
  form: FormGroup;

  private readonly destroyed$ = new Subject<void>();

  static dataLayerMapToUnitToggles(dataLayerMap: DataLayerMap): UnitToggle[] {
    return uniqBy(
      dataLayerMap
        .toArray()
        .flatMap(layer => layer.unit.toggle)
        .filter(isNotNil),
      toggle => toggle.settingsKey
    );
  }

  private static unitToggleSettingsToUnitTogglePayload(
    unitToggleSettings: UnitToggleSettings
  ): UnitTogglePayload {
    return Object.entries(unitToggleSettings).map(
      ([settingsKey, toggleKey]) => ({
        settingsKey,
        toggleKey
      })
    ) as UnitTogglePayload;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: UserPreferencesDialogData,
    private readonly unitToggleService: UnitToggleService
  ) {}

  ngOnInit(): void {
    this.data.actions[1].payload = {};
    this.unitToggleService.dispatchUnitToggle(
      UserPreferencesDialogContentComponent.unitToggleSettingsToUnitTogglePayload(
        this.data.unitToggleSettings
      )
    );
    this.createForm();
    this.subscribeToFormValueChanges();
    this.subscribeToUnitToggleSettingsChanges();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  private createForm(): void {
    this.form = new FormBuilder().group({
      ...TimezoneInputComponent.createControlConfigs()
    });
  }

  private subscribeToFormValueChanges(): void {
    this.form.valueChanges
      .pipe(
        filter(() => this.form.valid),
        takeUntil(this.destroyed$)
      )
      .subscribe(
        userPreferences =>
          (this.data.actions[1].payload.userPreferences = userPreferences)
      );
  }

  private subscribeToUnitToggleSettingsChanges(): void {
    this.unitToggleService
      .selectUnitToggle()
      .pipe(
        filter(isNotEmpty),
        map(
          UserPreferencesDialogContentComponent.unitToggleSettingsToUnitTogglePayload
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe(
        unitTogglePayload =>
          (this.data.actions[1].payload.unitTogglePayload = unitTogglePayload)
      );
  }
}

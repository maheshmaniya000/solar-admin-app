import { Component, Inject, InjectionToken, NgModule } from '@angular/core';
import { moduleMetadata, Story } from '@storybook/angular';
import { Observable, of } from 'rxjs';

import {
  DataLayersJson,
  Dataset,
  flattenDataLayers,
  resolveDataset
} from '@solargis/dataset-core';
import { UnitToggleService } from '@solargis/ng-unit-value';

import { DialogStoriesConstants } from '../../../../components/src/lib/dialog/storybook/dialog-stories.constants';
import { Timezone } from '../../../../components/src/lib/models/timezone.model';
import { UserPreferencesDialogService } from './service/user-preferences-dialog.service';
import { UserPreferencesDialogContentComponent } from './user-preferences-dialog-content.component';
import { UserPreferencesDialogModule } from './user-preferences-dialog.module';

const datasetToken = new InjectionToken<Dataset>('Dataset');

const dataLayersJson: DataLayersJson = {
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
};

@Component({
  selector: 'sg-user-preferences-dialog-story',
  template: `
    <button
      mat-flat-button
      color="accent"
      (click)="onOpenUserPreferencesDialogButtonClick()"
      data-test="open-user-preferences-dialog-button"
    >
      Open user preferences
    </button>

    <br /><br />

    <div data-test="payload-container">
      Dialog has closed with this payload: {{ payload$ | async | json }}
    </div>
  `
})
class UserPreferencesDialogStoryComponent {
  payload$: Observable<any>;

  constructor(
    private readonly userPreferencesDialogService: UserPreferencesDialogService,
    @Inject(datasetToken) private readonly dataset: Dataset
  ) {}

  onOpenUserPreferencesDialogButtonClick(): void {
    this.payload$ = this.userPreferencesDialogService.open({
      userPreferences: { timezone: Timezone.site, utcOffset: 2 },
      unitToggles: UserPreferencesDialogContentComponent.dataLayerMapToUnitToggles(
        this.dataset.annual
      ),
      unitToggleSettings: {}
    }).afterClosed();
  }
}

@NgModule({
  declarations: [UserPreferencesDialogStoryComponent],
  imports: [
    ...DialogStoriesConstants.dialogModuleDependencies,
    UserPreferencesDialogModule
  ],
  providers: [
    ...DialogStoriesConstants.dialogProviders,
    {
      provide: datasetToken,
      useValue: resolveDataset(
        flattenDataLayers(dataLayersJson),
        {
          prefix: 'app.dataLayer'
        }
      )
    },
    {
      provide: UnitToggleService,
      useValue: { selectUnitToggle: () => of({}) }
    }
  ],
  exports: [UserPreferencesDialogStoryComponent]
})
class UserPreferencesDialogStoryModule {}

export default {
  title: 'Solargis/Components/User Preferences Dialog',
  decorators: [moduleMetadata({ imports: [UserPreferencesDialogStoryModule] })]
};

export const basic: Story = () => ({
  template: `<sg-user-preferences-dialog-story></sg-user-preferences-dialog-story>`
});

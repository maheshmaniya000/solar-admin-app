import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

import { TranslocoMocks } from 'ng-shared/utils/transloco.mocks';

import { DialogConstants } from '../dialog.constants';
import { SuccessDialogData } from './models/success-dialog-data.model';
import { SuccessDialogContentComponent } from './success-dialog-content.component';

describe('SuccessDialogContentComponent', () => {
  describe('component', () => {
    let spectator: Spectator<SuccessDialogContentComponent>;
    const createComponent = createComponentFactory({
      component: SuccessDialogContentComponent,
      imports: [TranslocoMocks.createTestingModule()],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            imageUrl: 'some-image.jpg',
            headerTranslationKey: 'some.successHeader',
            actions: [DialogConstants.actions.ok]
          } as SuccessDialogData
        }
      ],
      shallow: true
    });

    beforeEach(() => {
      spectator = createComponent();
    });

    it(`should match snapshot without the provided success text`, () => {
      expect(spectator.fixture).toMatchSnapshot();
    });

    it(`should match snapshot with the provided success text`, () => {
      spectator.component.data.textTranslationKey = 'some.successText';
      spectator.detectComponentChanges();
      expect(spectator.fixture).toMatchSnapshot();
    });

    it(`should match snapshot with the provided image alt text`, () => {
      spectator.component.data.imageAltTextTranslationKey = 'some.successAltText';
      spectator.detectComponentChanges();
      expect(spectator.fixture).toMatchSnapshot();
    });
  });
});

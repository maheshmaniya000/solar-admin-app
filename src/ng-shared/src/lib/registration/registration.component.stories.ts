import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { moduleMetadata } from '@storybook/angular';

import { SgDefaultsModule } from 'components/defaults/defaults.module';

import { TranslocoRootModule } from '../core/transloco-root.module';
import { RegistrationModule } from './registration.module';

export default {
  title: 'Solargis/Components/Registration',
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        SgDefaultsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientModule,
        TranslocoRootModule,
        RegistrationModule
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: '.' }, provideMockStore()]
    })
  ]
};

export const basic = (props): any => ({
  props,
  template: `
    <sg-registration></sg-registration>
  `
});

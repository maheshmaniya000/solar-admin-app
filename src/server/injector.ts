import { InjectionToken, Injector } from '@angular/core';

import { LtaService, ltaServiceFactory } from '@solargis/prospect-service';

import { ltaNcbinOpts } from './env';
import { prospectOpts } from './models/prospect-config';
import { FUPDataService, fupDataServiceToken } from './service/fup/data/fup-data.service';

// @solargis/prospect-service
export const ltaServiceToken = new InjectionToken<Promise<LtaService>>('LtaService');

export const injector: Injector = Injector.create({
  providers: [
    { provide: fupDataServiceToken, useClass: FUPDataService, deps: [] },
    // lambda-ready services
    {
      provide: ltaServiceToken,
      useFactory: () => ltaServiceFactory(() => ltaNcbinOpts, prospectOpts),
      deps: []
    }
  ]
});
